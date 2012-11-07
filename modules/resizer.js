var io = require("./io");
var request = require("request"),
	fs = require('fs'),
	url = require('url');
var _ = require("underscore");
var easyImage = require("easyimage");

var ORGINAL_IMAGE_PATH = "images/orginals/";

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

	var urlPath = url.parse(s).path;	
	var lastPath = _.last(urlPath.split("/"));
	var savePath = ORGINAL_IMAGE_PATH + lastPath;

	
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
			resp.setEncoding('binary');
			resp.on('data', function (chunk) {
				//Add to buffer
				responseBody.write(chunk, currByteIndex, 'binary');
				currByteIndex += chunk.length;
 			});
 			resp.on('end', function () {
				console.log("Downloaded: " + s);
				if(callback !== undefined) callback(responseBody);
 			});
			req.pipe(fs.createWriteStream(savePath));
		} else {
			console.log("Invalid File");
			if(callback !== undefined) callback(null);
		}
	});

};


