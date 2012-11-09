var io = require("./io"),
	pathSep = require('path').sep;
var request = require("request"),
	fs = require('fs'),
	url = require('url');
var _ = require("underscore");
var easyimg = require("easyimage");

var ORGINAL_IMAGE_PATH = "images/orginals/";
var SIZED_IMAGE_PATH = "images/sizes/";

// The required resources
exports.QUERIES_REQUIRED = ['source','size'];



// Returns true if query has valid params
exports.queryHasValidParams = function(query){

	console.log("Checking for valid params...");

	var queryIsEmpty = _.isEmpty(query);
	var hasAll = false;
	var validUrl = false,
		validSize = false;
	console.log("isEmpty? " + queryIsEmpty);
	if(!queryIsEmpty){
		_.each(query, function(key, val){
			//console.log("query["+val+"]");
		});
		hasAll = _.all(exports.QUERIES_REQUIRED, function(key, value){
			console.log("Contains '"+key+"'?");
			return _.has(query, key);
		});
		validUrl = !_.isEmpty(url.parse(query.source));
		validSize = isValidSize(query.size);
	}
	console.log("Has all? " + hasAll);
	console.log("Valid url? " + validUrl);

	return (hasAll && !queryIsEmpty && validUrl && validSize);
};

// Will go and download the image
// Returns false if fails
// Pass in callback(success) image can be null if failed
exports.getOrginalImage = function(query,callback){

	// _.each(query, function(key, val){
	// 	console.log("Key => Val " + key);
	// });

	// Image source
	var s = query.source;
	var savePath = getImagePath(query.source);
	console.log("Get Image: " + s);
	console.log("Get Image - Save path: " + savePath);
	
	//Create path if does not exist
	if(getCachedImage(savePath)){
		// pass back success to convert	
		console.log("Get Image - Imaged Cached!");
		callback(true);
		return;
	}else{
		io.mkdir(ORGINAL_IMAGE_PATH);
	}
	var req = request(s);
	req.on('response', function (resp) {
		if (resp.statusCode === 200) {

			// _.each(resp.headers, function(key, val){
			// 	console.log("Key => Val " + key + " " + val);
			// });

			var contentLength = parseInt(resp.headers["content-length"]);			
			if(contentLength === NaN){
				 contentLength = parseInt(resp.headers["Content-Length"]);
			}

			// console.log("Content-Length = " +  contentLength);
			var currByteIndex = 0;
			var responseBody = new Buffer(contentLength);

			//Grab the data object
			// resp.setEncoding('binary');
			// resp.on('data', function (chunk) {
			// 	//Add to buffer
			// 	responseBody.write(chunk, currByteIndex, 'binary');
			// 	currByteIndex += chunk.length;
 		// 	});
 			// resp.on('end', function () {
				// console.log("Downloaded: " + s);
				// //if(callback !== undefined) callback(responseBody);
 			// });
			req.pipe(fs.createWriteStream(savePath));
		} else {
			console.log("Invalid File");
			if(callback !== undefined) callback(false);
		}
	});
	// Finished piping
	req.on("end",function(){
		if(callback !== undefined) callback(true);
	});

};

/*
 * Will take the current params and change the orginal image which is assumed to be on the server
 * and will update the size.
 *
 * query = the request query
 * callback(err, newPath)
 */
exports.changeImage = function(query, callback){

	var orginalImagePath = getImagePath(query.source);
	var imageQuality = getImageQuality(query);
	var imageOptions = {
		src : orginalImagePath,
		quality : imageQuality
	};

	var newPath = SIZED_IMAGE_PATH + getNewUncheckedSizePath(query) + "_" + imageQuality + pathSep + getConvertedImageName(query);
	// Do a simple check for current cached image..
	if(getCachedImage(newPath)){
		callback(null, newPath);
		return;
	}

	// Get the new size object
	calculateNewSize(query, function(err, imageSize){
		if(err){
			callback(err, orginalImagePath);
		}else{
			// Create the new path
			var imageSizePath = imageSize.width;
			if(imageSize.height !== undefined) imageSizePath += "x" +imageSize.height;
			newPath = SIZED_IMAGE_PATH + imageSizePath + "_" + imageQuality + pathSep;
			io.mkdir(newPath);

			// Set the image path
			//imageOptions.dst = newPath = newPath + getImageName(query.source);
			imageOptions.dst = newPath = newPath + getConvertedImageName(query);
			console.log("Convert new image: " + newPath);
			if(getCachedImage(newPath)){
				callback(null, newPath);
				return;
			}
			// Merge in image size
			imageOptions = _.extend(imageOptions, imageSize);

			// Shrink image
			easyimg.resize(imageOptions, function(err, image){
				console.log("Error?: " + err);
				if(err){
					callback(err, getImagePath(query.source));
				}else{
					console.log("ext = " + getImageExt(newPath));
					if(getImageExt(newPath) == "png"){				
						easyimg.exec('optipng -o7 ' + newPath, function(err, stdout, stderr){
							console.log("Convert new image - optipng");
							callback(null, newPath);
						});
					} else {
						callback(null, newPath);
					}
				}
			});
		}
	});
}

