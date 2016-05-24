//When #include filename.js works, but you need a semicolon, relative paths dont work, and it cant start with a slash, the code gets compiled into stirfry.js
var http  = require('http');
var fs    = require('fs');
#include parsers.js;
var defaultExtension = 'html';

//Set module exports to equal the server constructor
module.exports 		= StirFry;
module.exports.defaultExtension = defaultExtension;
module.exports.home = ((require.main || module).filename).split('/').slice(0, -1).join('/');
#include stirFryClass.js;

/**
 * Starts the server listening on the port and ip that were inputted during the construction
 * @param {callback} Callback - Optional, runs when the server starts
 *
 *
 * */
StirFry.prototype.listen = function(port, ip, callback) {
	var call = callback || function(e) {
		if (e) {
			console.error(e);
			this._callExceptions(e);
		}
	}
	var self = this;
	//Get only number input
	var portToUse = (function() {
		var onlyNum;
		for (var i in arguments)
			if (typeof arguments[i] == 'number')
				onlyNum = arguments[i];
		return onlyNum || self.port;
	})()
	//Get the only string inputted
	var ipToUse = (function() {
		var onlyString;
		for (var i in arguments)
			if (typeof arguments[i] == 'string')
				onlyString = arguments[i];
		return onlyString || self.ip;
	})()
	//Get the only function input
	var callbackToUse = (function() {
		var onlyFunc;
		for (var i in arguments)
			if (typeof arguments[i] == 'function')
				onlyFunc = arguments[i];
		return onlyFunc || function(e) {
			if (e) {
				console.error(e);
				this._callExceptions(e);
			}
		}
	})()
	this.server.listen(portToUse, ipToUse, callbackToUse);
}
/**
 * Listens for an event and call a function when it happen
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
		if (event == 'request' || event == 'pre' || event == 'processor') {
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


//Function to call all the exceptions
StirFry.prototype._callExceptions = function(err) {
	//Loop through
	for (var i = 0; i < this.listens['exception'].length; i++) {
		//Call the exception
		this.listens['exception'][i].call(err);
	}
}
//Include callgets
#include callGets.js;
//Include call pres
#include callPre.js;
//Include call processors
#include callProcess.js;


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
StirFry.prototype.request = function() {
	var options = arguments[0];
	var callToUse = arguments[arguments.length - 1];
	//If there is only 1 argument
	if (arguments.length == 1) {
		options = /.*/;
	}
	//Push an object where the url is the options input and whether is regex or not is set automagically
	this.on('request', options, callToUse);
}
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
#include static.js;
//StirFry.prototype.use
#include use.js;

//A logger use
StirFry.logger = function(path) {

	return {
		layer: 'pre',
		call: function(request, response) {
			var log = `Request recieved with ${request.post ? `${request.post} as post and `:``} ${request.fullUrl} as the url. Recieved from ${request.ip} on `+ formatDate(new Date());
			console.log(log);
			if (path) {
				fs.appendFile(path, log + '\n');
			}

		}
	}
}

function formatDate(date) {
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var days   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var output = `${days[date.getDay()]}, the ${date.getDate()}${date.getDate()%10 == 1 && date.getDate() != 11 ? 'st':(date.getDate()%10 == 2 && date.getDate() != 12 ? 'nd':(date.getDate()%10 == 3 && date.getDate() != 13) ? 'rd':'th')} of ${months[date.getMonth()]}, ${date.getFullYear()}`;
	return output;
}

//Function to combine to paths
function combinePaths(path1, path2) {
	var path1ToUse = path1.slice(-1) == '/' ? path1:(path1 + '/');
	var path2ToUse = path2.slice(0, 1) == '/' ? path2.slice(1):path2;
	return path1ToUse + path2ToUse;
}
