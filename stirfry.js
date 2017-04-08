'use strict';

const pathToRegexp = require('path-to-regexp');
const http = require('http');
const https = require('https');
const fs = require('fs');
const pathFuncs = require('path');
const parse = require('./utils/parse');
const combinePaths = require('./utils/combinePaths');

const defaultExtension = 'html';

const types = require(`${__dirname}/types`);

/**
 * Creates a new Stir Fry server
 * @class
 * @param {integer} port - The port for the server to listen on
 * @param {string} ip - The IP for the server to listen on
 * @param {callback} callback - Optional, runs as soon as the server starts
 *
 *
 * */
function StirFry() {
	// If ip is not a string than it is the callback so just use '127.0.0.1' as the ip
	//const ipToUse = typeof ip === 'string' ? ip : '127.0.0.1';
	//let listen = true;
	//Loop through the inputs and find every string, integer, function, and boolean
	//if (typeof port === 'boolean') listen = port;

	let options = {
		listen: true
	};
	let port = 8080;
	let ip = '127.0.0.1';
	let callback = function() {};

	for (let i = 0; i < arguments.length; i++) {
		switch (typeof arguments[i]) {
		case 'object':
			options = arguments[i];
			break;
		case 'string':
			ip = arguments[i];
			break;
		case 'number':
			port = arguments[i];
			break;
		case 'function':
			callback = arguments[i];
			break;
		}
	}

	// Initialize all of the properties
	this.port = port;
	this.ip = ip;
	this.listens = {
		request: [],
		pre: [],
		start: [],
		end: [],
		exception: [],
		processor: []
	};
	this.layers = {
		request: true,
		pre: true,
		processor: true
	};
	this.layerOrder = ['processor', 'pre', 'request'];
	const that = this;
	
	// The function to call on a request
	this.respond = function (req, res) {
		// Create a request object
		const request = {
			url: decodeURIComponent(req.url),
			method: req.method,
			full: req,
			ip: req.connection.remoteAddress,
			connection: req.connection,
			headers: req.headers
		};
		// Create a response object
		const response = {
			// A function to send a file at a certain path
			sendFile: function(path, callback) {
				let callbackToUse = callback;

				if (!callback) {
					callbackToUse = (err) => {
						if (err) {
							that.throwError(new Error(err), err);
						}
					};
				}
				let fullPath = path;

				if (!pathFuncs.isAbsolute(path)) {
					fullPath = pathFuncs.relative(module.exports.home, path);
				}
				const self = this;
				// Start an async process

				this.async.start();
				// Read the file at the path
				fs.readFile(fullPath, (err, data) => {
					if (err) {
						callbackToUse(err);
						self.send('');
						self.async.end();
						return;
					}
					// Send the data and end the async process after calling the callback
					self.send(data);
					// Get the file extension
					const fileExtension = pathFuncs.extname(path).slice(1);

					res.writeHead(200, {
						'Content-Type': types[fileExtension]
					});
					callbackToUse(false);
					self.async.end();
				});
			},

			// A function just to send data
			send: function(data) {
				this.response = Buffer.concat([this.response, Buffer(data)]);
			},
			full: res,
			redirect: function(url) {
				res.writeHead(302, {
					Location: url
				});
				res.end();
			},
			setHeader: function(header, value) {
				res.setHeader(header, value);
			},
			writeHead: function(code, obj) {
				res.writeHead(code, obj);
			},
			write: function(val) {
				res.write(val);
			},
			stop: function(data) {
				res.end(Buffer(data));
			},
			end: function(data) {
				res.end(Buffer.concat([this.response, Buffer(data)]));
			},
			reset: function() {
				this.response = '';
			}
		};

		response.response = new Buffer('');
		let currentLayer = -1;
		const self = that;

		function callNextLayer() {
			currentLayer += 1;
			if (currentLayer < self.layerOrder.length) {
				const async = {
					waiting: 0,
					// Function to start waiting
					start: function() {
						this.waiting += 1;
					},
					// Function to end waiting
					done: function() {
						this.waiting -= 1;

						// Check if everything is done
						if (this.waiting <= 0) {
							if (currentLayer < self.layerOrder.length - 1) callNextLayer();
							else res.end(response.response);
						}
					}
				};

				async.end = async.done;
				request.async = async;
				response.async = async;
				self._callLayer(self.layerOrder[currentLayer], request, response, async);
				if (async.waiting <= 0) async.done();
			}
		}
		callNextLayer();
	};


	this.server = http.createServer(this.respond);
	if (options.listen) {
		this.listen(callback);
	}
	this.process((req, res, ef, async) => {
		// Retrieve post data
		async.start();

		let postData = '';

		req.full.on('data', (data) => {
			postData += data;

			// Too much POST data, kill the connection!
			// 1e8 === 1 * Math.pow(10, 8) === 1 * 100000000 ~~~ 100MB
			if (postData.length > 1e8) {
				req.connection.destroy();
			}
		});
		req.full.on('end', () => {
			req.post = parse(postData);
			async.done();
		});
	});

	this.process((req) => {
		// Split the request by ?
		const split = req.url.split('?');
		// res.send(split);

		if (split[1]) {
			// Clone req.url to req.fullUrl
			req.fullUrl = req.url.slice(0);
			// Now parse it
			const parsed = parse(split[1]);

			req.url = split[0];
			// res.send(JSON.stringify(parsed));

			const params = parsed;

			for (const i in req.params) {
				params[i] = req.params[i];
			}
			req.params = params;
			// res.send(JSON.stringify(req.params));
		}
	});
}

