
//Function to call all the pre processor requests
StirFry.prototype._callPre = function(req, res, asynchronous) {
	ending = false;
	//Loop through all the pre processors
	for (var i = 0; i < this.listens['pre'].length; i++) {
		//If its a regex
		if (this.listens['pre'][i].options.regex) {
			//If the regex matches where i add ^ to the begginning and $ to the end
			if (RegExp('^' + this.listens['pre'][i].options.url.source + "$").test(req.url)) {
				//Call it with the request parameters as an array
				req.params = RegExp('^' + this.listens['pre'][i].options.url.source + "$").exec(req.url).slice(1);
				this.listens['pre'][i].call(req, res, end, asynchronous);
				delete req.params;
				if (ending) {
					break;
				}
			}
		}
		//Else if it is the same
		else if (this.listens['pre'][i].options.url == req.url) {

			this.listens['pre'][i].call(req, res, end, asynchronous);

			if (ending) {
				break;
			}
		}

	}
}
