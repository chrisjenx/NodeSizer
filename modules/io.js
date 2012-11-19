var fs = require('fs'),
	rr = require('rimraf');
var pathSep = require('path').sep;


var mkdir = function(path, root) {

    var dirs = path.split(pathSep), dir = dirs.shift(), root = (root||'')+dir+pathSep;

    try { fs.mkdirSync(root); }
    catch (e) {
        //dir wasn't made, something went wrong
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }

    return !dirs.length || mkdir(dirs.join(pathSep), root);
};
// RETURNS true or false depending if it exists
var fileExistsSync = function(path){

	try {
		return fs.existsSync(path);
	    // Query the entry
	    // var stats = fs.lstatSync(path);

	    // // Is it a directory?
	    // if (stats.isDirectory()) {
	    //     // Yes it is
	    // }else if(stats.isFile()){
	    // 	// Yes it is
	    // 	return true;
	    // }
	}
	catch (e) {
	}
	return false;

};

var removeImagesPath = function(){
	rmFolder("./images/");
}

function rmFolder(path){
	rr(path,function(err){
		console.log("Error deleting path " + err);
	});
}

exports.mkdir = mkdir;
exports.fileExistsSync = fileExistsSync;
exports.removeImagesPath = removeImagesPath;