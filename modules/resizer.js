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
	var validUrl = false;
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
	}
	console.log("Has all? " + hasAll);
	console.log("Valid url? " + validUrl);

	return (hasAll && !queryIsEmpty && validUrl);
};

// Will go and download the image
// Returns false if fails
// Pass in callback(image) image can be null if failed
exports.getOrginalImage = function(query,callback){

	// _.each(query, function(key, val){
	// 	console.log("Key => Val " + key);
	// });

	// Image source
	var s = query.source;
	console.log("Download: " + s);

	var savePath = getImagePath(query.source);
	
	//Create path if does not exist
	console.log("Save path: " + savePath);
	io.mkdir(ORGINAL_IMAGE_PATH);

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
			if(callback !== undefined) callback(null);
		}
	});
	// Finished piping
	req.on("end",function(){
		if(callback !== undefined) callback({});
	});

};

/*
 * Will take the current params and change the orginal image which is assumed to be on the server
 * and will update the size.
 */
exports.changeImage = function(query, callback){

	var widthOrHeight = query.size;
	var nWidth = widthOrHeight;
	var nHeight = widthOrHeight;
	if(widthOrHeight.indexOf("x") != -1){
		 var whArr = s.split("x");
		 nWidth = whArr[0];
		 nHeight = whArr[1];
	}
	var imageSize = {};
	var imageOptions = {
		src : getImagePath(query.source)
	};
	//Get current image on file
	easyimg.info(getImagePath(query.source), function(err, stdout, stderr){
		console.log(stdout);

		var newPath = SIZED_IMAGE_PATH;
		var cWidth, cHeight;
		cWidth = stdout.width;
		cHeight = stdout.height;
		if(cWidth === undefined || cHeight === undefined){
			imageSize =	{ width : nWidth };
			newPath += nWidth;
		}else if(nWidth != nHeight){
			// If new height and size not the same.. check they are no bigger than the current size
			nWidth = Math.min(nWidth,cWidth);
			nHeight = Math.min(nHeight,cHeight);
			//Set new file path
			newPath += nWidth + "x" + nHeight;
			imageSize =	{ 
				height : nHeight,
			 	width : nWidth 
			 };
		}else{
			// resize to to the smallest size
			if(cWidth > cHeight){
				imageSize =	{ width : nWidth };
				newPath += nWidth;
			}else{
				imageSize = { height : nHeight };
				newPath += nHeight;
			}
		}
		// Merge in image size
		imageOptions = _.extend(imageOptions, imageSize);

		// Create the new path
		newPath += pathSep;
		io.mkdir(newPath);

		imageOptions.dst = newPath + stdout.name;

		// Shrink image
		easyimg.resize(imageOptions, function(err, image){
			console.log("Error?: " + err);
		});

	});

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