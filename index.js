var fs = require('fs');

global.window = global;
// Read and eval library
filedata = fs.readFileSync(__dirname+'/fork.js','utf8');
eval(filedata);

/* The quadtree.js file defines a class 'QuadTree' which is all we want to export */

exports.Forks = window.Forks;
exports.Fork = window.Fork;