// An express style router
StirFry.extension = function () {
	return new StirFry({listen: false});
};
StirFry.https = function(port, ip, cert) {
	if (typeof ip == 'object') {
		cert = ip;
		ip = '127.0.0.1';
	}
	const server = new StirFry({listen: false});

	server.server = https.createServer(cert, this.respond);
	server.ip = ip;
	server.port = port;
	server.listen();

	return server;
};

StirFry.router = StirFry.extension;
/**
 * Starts the server listening on the port and ip that were inputted during the construction
 * @param {callback} Callback - Optional, runs when the server starts
 * @returns {void}
 *
 * */
StirFry.prototype.listen = function () {
	const self = this;
	// Get only number input
	const portToUse = (function () {
		let onlyNum;

		for (const i in arguments) {
			if (typeof arguments[i] === 'number') {
				onlyNum = arguments[i];
			}
		}
		return onlyNum || self.port;
	})();
	// Get the only string inputted
	const ipToUse = (function () {
		let onlyString;

		for (const i in arguments) {
			if (typeof arguments[i] === 'string') {
				onlyString = arguments[i];
			}
		}
		return onlyString || self.ip;
	})();
	// Get the only function input
	const callbackToUse = (function () {
		let onlyFunc;

		for (const i in arguments) {
			if (typeof arguments[i] === 'function') {
				onlyFunc = arguments[i];
			}
		}
		return onlyFunc || function (e) {
			if (e) {
				self.throwError(new Error(e), e);
			}
		};
	})();

	this.server.listen(portToUse, ipToUse, function () {
		self.close = function () {
			self.server.close();
			delete self.close;
		};
		callbackToUse.apply(self, arguments);
	});
	
};
/**
 * Listens for an event and call a function when it happen
 * @param {string} event - The type of event to listen for
 * @param {object} options - Options for listening
 * @param {callback} call - The function to call on the event, it will get inputs depending on what event it is
 * @param {onetime} onetime - Whether or not the handler can be used more than once
 * @example
 * let StirFry = require('stirfry');
 * let server = new StirFry(8080, '127.0.0.1');
 * server.on('get', {url: '/abc.*', regex: true}, function(req, res) {
 *	 res.send(req.url);
 * });
 * @returns {void}
 * */
