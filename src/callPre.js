
//Function to call all the pre processor requests
StirFry.prototype._callPre = function(req, res, asynchronous) {
	if (!req.params) req.params = {};
	ending = false;
	//Loop through all the pre processors
	for (var i = 0; i < this.listens['pre'].length; i++) {
		//If its a regex
		if (this.listens['pre'][i].options.regex) {
			//If the regex matches where i add ^ to the begginning and $ to the end
			if (RegExp('^' + this.listens['pre'][i].options.url.source + "$").test(req.url)) {
				//Call it with the request parameters as an array
				var params = RegExp('^' + this.listens['pre'][i].options.url.source + "$").exec(req.url).slice(1);
				//Loop through params and set req.params[i] to equal params[i]
				for (var i in params) req.params[i] = params[i];
				this.listens['pre'][i].call(req, res, end, asynchronous, this);
				for (var i in params) delete req.params[i];
				if (ending) {
					break;
				}
			}
		}
		//Else if it is the same
		else {
			var keys = [];
			var params = (pathToRegexp(this.listens['pre'][i].options.url, keys).exec(req.url));
			console.log(keys);
			if (params) {
				params = params.slice(1)
				//Loop through params and set req.params[i] to equal params[i]
				for (var i in params) req.params[keys[i].name] = params[i];
				this.listens['pre'][i].call(req, res, end, asynchronous, this);
				for (var i in params) delete req.params[keys[i].name];

				if (ending) {
					break;
				}
			}
		}

	}
}
