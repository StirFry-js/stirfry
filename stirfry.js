//This code has been precompiled, please do not edit it. If you would like to make your own changes visit our github
//TODO: Split the library up into files to make it easier to work on
//When #include filename.js works, but you need a semicolon, relative paths dont work, and it cant start with a slash, the code gets compiled into stirfry.js
var http = require('http');
var fs   = require('fs');
var defaultExtension = 'html';

//Set module exports to equal the server constructor
module.exports 		= StirFry;
module.exports.defaultExtension = defaultExtension;
module.exports.home = ((require.main || module).filename).split('/').slice(0, -1).join('/');
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
}


/**
 * Starts the server listening on the port and ip that were inputted during the construction
 * @param {callback} Callback - Optional, runs when the server starts
 *
 *
 * */
StirFry.prototype.listen = function(callback) {
	var call = callback || function(e) {
		if (e) {
			console.error(e);
			this._callExceptions(e);
		}
	}

	this.server.listen(this.port, this.ip, call);
}
/**
 * Listens for an event and call a function when it happens
 * @param {string} Event - The type of event to listen for
 * @param {object} Options - Options for listening
 * @param {callback} Callback - The function to call on the event, it will get inputs depending on what event it is
 * @example
 * var StirFry = require('stirfry');
 * var server = new StirFry(8080, '127.0.0.1');
 * server.on('get', {url: '/abc.*', regex: true}, function(req, res) {
 *     res.send(req.url);
 * });
 * server.listen();
 * */
StirFry.prototype.on = function(event, options, call) {
	//If call is undefined that means that actually options is undefined so set
	var callToUse = call;
	if (typeof options == 'function') {
		callToUse = options;
	}
	//If this is a dezfined event
	if (this.listens[event]) {
		//If its a get
		if (event == 'get' || event == 'pre' || event == 'processor') {
			//Push an object where the url is the options input and whether is regex or not is set automagically
			this.listens[event].push({options: {url: options, regex: options.constructor.name == 'RegExp'}, call: callToUse});
			return;
		}
		//Push it
		this.listens[event].push({options: options, call: callToUse});
	}
	else {
		//Say that they requested a nonexistent event
		console.error(event + " is not an event that has been defined");
	}
}

//Function to parse cookies
/*
Written by Corey Hart from stackoverflow
*/
function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}

//Function to call all the exceptions
StirFry.prototype._callExceptions = function(err) {
	//Loop through
	for (var i = 0; i < this.listens['exception'].length; i++) {
		//Call the exception
		this.listens['exception'][i].call(err);
	}
}
//Include callgets
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

//Include call pres

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

//Include call processors

//Function to call all the pre processor requests
StirFry.prototype._callProcessors = function(req, res, asynchronous) {
	ending = false;
	//Loop through all the pre processors
	for (var i = 0; i < this.listens['processor'].length; i++) {
		//If its a regex
		if (this.listens['processor'][i].options.regex) {
			//If the regex matches where i add ^ to the begginning and $ to the end
			if (RegExp('^' + this.listens['processor'][i].options.url.source + "$").test(req.url)) {
				//Call it with the request parameters as an array
				req.params = RegExp('^' + this.listens['processor'][i].options.url.source + "$").exec(req.url).slice(1);
				this.listens['processor'][i].call(req, res, end, asynchronous);
				delete req.params;
				if (ending) {
					break;
				}
			}
		}
		//Else if it is the same
		else if (this.listens['processor'][i].options.url == req.url) {

			this.listens['processor'][i].call(req, res, end, asynchronous);

			if (ending) {
				break;
			}
		}

	}
}



//Just a bunch of aliases
/**
 * Is the same as StirFry.on('request')
 * @param {string/regexp} Url - Can be a string or regex, it gets tested against the request url to see if it should be called
 * @param {callback} Call - Gets called when there is a get request that matches the url variable, takes a request object and a response object as an input,
 * @example
 * var StirFry = require('./index');
 * //Create a new stir fry server
 * var server = new StirFry(8080, '0.0.0.0');
 * //On any get request reply with the url
 * server.get(RegExp('.*'), function(req, res) {
 *     res.send(req.url);
 * });
 * //Listen for requests
 * server.listen();
 * */
StirFry.prototype.get = function(options, call) {
	this.on('get', options, call);
}
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
 *
 *
 *
 * */
StirFry.prototype.pre = function() {
	var options = arguments[0];
	var callToUse = arguments[arguments.length - 1];
	//If there is only 1 argument
	if (arguments.length == 1) {
		options = /.*/;
	}
	//Push an object where the url is the options input and whether is regex or not is set automagically
	this.on('pre', options, callToUse);
}
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
 *
 *
 *
 * */
StirFry.prototype.process = function() {
	var options = arguments[0];
	var callToUse = arguments[arguments.length - 1];
	//If there is only 1 argument
	if (arguments.length == 1) {
		options = /.*/;
	}
	//Push an object where the url is the options input and whether is regex or not is set automagically
	this.on('processor', options, callToUse);
}

//Static file server
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


//Function to combine to paths
function combinePaths(path1, path2) {
	var path1ToUse = path1.slice(-1) == '/' ? path1:(path1 + '/');
	var path2ToUse = path2.slice(0, 1) == '/' ? path2.slice(1):path2;
	return path1ToUse + path2ToUse;
}
