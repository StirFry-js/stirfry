var http = require('http');
var fs   = require('fs');
var defaultExtension = 'html';
/**
 * Creates a new Stir Fry server
 * @class
 * @param {integer} Port - The port for the server to listen on
 * @param {string} IP - The IP for the server to listen on
 * @param {callback} Callback - Optional, runs as soon as the server starts
 *
 *
 * */
var StirFry = function(port, ip, callback) {
	//If ip is not a string than it is the callback so just use '127.0.0.1' as the ip
	var ipToUse = typeof ip == 'string' ? ip:'127.0.0.1';
	//If typeof ip is a function than set callback to use as ip
	var callbackToUse = typeof ip != 'string'
	  ? //Now check if ip is undefined
	  (typeof ip == 'undefined' ? port:ip)
	  :callback
	//Initialize all of the properties
	this.port     = port;
	this.ip       = ipToUse;
	this.callback = callback;
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
				//Use a path with a / at the beginning even if path already has it
				var pathToUse = path;
				if (path.charAt(0) != '/') {
					pathToUse = '/' + pathToUse;
				}
				var serveUrl = (module.exports.home.slice(-1) == '/' ? module.exports.home.slice(0, -1):module.exports.home) + pathToUse;
				//Now check if serve url is a folder
				var serveIsFolder = fs.statSync(serveUrl).isDirectory();
				//Now if it is a directory
				if (serveIsFolder) {
					//Append index.${defaultExtension} to the folder
					serveUrl = (serveUrl.slice(-1) == '/' ? serveUrl:serveUrl + '/') + 'index.' + defaultExtension;
				}
				var exists = fs.existsSync(serveUrl);
				if (exists) {
					//Now send the file
					sendData += fs.readFileSync(serveUrl).toString();
				}
				else {
					
					res.writeHead(404, {
						'Set-Cookie': req.headers.cookies
					});
					this.sendFile('404Error.html');
				}
			},
			//A function just to send data
			send: function(data) {
				sendData += data;
			},
			http: res
		}
		that._callGets(request, response);
		res.end(sendData);
	}
	this.server = http.createServer(this.respond);
}


//Set module exports to equal the server constructor
module.exports 		= StirFry;
module.exports.defaultExtension = defaultExtension;
module.exports.home = ((require.main || module).filename).split('/').slice(0, -1).join('/');

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
		callToUse = options
	}
	//If this is a dezfined event
	if (this.listens[event]) {
		//If its a get
		if (event == 'get') {
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

var ending = false;
function end() {
	ending = true;
}

//Function to call all the get request
StirFry.prototype._callGets = function(req, res) {
	ending = false;
	//Loop through all the gets
	for (var i = 0; i < this.listens['get'].length; i++) {
		//If its a regex
		if (this.listens['get'][i].options.regex) {
			//If the regex matches where i add ^ to the begginning and $ to the end
			if (RegExp('^' + this.listens['get'][i].options.url.source + "$").test(req.url)) {
				//Call it with the request parameters as an array
				req.params = RegExp('^' + this.listens['get'][i].options.url.source + "$").exec(req.url).slice(1);
				this.listens['get'][i].call(req, res, end);
				delete req.params;
				if (ending) {
					break;
				}
			}
		}
		//Else if it is the same
		else if (this.listens['get'][i].options.url == req.url) {
			
			this.listens['get'][i].call(req, res, end);
			
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
StirFry.prototype.preCount = 0;
/**
 * A function to preprocess text before it gets served
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
	this.listens['get'].splice(this.preCount, 0, {options: {url: options, regex: options.constructor.name == 'RegExp'}, call: callToUse});		
	this.preCount++;
}
