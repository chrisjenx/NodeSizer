var express = require('express');
var _ = require("underscore");
var easyImage = require("easyimage"),
	fs = require("fs");
var resize = require("./modules/resizer");

//Create express app
var app = express();

app.set('title',"NodeSizer");

app.get('/', function(req, res){
  res.send('<p>Welcome to NodeSizer</p>');
});

//Converter
app.get('/convert', function(req, res){
	// Using static methods:
	var start = Date.now();


	var validRequest = resize.queryHasValidParams(req.query);

	if(!validRequest){
		// Invalid request
		res.send(400,"<h3>Invalid Request</h3><p>You require, 'source' and 'size' GET queries minimum</p>");
		return;
	}

	// Go get the image
	resize.getOrginalImage(req.query, function(sucess){
		if(!sucess){
			res.send(404, "<h3>File not found - "+req.query.source+"</h3>");
			return;
		}else{
			//res.setEncoding('binary');
			res.set('Content-Type', 'image/jpeg');
			resize.changeImage(req.query, function(err, path){
				if(err){

				}else{
					var end = Date.now();
					var elapsed = end - start; // time in milliseconds
					console.log("Convert - elapsed time: " + elapsed + "ms");
					res.set({
					  'Content-Type' : 'image/'+ resize.getImageExt(path),
					  'Content-Creation-Time' : elapsed

					});
					fs.createReadStream(path).pipe(res);
				}
				//res.send(orginalImage);

			});
			//res.end(new Buffer(orginalImage), 'binary');
		}
	});

});





app.listen(8080);