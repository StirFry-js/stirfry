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
		'request': [],
		'pre': [],
		'start': [],
		'end': [],
		'exception': [],
		'processor': []
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
			url: req.url,
			method: req.method,
			full: req,
			ip: req.connection.remoteAddress,
			connection: req.connection,
			headers: req.headers
		}


		//Create a response object
		var response = {
			//A function to send a file at a certain path
			#include sendfile.js;
			//A function just to send data
			send: function(data) {
				sendData += data;
			},
			full: res,
			redirect: function(url) {
				res.writeHead(302, {'Location': url});
				res.end();
			},
			setHeader: res.setHeader,
			statusCode: res.statusCode,
			statusMessage: res.statusMessage
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
					that._callRequests(request, response, asynchronous);
					if (waiting <= 0) {
						asynchronous.done();
					}
				}
			}
		}
		preAsync.end = preAsync.done;

		var prePreWaiting = 0;
		//The asynchronous stuff for the first layer
		var prePreAsync = {
			//Function to start waiting
			start: function() {
				prePreWaiting++;
			},
			//Function to end waiting
			done: function() {
				prePreWaiting--;

				//Check if everything is done
				if (prePreWaiting <= 0) {
					that._callPre(request, response, preAsync);
					if (preWaiting <= 0) {
						preAsync.done();
					}
				}
			}
		}
		preAsync.end = preAsync.done;

		that._callProcessors(request, response, prePreAsync);
		if (prePreWaiting <= 0) prePreAsync.done();

	}


	this.server = http.createServer(this.respond);
	if (listen) {
		this.listen();
	}
	#include processors.js;
}
