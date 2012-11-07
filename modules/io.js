var fs = require('fs');
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
exports.mkdir = mkdir;