StirFry.prototype.on = function (event, options, call, onetime) {
	// If call is undefined that means that actually options is undefined so set
	let callToUse = call;

	if (typeof options === 'function') {
		callToUse = options;
	}
	// If this is a defined event
	if (this.listens[event]) {
		// If its a get
		if (this.layers[event]) {
			// Push an object where the url is the options input and whether is regex or not is set automagically
			this.listens[event].push({
				options: {
					url: options,
					regex: options.constructor.name === 'RegExp',
					onetime: onetime
				},
				call: callToUse
			});
			return;
		}
		// Push it
		this.listens[event].push({
			options: options,
			call: callToUse
		});
	}
	else {
		// Say that they requested a nonexistent event
		this.throwError(new Error(event + ' is not an event that has been defined'), event + ' is not an event that has been defined');
	}
};


// Function to call all the exceptions
StirFry.prototype._callExceptions = function (err) {
	// Loop through
	for (let i = 0; i < this.listens.exception.length; i++) {
		// Call the exception
		this.listens.exception[i].call(err);
	}
};
let ending = false;

function end() {
	ending = true;
}

// A function to call the inputed layer
StirFry.prototype._callLayer = function (layer, req, res, asynchronous) {
	if (!req.params) req.params = {};
	ending = false;
	// Loop through all the gets
	for (let i = 0; i < this.listens[layer].length; i++) {
		// If its a regex
		if (this.listens[layer][i].options.regex) {
			// If the regex matches where i add ^ to the begginning and $ to the end
			if (RegExp('^' + this.listens[layer][i].options.url.source + '$').test(req.url)) {
				// Call it with the request parameters as an array
				const params = RegExp('^' + this.listens[layer][i].options.url.source + '$').exec(req.url).slice(1);
				// Loop through params and set req.params[i] to equal params[i]

				for (const k in params) req.params[k] = params[k];
				this.listens[layer][i].call(req, res, end, asynchronous, this);
				for (const k in params) delete req.params[k];

				if (this.listens[layer][i].options.onetime) this.listens[layer].splice(i, 1);

				if (ending) {
					break;
				}
			}
		}
		// Else if it is the same
		else {
			const keys = [];
			let params = pathToRegexp(this.listens[layer][i].options.url, keys).exec(req.url);

			if (params) {
				params = params.slice(1);
				// Loop through params and set req.params[i] to equal params[i]
				for (const k in params) req.params[keys[k].name] = params[k];
				this.listens[layer][i].call(req, res, end, asynchronous, this);
				for (const k in params) delete req.params[keys[k].name];

				if (this.listens[layer][i].options.onetime) this.listens[layer].splice(i, 1);

				if (ending) {
					break;
				}
			}
		}

	}
};


StirFry.prototype.createLayer = function (name) {
	if (this.listens[name]) {
		this.throwError(new Error('There is already a listener defined as ' + name), 'There is already a listener defined as ' + name);
	}
	this.listens[name] = [];
	this.layers[name] = true;
	this.layerOrder.push(name);
};

StirFry.prototype.destroyLayer = function (layer) {
	if (!this.layers[layer]) {
		this.throwError(new Error('There is no layer of the name ' + layer), 'There is no layer of the name ' + layer);
	}
	delete this.listens[layer];
	this.layers[layer] = false;
	this.layerOrder.splice(this.layerOrder.indexOf(layer), 1);
};

StirFry.prototype.placeLayer = function (layer, after) {
	this.layerOrder.splice(this.layerOrder.indexOf(layer), 1);
	this.layerOrder.splice(this.layerOrder.indexOf(after) + 1, 0, layer);
};
// Function to call all the get request
StirFry.prototype._callRequests = function (req, res, asynchronous) {
	this._callLayer('request', req, res, asynchronous);
};

// Function to call all the pre processor requests
StirFry.prototype._callPre = function (req, res, asynchronous) {
	this._callLayer('pre', req, res, asynchronous);

};

// Function to call all the pre processor requests
StirFry.prototype._callProcessors = function (req, res, asynchronous) {
	this._callLayer('processor', req, res, asynchronous);
};