/* Unlike calculate size, this does not check the current file to generate a new size.
 * Use this to ONLY see if a file has been created at the requested size before definatly doing it!
 * As calcuating a new size loads the orginal image... which is large can be some heavy lifting!
 *
 * returns 240 or 240x200 etc..
 */
function getNewUncheckedSizePath(query){

	//Raw param
	var widthOrHeight = query.size;
	//Split by 'x' (times char) and seperate the size
	if(widthOrHeight.indexOf("x") != -1){
		 var whArr = widthOrHeight.split("x");
		 return roundSize(whArr[0]) + "x" + roundSize(whArr[1]);
	}else{
		return roundSize(widthOrHeight);
	}
}

// Will try and work out the best size based on the query and current image size
//Callback(err, imageSize/*object*/)
function calculateNewSize(query, callback){

	//Raw param
	var widthOrHeight = query.size;
	// Set to true if user passed in width by height
	var nSizeHandW = false;
	// Set to default raw query
	var nWidth = nHeight = widthOrHeight;
	//Split by 'x' (times char) and seperate the size
	if(widthOrHeight.indexOf("x") != -1){
		 var whArr = widthOrHeight.split("x");
		 nWidth = whArr[0];
		 nHeight = whArr[1];
		 nSizeHandW = true;
	}
	// Empty object to populate
	var imageSize = {};

		//Get current image on file
	easyimg.info(getImagePath(query.source), function(err, stdout, stderr){

		if(err){
			callback(err, null);
			return;
		}

		console.log(stdout);

		//Get current size
		var cWidth, cHeight;
		cWidth = stdout.width;
		cHeight = stdout.height;
		if(cWidth === undefined || cHeight === undefined){
			imageSize =	{ width : roundSize(nWidth) };
		}else if(nSizeHandW){
			// If new height and width make sure they are smaller than the current image.
			nWidth = Math.min(nWidth,cWidth);
			nHeight = Math.min(nHeight,cHeight);
			//Set new file path
			imageSize =	{ 
				height : roundSize(nHeight),
			 	width : roundSize(nWidth)
			 };
		}else{
			// resize to to the smallest size
			if(cWidth >= cHeight){
				imageSize =	{ width : roundSize(Math.min(nWidth,cWidth)) };
			}else{
				var ratio = cHeight/cWidth;
				imageSize = { width : roundSize(ratio * nHeight) };
			}
		}
		callback(null, imageSize);
	});
}

// Simple way of bucketing the sizes to 10 pixel ranges
function roundSize(number){

	if(number >= 10){
		return Math.floor(number / 10) * 10
	}
	return number;
}

function isValidSize(sizeString){
	//Split by 'x' (times char) and seperate the size
	if(sizeString === undefined) return false;
	var w,h;
	if(sizeString.indexOf("x") != -1){
		 var whArr = sizeString.split("x");
		 w = new Number(whArr[0]);
		 h = new Number(whArr[1]);
		 if(!_.isNumber(w) || !_.isNumber(h)) return false;
		 if(w <= 0 || h <= 0) return false;
	}else{
		w = new Number(sizeString);
		if(!_.isNumber(w) || w <= 0) return false;
	}
	return true;
}


//return the image extention
var getImageExt = function(path){
	var imageExtention = _.last(path.split("."));
	return imageExtention;
}
exports.getImageExt = getImageExt;

// find cached image
// return success /* true/false */
function getCachedImage(path){

	if(!io.fileExistsSync(path)){
		// File does not exist so.. doenst really matter
		return false;
	}else{
		// Should exist
		return true;
	}
}

// returns a number for quality image defaults to 80 
function getImageQuality(query){
	var qual = 80;
	if(query.quality !== undefined && _.isNumber(new Number(query.quality))){
		qual = Math.max(1, Math.min(100, query.quality));
	}
	console.log("Convert image - quality : " + qual);
	return qual;
}

// Will return the image name with the new extention
function getConvertedImageName(query){
	var imageName = getImageName(query.source);
	var imageNameNoExt = imageName.slice(0, imageName.lastIndexOf("."));
	if(query.ext !== undefined){
		if(query.ext.indexOf(".") == -1){
			imageNameNoExt += ".";
		}
		imageName = imageNameNoExt + query.ext;
	}else{
		imageName = imageNameNoExt + ".png";
	}
	return imageName;
}

// Returns the path for the source image
function getImagePath(source){
	var urlPath = url.parse(source).path;	
	var lastPath = _.last(urlPath.split("/"));
	var savePath = ORGINAL_IMAGE_PATH + lastPath;
	return savePath;
}

// Get the last part of the path
function getImageName(source){
	var urlPath = url.parse(source).path;
	var lastPath = _.last(urlPath.split("/"));
	return lastPath;
}