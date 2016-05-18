/**
 * Creates a new Stir Fry server
 * @class
 * @param {integer} Port - The port for the server to listen on
 * @param {string} IP - The IP for the server to listen on
 * @param {callback} Callback - Optional, runs as soon as the server starts
 *
 *
 * */
function StirFry(port, ip) {
	//If ip is not a string than it is the callback so just use '127.0.0.1' as the ip
	var ipToUse = typeof ip == 'string' ? ip:'127.0.0.1';
	var listen = true;
	//If port is a boolean
	if (typeof port == 'boolean') listen = port;
	//Initialize all of the properties
	this.port     = port;
	this.ip       = ipToUse;
	this.listens  = {
		'get': [],
		'post': [],
		'start': [],
		'end': [],
		'exception': []
	}
	var that = this;
	//The function to call on a request
	this.respond = function(req, res) {
		var waiting = 0;
		var asynchronous = {
			start: function() {
				waiting++;
			},
			done: function() {
				waiting--;
				if (waiting <= 0) {
					res.end(sendData);
				}
			}
		}
		asynchronous.end = asynchronous.done;

		var sendData = '';
		//Create a request object
		var request = {
			cookies: parseCookies(req),
			url: req.url,
			method: req.method,
			httpRequest: req
		}

		//Function to set a cookie
		request.cookies.set	= function(name, value) {
			//Set the cookie plus ;name=value
			res.writeHead(200, {
				'Set-Cookie': (req.headers.cookie) + name + '=' + value + ';'
			});
		}


		//Create a response object
		var response = {
			//A function to send a file at a certain path
			sendFile: function(path, callback) {
				var callbackToUse = callback;
				if (!callback) {
					callbackToUse = (err) => console.log(JSON.stringify(err));
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
			//A function just to send data
			send: function(data) {
				sendData += data;
			},
			http: res
		}



		that._callGets(request, response, asynchronous);
		if (waiting <= 0) {
			asynchronous.done();
		}

	}

	this.server = http.createServer(this.respond);
	if (listen) {
		this.listen();
	}
}
