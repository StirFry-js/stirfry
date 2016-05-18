/**
 * Generates a response function for the desired folder for serving static files.
 * @param {string} Path - Optional, the home path to serve files from
 * @param {boolean} End - Optional, whether
 * */
StirFry.static = function(path, ending) {
	var pathToUse = path;
	var endToUse = ending;
	if (!path && !ending) pathToUse = '';
	if (path && !ending) if (typeof path != 'string') {
		pathToUse = '';
		endToUse = path;
	}
	//pathToUse = combinePaths(module.exports.home, pathToUse);

	//Return a function
	return function (req, res, end, async) {
		//Check if the request is a folder
		var combinedPath = combinePaths(pathToUse, req.url);
		async.start();
		fs.lstat(combinePaths(module.exports.home, combinedPath), function(err, stats) {
			if (err) {
				console.log(err);
				async.end();
				return;
			}
			//Find out if it is a directory
			var isDir = stats.isDirectory();
			//Generate a path that has index.{extension} if needed
			var pathToUse = isDir ? combinePaths(combinedPath, 'index.' + module.exports.defaultExtension):combinedPath;
			//Read the file now
			res.sendFile(pathToUse);
			async.end();
		});
	}
}