// Just a bunch of aliases
/**
 * Will listen on a target layer as an input string instead of the normal hard coded strings
 * @param {string} Layer - The layer to call
 * @param {string/regexp} Url - Can be a string or regexp, it gets tested against the url to see if it should be called
 * @param {callback} Callback - Gets called when there is a request on that url in that layer placement. Takes a request and response object as an input, plus optionally the "end" and "async" objects
 * @example
 * let StirFry = require('stirfry');
 * let server = new StirFry(8080, '0.0.0.0');
 * server.addLayer("example layer");
 * server.placeLayer("example layer", "pre");
 * server.addListenerOnLayer("example layer", function(req, res) {
 *	  res.send("test");
 * });
 * @returns {void}
 * 
 */
StirFry.prototype.addListenerOnLayer = function () {
	if (typeof arguments[0] !== 'string') this.throwError(new Error('Layer is not string'), 'Layer is not a string');
	let options = arguments[1];
	let callToUse = arguments[2];
	// If there is only 1 argument

	if (arguments.length == 2 || typeof arguments[2] == "boolean" && arguments.length == 3) {
		options = /.*/;
		callToUse = arguments[1];
	}
	if (arguments.length == 3 && typeof arguments[1] == "boolean") {
		arguments[3] = arguments[2];
	}
	// Push an object where the url is the options input and whether is regex or not is set automagically
	this.on(arguments[0], options, callToUse, arguments[3]);
};
/**
 * Is the same as StirFry.on('request')
 * @param {string/regexp} Url - Can be a string or regex, it gets tested against the request url to see if it should be called
 * @param {callback} Call - Gets called when there is a get request that matches the url letiable, takes a request object and a response object as an input,
 * @example
 * let StirFry = require('./index');
 * //Create a new stir fry server
 * let server = new StirFry(8080, '0.0.0.0');
 * //On any get request reply with the url
 * server.request('/', function(req, res) {
 *     res.send(req.url);
 * });
 * @returns {void}
 * */
StirFry.prototype.request = function () {
	let options = arguments[0];
	let callToUse = arguments[1];
	// If there is only 1 argument

	if (arguments.length == 1 || typeof arguments[1] == "boolean" && arguments.length == 2) {
		options = /.*/;
		callToUse = arguments[0];
	}
	if (arguments.length == 2 && typeof arguments[1] == "boolean") {
		arguments[2] = arguments[1];
	}
	// Push an object where the url is the options input and whether is regex or not is set automagically
	this.on('request', options, callToUse, arguments[2]);
};
StirFry.prototype.req = StirFry.prototype.request;
/**
 * A function to preprocess requests in the middle async layer before it gets served
 * @param {string} Request - Optional, the request that this preprocessor gets triggered on. If left empty this will trigger on all requests
 * @param {callback} Preprocessor - The function that gets called to preprocess, you can change the request and response objects
 * @example
 *  //An example that adds a rendering engine to the response object
 * 	server.pre(function(request, response) {
 * 		response.render = function(str, opts) {
 * 			return ejs.render(str, opts);
 *  	}
 * 	})
 * @returns {void}
 * */
StirFry.prototype.pre = function () {
	let options = arguments[0];
	let callToUse = arguments[1];
	// If there is only 1 argument

	if (arguments.length == 1 || typeof arguments[1] == "boolean" && arguments.length == 2) {
		options = /.*/;
		callToUse = arguments[0];
	}
	if (arguments.length == 2 && typeof arguments[1] == "boolean") {
		arguments[2] = arguments[1];
	}
	// Push an object where the url is the options input and whether is regex or not is set automagically
	this.on('pre', options, callToUse, arguments[2]);
};
/**
 * A function to preprocess requests in the first async layer before it gets served
 * @param {string} Request - Optional, the request that this preprocessor gets triggered on. If left empty this will trigger on all requests
 * @param {callback} Preprocessor - The function that gets called to preprocess, you can change the request and response objects
 * @example
 *  //An example that adds a rendering engine to the response object
 * 	server.process(function(request, response) {
 * 		response.render = function(str, opts) {
 * 			return ejs.render(str, opts);
 *  	}
 * 	})
 * @returns {void}
 * */
