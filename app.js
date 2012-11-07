var express = require('express'); 
var _ = require("underscore");
var easyImage = require("easyimage");
var resize = require("./modules/resizer");

//Create express app
var app = express();

app.set('title',"NodeSizer");

app.get('/', function(req, res){
  res.send('<p>Welcome to NodeSizer</p>');
});

//Converter
app.get('/convert', function(req, res){
	var validRequest = resize.queryHasValidParams(req.query);

	if(!validRequest){
		// Invalid request
		res.send(400,"<h3>Invalid Request</h3><p>You require, 'source' and 'size' GET queries minimum</p>");
		return;
	}

	resize.getOrginalImage(req.query, function(orginalImage, start, end){
		if(orginalImage == null){
			res.send(404, "<h3>File not found - "+req.query.source+"</h3>");
			return;
		}else{
			//res.setEncoding('binary');
			res.set('Content-Type', 'image/jpeg');
			resize.changeImage(req.query, function(){
				res.send(orginalImage);
			});
			//res.end(new Buffer(orginalImage), 'binary');
		}
	});

});


app.listen(8080);