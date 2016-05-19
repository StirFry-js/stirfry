sendFile: function(path, callback) {
	var callbackToUse = callback;
	if (!callback) {
		callbackToUse = (err) => err ? console.log(JSON.stringify(err)):undefined;
	}
	var fullPath = combinePaths(module.exports.home, path);
	var self = this;
	//Start an async process
	asynchronous.start();
	//Read the file at the path
	fs.readFile(fullPath, function(err, data) {
		if (err) {
			callbackToUse(err);
			self.send("");
			asynchronous.end();
			return;
		}
		//Send the data and end the async process after calling the callback
		self.send(data.toString());
		callbackToUse(false);
		asynchronous.end();
	})
},