StirFry.prototype.process = function () {
	let options = arguments[0];
	let callToUse = arguments[1];
	// If there is only 1 argument

	if (arguments.length == 1 || typeof arguments[1] == "boolean" && arguments.length == 2) {
		options = /.*/;
		callToUse = arguments[0];
	}
	if (arguments.length == 2 && typeof arguments[1] == "boolean") {
		arguments[2] = arguments[1];
	}
	// Push an object where the url is the options input and whether is regex or not is set automagically
	this.on('processor', options, callToUse, arguments[2]);
};

/**
 * A shorthand function to create listeners quickly
 * @param {string} response - The response for that request
 * @param {string|RegExp} request - The url of request that it responds too
 * @example
 * //This sends the url of the request, when you say ${anything} it tries to find that in the request or response object, and if it cant it just sends ${url}.
 * server.send("${url}")
 * @returns {void}
 * */
StirFry.prototype.send = function (response, request) {
	request = request || /.*/;
	this.req(request, (req, res) => {
		let send = response;

		for (const i in req) {
			send = send.replace('${' + i + '}', req[i]);
		}
		for (const i in res) {
			send = send.replace('${' + i + '}', res[i]);
		}
		res.send(send);
	});
};

/**
 * A shorthand function to create listeners that send files quickly
 * @param {string} filename - The file name to se d
 * @param {string|RegExp} request - The url of request that it responds too
 * @example
 * //This sends the url of the request, when you say ${anything} it tries to find that in the request or response object, and if it cant it just sends ${url}.
 * server.send("${url}");
 * @returns {void}
 * */
StirFry.prototype.sendFile = function (filename, request) {
	request = request || /.*/;
	this.req(request, (req, res) => {
		res.sendFile(filename);
	});
};

// Static file server
/**
 * Generates a response function for the desired folder for serving static files.
 * @param {string} path - Optional, the home path to serve files from
 * @param {boolean} ending - The default file extension
 * @param {callback} handler - The error handler
 * @returns {function} Function for input into .req
 * */
StirFry.static = function (path, ending, handler) {
	let pathToUse = path;

	if (!path && !ending) {
		pathToUse = '';
		ending = module.exports.defaultExtension;
	}
	if (path && !ending) {
		if (typeof path !== 'string') {
			pathToUse = '';
			ending = module.exports.defaultExtension;
		}
		// pathToUse = combinePaths(module.exports.home, pathToUse);
	}
	if (typeof ending == 'function') {
		handler = ending;
		ending = module.exports.defaultExtension;
	}
	if (typeof handler == 'undefined') {
		handler = function(err, req, res) {
			res.send(err);
		};
	}

	// Return a function
	return function (req, res, end, async) {
		// Check if the request is a folder
		const combinedPath = combinePaths(pathToUse, req.url);

		async.start();
		fs.lstat(pathFuncs.isAbsolute(combinedPath) ? combinedPath : combinePaths(module.exports.home, combinedPath), (err, stats) => {
			if (err) {
				handler(err, req, res, end, async);
				async.end();
				return;
			}
			// Find out if it is a directory
			const isDir = stats.isDirectory();
			// Generate a path that has index.{extension} if needed
			const pathToUse = isDir ? combinePaths(combinedPath, 'index.' + ending || module.exports.defaultExtension) : combinedPath;
			// Read the file now

			res.sendFile(pathToUse);
			async.end();

		});
	};
};

/**
 * Puts all of the listeners from the given server into the current server.
 * WARNING: 
 * This does not add custom layers even though it adds the listeners from those
 * 
 * @param {object} obj - The server to add
 * @returns {void}
 * 
 */
StirFry.prototype.use = function (obj) {
	if (obj.listens) {
		// Add all its listeners
		for (const i in obj.listens) {
			for (const k in obj.listens[i]) {
				this.listens[i][k] = obj.listens[i][k];
			}
		}
		return;
	}
};

StirFry.prototype.throwError = function(error, message) {
	this._callExceptions(message);
	this.throw(error);
};

StirFry.prototype.throw = function(error) {
	console.error(error);
};

// A logger use
StirFry.logger = require('./utils/logger');

// Set module exports to equal the server constructor
module.exports = StirFry;
module.exports.defaultExtension = defaultExtension;
module.exports.home = pathFuncs.dirname(require('require-main-filename')());