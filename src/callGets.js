var ending = false;
function end() {
	ending = true;
}

//Function to call all the get request
StirFry.prototype._callRequests = function(req, res, asynchronous) {
	if (!req.params) req.params = {};
	ending = false;
	//Loop through all the gets
	for (var i = 0; i < this.listens['request'].length; i++) {
		//If its a regex
		if (this.listens['request'][i].options.regex) {
			//If the regex matches where i add ^ to the begginning and $ to the end
			if (RegExp('^' + this.listens['request'][i].options.url.source + "$").test(req.url)) {
				//Call it with the request parameters as an array
				var params = RegExp('^' + this.listens['request'][i].options.url.source + "$").exec(req.url).slice(1);
				//Loop through params and set req.params[i] to equal params[i]
				for (var i in params) req.params[i] = params[i];
				this.listens['request'][i].call(req, res, end, asynchronous, this);
				for (var i in params) delete req.params[i];
				if (ending) {
					break;
				}
			}
		}
		//Else if it is the same
		else {
			var keys = [];
			var params = (pathToRegexp(this.listens['request'][i].options.url, keys).exec(req.url) || []).slice(1);
			console.log(params, req.url);
			console.log(keys);
			if (params.length >= 1) {

				//Loop through params and set req.params[i] to equal params[i]
				for (var i in params) req.params[keys[i].name] = params[i];
				console.log(req.params);
				this.listens['request'][i].call(req, res, end, asynchronous, this);
				for (var i in params) delete req.params[keys[i].name];

				if (ending) {
					break;
				}
			}
		}

	}
}
