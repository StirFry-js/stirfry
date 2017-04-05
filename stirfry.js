"use strict";
let pathToRegexp = require('path-to-regexp');
let http = require('http');
let fs = require('fs');

let parse = require('./utils/parse');
let combinePaths = require('./utils/combinePaths');
let formatDate = require('./utils/formatdate');

let defaultExtension = 'html';

//Set module exports to equal the server constructor
module.exports = StirFry;
module.exports.defaultExtension = defaultExtension;
module.exports.home = ((require.main || module).filename).split('/').slice(0, -1).join('/');
let types = require(__dirname + '/types');
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
    let ipToUse = typeof ip == 'string' ? ip : '127.0.0.1';
    let listen = true;
    //If port is a boolean
    if (typeof port == 'boolean') listen = port;
    //Initialize all of the properties
    this.port = port;
    this.ip = ipToUse;
    this.listens = {
        'request': [],
        'pre': [],
        'start': [],
        'end': [],
        'exception': [],
        'processor': []
    }
    this.layers = {
        'request': true,
        'pre': true,
        'processor': true
    };
    this.layerOrder = ['processor', 'pre', 'request'];
    let that = this;
    //The function to call on a request
    this.respond = function(req, res) {
        //Create a response object
        let sendData = new Buffer('');
        let waiting = 0;
        //Create a request object
        let request = {
            url: decodeURIComponent(req.url),
            method: req.method,
            full: req,
            ip: req.connection.remoteAddress,
            connection: req.connection,
            headers: req.headers
        }
        //Create a response object
        let response = {
            //A function to send a file at a certain path
            sendFile: function(path, callback) {
                let callbackToUse = callback;
                if (!callback) {
                    callbackToUse = (err) => err ? console.log(JSON.stringify(err)) : undefined;
                }
                let fullPath = combinePaths(module.exports.home, path);
                let self = this;
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
                    self.send(data);
                    //Get the file extension
                    //let fileExtension = (() => {let split = path.split(/\./g); return split[split.length - 1]})();
                    //if (fileExtension == 'html' || fileExtension == 'htm')
                    //res.writeHead(200, {
                    //    'Content-Type': 'text/html'
                    //});
                    let fileExtension = (function() {
                        let split = path.split(/\./g);
                        return split[split.length - 1];
                    })();

                    res.writeHead(200, {
                        'Content-Type': types[fileExtension]
                    });
                    callbackToUse(false);
                    asynchronous.end();
                })
            },

            //A function just to send data
            send: function(data) {
                this.response = Buffer.concat([Buffer(this.response), Buffer(data)]);
                sendData = Buffer.concat([Buffer(sendData), Buffer(data)]);
                //		console.log(sendData);
            },
            full: res,
            redirect: function(url) {
                res.writeHead(302, {
                    'Location': url
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
                res.end(data);
            },
            end: function(data) {
                res.end(data);
            },
            runFile: function(file) {
                asynchronous.start();
                //Read the file
                fs.readFile(file, function(err, data) {
                    if (err) return res.end(err);
                    eval(data.toString());
                    asynchronous.done();
                })
            }
        }
        response.response = new Buffer('');
        waiting = 0;
        let currentLayer = -1;
        let self = that;
        function callNextLayer() {
            currentLayer++;
            if (currentLayer < self.layerOrder.length) {
                let waiting = 0;
                let async = {
                    //Function to start waiting
                    start: function() {
                        waiting++;
                    },
                    //Function to end waiting
                    done: function() {
                        waiting--;

                        //Check if everything is done
                        if (waiting <= 0) {
                            if (currentLayer < self.layerOrder.length - 1) callNextLayer();
                            else res.end(response.response);
                        }
                    }
                }
                async.end = async.done;
                self._callLayer(self.layerOrder[currentLayer], request, response, async);
                if (waiting <= 0) async.done();
            }
        }
        callNextLayer();

    }


    this.server = http.createServer(this.respond);
    if (listen) {
        this.listen();
    }
    this.process(function(req, res, end, async) {
        //Retrieve post data
        if (req.method == 'POST') {
            async.start();

            let postData = '';

            req.full.on('data', function(data) {
                postData += data;

                // Too much POST data, kill the connection!
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (postData.length > 1e6)
                    request.connection.destroy();
            })
            req.full.on('end', function() {

                req.post = parse(postData);
                async.done();
            })
        }

    });

    this.process(function(req, res, end, async) {
        //Split the request by ?
        let split = req.url.split('?');
        //res.send(split);
        if (split[1]) {
            //Clone req.url to req.fullUrl
            req.fullUrl = req.url.slice(0);
            //Now parse it
            let parsed = parse(split[1]);
            req.url = split[0];
            //res.send(JSON.stringify(parsed));

            let params = parsed;
            for (let i in req.params) params[i] = req.params[i];
            req.params = params;
            //res.send(JSON.stringify(req.params));
        }
    });
}




