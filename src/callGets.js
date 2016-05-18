var ending = false;
function end() {
	ending = true;
}

//Function to call all the get request
StirFry.prototype._callGets = function(req, res, asynchronous) {
	ending = false;
	//Loop through all the gets
	for (var i = 0; i < this.listens['get'].length; i++) {
		//If its a regex
		if (this.listens['get'][i].options.regex) {
			//If the regex matches where i add ^ to the begginning and $ to the end
			if (RegExp('^' + this.listens['get'][i].options.url.source + "$").test(req.url)) {
				//Call it with the request parameters as an array
				req.params = RegExp('^' + this.listens['get'][i].options.url.source + "$").exec(req.url).slice(1);
				this.listens['get'][i].call(req, res, end, asynchronous);
				delete req.params;
				if (ending) {
					break;
				}
			}
		}
		//Else if it is the same
		else if (this.listens['get'][i].options.url == req.url) {

			this.listens['get'][i].call(req, res, end, asynchronous);

			if (ending) {
				break;
			}
		}

	}
}
