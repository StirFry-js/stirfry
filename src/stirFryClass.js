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
		'pre': [],
		'start': [],
		'end': [],
		'exception': []
	}
	var that = this;
	//The function to call on a request
	this.respond = function(req, res) {


		var sendData = '';
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
		//Create a request object
		var request = {
			cookies: parseCookies(req),
			url: req.url,
			method: req.method,
			full: req
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
			#include sendfile.js;
			//A function just to send data
			send: function(data) {
				sendData += data;
			},
			full: res
		}
		var preWaiting = 0;
		//The asynchronous stuff for the preprocessor
		var preAsync = {
			//Function to start waiting
			start: function() {
				preWaiting++;
			},
			//Function to end waiting
			done: function() {
				preWaiting--;

				//Check if everything is done
				if (preWaiting <= 0) {
					that._callGets(request, response, asynchronous);
					if (waiting <= 0) {
						asynchronous.done();
					}
				}
			}
		}
		preAsync.end = preAsync.done;

		that._callPre(request, response, preAsync);
		if (preWaiting <= 0) preAsync.done();

	}

	this.server = http.createServer(this.respond);
	if (listen) {
		this.listen();
	}
}