//An express style router
StirFry.extension = function() {
    return new StirFry(false);
}
StirFry.router = StirFry.extension;
/**
 * Starts the server listening on the port and ip that were inputted during the construction
 * @param {callback} Callback - Optional, runs when the server starts
 *
 *
 * */
StirFry.prototype.listen = function(port, ip, callback) {
    let call = callback || function(e) {
        if (e) {
            console.error(e);
            this._callExceptions(e);
        }
    }
    let self = this;
    //Get only number input
    let portToUse = (function() {
        let onlyNum;
        for (let i in arguments)
            if (typeof arguments[i] == 'number')
                onlyNum = arguments[i];
        return onlyNum || self.port;
    })()
    //Get the only string inputted
    let ipToUse = (function() {
        let onlyString;
        for (let i in arguments)
            if (typeof arguments[i] == 'string')
                onlyString = arguments[i];
        return onlyString || self.ip;
    })()
    //Get the only function input
    let callbackToUse = (function() {
        let onlyFunc;
        for (let i in arguments)
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
 * let StirFry = require('stirfry');
 * let server = new StirFry(8080, '127.0.0.1');
 * server.on('get', {url: '/abc.*', regex: true}, function(req, res) {
 *     res.send(req.url);
 * });
 * */
StirFry.prototype.on = function(event, options, call, onetime) {
    //If call is undefined that means that actually options is undefined so set
    let callToUse = call;
    if (typeof options == 'function') {
        callToUse = options;
    }
    //If this is a defined event
    if (this.listens[event]) {
        //If its a get
        if (this.layers[event]) {
            //Push an object where the url is the options input and whether is regex or not is set automagically
            this.listens[event].push({
                options: {
                    url: options,
                    regex: options.constructor.name == 'RegExp',
                    onetime: onetime
                },
                call: callToUse
            });
            return;
        }
        //Push it
        this.listens[event].push({
            options: options,
            call: callToUse
        });
    } else {
        //Say that they requested a nonexistent event
        console.error(event + " is not an event that has been defined");
    }
}


//Function to call all the exceptions
StirFry.prototype._callExceptions = function(err) {
    //Loop through
    for (let i = 0; i < this.listens['exception'].length; i++) {
        //Call the exception
        this.listens['exception'][i].call(err);
    }
}
let ending = false;

function end() {
    ending = true;
}

//A function to call the inputed layer
StirFry.prototype._callLayer = function(layer, req, res, asynchronous) {
    if (!req.params) req.params = {};
    ending = false;
    //Loop through all the gets
    for (let i = 0; i < this.listens[layer].length; i++) {
        //If its a regex
        if (this.listens[layer][i].options.regex) {
            //If the regex matches where i add ^ to the begginning and $ to the end
            if (RegExp('^' + this.listens[layer][i].options.url.source + "$").test(req.url)) {
                //Call it with the request parameters as an array
                let params = RegExp('^' + this.listens[layer][i].options.url.source + "$").exec(req.url).slice(1);
                //Loop through params and set req.params[i] to equal params[i]
                for (let k in params) req.params[k] = params[k];
                this.listens[layer][i].call(req, res, end, asynchronous, this);
                for (let k in params) delete req.params[k];

                if (this.listens[layer][i].options.onetime) this.listens[layer].splice(i, 1);

                if (ending) {
                    break;
                }
            }
        }
        //Else if it is the same
        else {
            let keys = [];
            let params = pathToRegexp(this.listens[layer][i].options.url, keys).exec(req.url);
            if (params) {
                params = params.slice(1)
                //Loop through params and set req.params[i] to equal params[i]
                for (let k in params) req.params[keys[k].name] = params[k];
                this.listens[layer][i].call(req, res, end, asynchronous, this);
                for (let k in params) delete req.params[keys[k].name];

                if (this.listens[layer][i].options.onetime) this.listens[layer].splice(i, 1);

                if (ending) {
                    break;
                }
            }
        }

    }
}


StirFry.prototype.createLayer = function(name) {
    if (this.listens[name]) {
        throw new Error("There is already a listener defined as " + name);
        return false;
    }
    this.listens[name] = [];
    this.layers[name] = true;
    this.layerOrder.push(name);
}

StirFry.prototype.destroyLayer = function(layer) {
    if (!this.layers[layer]) {
        throw new Error("There is no layer of the name " + layer);
        return false;
    }
    delete this.listens[name];
    this.layers[name] = false;
    this.layerOrder.splice(this.layerOrder.indexOf(layer), 1);
}

StirFry.prototype.placeLayer = function(layer, after) {
    this.layerOrder.splice(this.layerOrder.indexOf(layer), 1);
    this.layerOrder.splice(this.layerOrder.indexOf(after) + 1, 0, layer);
}
//Function to call all the get request
StirFry.prototype._callRequests = function(req, res, asynchronous) {
    this._callLayer('request', req, res, asynchronous);
}

//Function to call all the pre processor requests
StirFry.prototype._callPre = function(req, res, asynchronous) {
    this._callLayer('pre', req, res, asynchronous);

}

//Function to call all the pre processor requests
StirFry.prototype._callProcessors = function(req, res, asynchronous) {
    this._callLayer('processor', req, res, asynchronous);
}

//Just a bunch of aliases
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
 *      res.send("test");
 * });
 * 
 */
StirFry.prototype.addListenerOnLayer = function() {
    if (typeof arguments[0] != "string") throw new Error("Layer is not string");
    let options = arguments[1];
    let callToUse = arguments[2];
    //If there is only 1 argument
    if (arguments.length == 2) {
        options = /.*/;
        callToUse = arguments[1];
    }
    //Push an object where the url is the options input and whether is regex or not is set automagically
    this.on(arguments[0], options, callToUse, arguments[3]);
}
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
 * */
StirFry.prototype.request = function() {
    let options = arguments[0];
    let callToUse = arguments[1];
    //If there is only 1 argument
    if (arguments.length == 1) {
        options = /.*/;
        callToUse = arguments[0];
    }
    //Push an object where the url is the options input and whether is regex or not is set automagically
    this.on('request', options, callToUse, arguments[2]);
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
    let options = arguments[0];
    let callToUse = arguments[1];
    //If there is only 1 argument
    if (arguments.length == 1) {
        options = /.*/;
        callToUse = arguments[0];
    }
    //Push an object where the url is the options input and whether is regex or not is set automagically
    this.on('pre', options, callToUse, arguments[2]);
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
    let options = arguments[0];
    let callToUse = arguments[1];
    //If there is only 1 argument
    if (arguments.length == 1) {
        options = /.*/;
        callToUse = arguments[0];
    }
    //Push an object where the url is the options input and whether is regex or not is set automagically
    this.on('processor', options, callToUse, arguments[2]);
}

/**
 * A shorthand function to create listeners quickly
 * @param {string} Response - The response for that request
 * @param {string or RegExp} Request - The url of request that it responds too
 * @example
 * //This sends the url of the request, when you say ${anything} it tries to find that in the request or response object, and if it cant it just sends ${url}.
 * server.send("${url}")
 * */
StirFry.prototype.send = function(response, request) {
    request = request || /.*/;
    this.req(request, function(req, res) {
        let send = response;
        for (let i in req) {
            send = send.replace("${" + i + "}", req[i]);
        }
        for (let i in res) {
            send = send.replace("${" + i + "}", res[i]);
        }
        res.send(send);
    })
}

/**
 * A shorthand function to create listeners that send files quickly
 * @param {string} File name - The file name to se d
 * @param {string or RegExp} Request - The url of request that it responds too
 * @example
 * //This sends the url of the request, when you say ${anything} it tries to find that in the request or response object, and if it cant it just sends ${url}.
 * server.send("${url}")
 * */
StirFry.prototype.sendFile = function(filename, request) {
    request = request || /.*/;
    this.req(request, function(req, res) {
        res.sendFile(filename);
    })
}

//Static file server
/**
 * Generates a response function for the desired folder for serving static files.
 * @param {string} Path - Optional, the home path to serve files from
 * @param {boolean} End - Optional, whether
 * */
StirFry.static = function(path, ending) {
    let pathToUse = path;
    let endToUse = ending;
    if (!path && !ending) pathToUse = '';
    if (path && !ending) {
        if (typeof path != 'string') {
            pathToUse = '';
            endToUse = path;
        }
        //pathToUse = combinePaths(module.exports.home, pathToUse);
    }
    //Return a function
    return function(req, res, end, async) {
        //Check if the request is a folder
        let combinedPath = combinePaths(pathToUse, req.url);
        async.start();
        fs.lstat(combinePaths(module.exports.home, combinedPath), function(err, stats) {
            if (err) {
                console.log(err);
                async.end();
                return;
            }
            //Find out if it is a directory
            let isDir = stats.isDirectory();
            //Generate a path that has index.{extension} if needed
            let pathToUse = isDir ? combinePaths(combinedPath, 'index.' + module.exports.defaultExtension) : combinedPath;
            //Read the file now
            res.sendFile(pathToUse);
            async.end();

        });
    }
}

//StirFry.prototype.use
StirFry.prototype.use = function(obj) {
    if (obj.listens) {
        //Add all its listeners
        for (let i in obj.listens) {
            for (let k in obj.listens[i]) {
                this.listens[i][k] = obj.listens[i][k];
            }
        }
        return;
    }
}


//A logger use
StirFry.logger = function(path) {
    let extension = new StirFry.extension();
    extension.req(function(request, response) {
        let log = `Request recieved with ${request.post ? `${JSON.stringify(request.post)} as post and `:``} ${request.fullUrl || request.url} as the url. Recieved from ${request.ip} on ` + formatDate(new Date());
        console.log(log);
        if (path) {
            fs.appendFile(path, log + '\n');
        }
    });
    return extension;
}

