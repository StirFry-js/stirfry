"use strict";
//Function to combine to paths
module.exports = function combinePaths(path1, path2) {
    let path1ToUse = path1.slice(-1) == '/' ? path1 : (path1 + '/');
    let path2ToUse = path2.slice(0, 1) == '/' ? path2.slice(1) : path2;
    return path1ToUse + path2ToUse;
}