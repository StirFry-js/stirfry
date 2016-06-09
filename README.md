# Stir Fry #
Stir Fry is a ___fast___, ___lightweight___, ___self contained___, and ___easy to use___ web framework for nodejs.
<br>
npm: https://www.npmjs.com/package/stirfry
## Table Of Contents ##
 * [What is this?](#whatisthis)
 * [Quick Start](#quickstart)
 * [About](#about)

<a name="whatisthis"></a>
## What is this? ##
Stir Fry is a framework for making web servers in nodejs. It enables you to quickly and easily create web apps and servers. So, here is how to create one:

The first step is to create a server program that uses Stir Fry. Start by creating a folder, you can call it anything you want.

Next navigate to that folder in terminal and run this command:<br>
`npm install stirfry`<br>
That installs Stir Fry into the folder your server is running from. Next create a file called `server.js` and open it with your favourite code editor. Add this code: <br>
```javascript
var StirFry = require('stirfry');
var server  = new StirFry(8080);
server.request(function (request, response) {
    response.send("Hello World!");
});
```
To run it, type:
`node server.js`<br>
If that doesn't work, try:
`nodejs server.js`<br>
If that doesn't work, you must install nodejs.<br>
Assuming you've done it right, you can go to `localhost:8080` in any web browser and it should show `Hello World!`
#### How did that work?
Setting the server to equal a `new StirFry(8080)` meant that you were telling the server to listen for any request on port 8080. Then calling `server.request` added the input as a response for requests.

After all of the listeners have been called it sends the response to the user. You can add to the response by writing
```javascript
response.send("The thing you want to add to the response");
```
So by typing `response.send("Hello World!")` you made that the response.
#### Preprocessing the request and response objects ####
Stir Fry gives you the ability to preprocess the request and response objects. Basically that means you can write exensions and mods for stirfry. Here is an example
```javascript
var StirFry = require('stirfry');
var server  = new StirFry(8080);
server.pre(function(request, response) {
	//Now I can change the request and response object before the next code runs
    request.doubleURL = request.url + request.url;
}
server.request(function(request, response) {
	//Now I can access request.doubleURL, and I also can in every request listener
    respose.send(request.doubleURL);
});
```
#### Extensions ###
You can create extensions using basically the same syntax as a normal server and use them just  by saying `server.use(extension)`, here is an example
```javascript
var StirFry   = require('stirfry');
var extension = new StirFry.extension();
//I can put more preprocessors and responders if I want
extension.pre(function(request, response) {
	request.doubleURL = request.url + request.url;
});
var server    = new StirFry(8080);
server.use(extension);
server.request(function(request, response) {
	//I can use request.doubleURL
    response.send(request.doubleURL);
});
```
<a name="quickstart"></a>
## Quick Start ##
#### Creating your first server ####
```javascript
var StirFry = require('stirfry');
var server  = new StirFry(8080);
server.request(function (request, response) {
    response.send("Hello World!");
});
```
This example creates a server on port 8080 and sets it to respond with `Hello World!` on any request. When you use `response.send` it appends the input to the response.
#### Static File Servers ##
Stir Fry has a static file server method built in. All you need to do is this:
```javascript
var StirFry = require('stirfry');
var server  = new StirFry(8080);
server.request(StirFry.static('public'));
```
Public is the folder that the files get served from.

#### Asynchronous Operations ##
Stir Fry lets you run multiple asynchronous operations at once. You can do all the preprocessing you want in the `server.process` layer, and then once all of those are done, it runs `server.pre` listeners, and once those are done it runs `server.request` listeners.
```javascript
var StirFry = require('stirfry');
var server  = new StirFry(8080);

var fs = require('fs');

server.pre(function (request, response, end, async) {
    async.start();
    fs.readFile('file.txt', function (err, data) {
        response.data = data.toString();
        async.done();
    });

});
server.request(function (request, response) {
    response.send(response.data);
});
```
This program uses `fs.readFile` to add a property to the response object and then sends it to the user. There are loads of more efficient ways to do this, this is just an example of how to use async.

#### Sending Files ##
Stir Fry has a built in `response.sendFile` method, here is an example:
```javascript
var StirFry = require('stirfry');
var server  = new StirFry(8080);
server.request(function (request, response) {
    response.sendFile('file.html');
});
```
#### Responding Only to Certain Requests ##
When you create a request, preprocessor, or processor listener, you have the option of limiting it to certain requests by regex matching. Here is an example:
```javascript
var StirFry = require('stirfry');
var server  = new StirFry(8080);
server.request(/\/.*?\/hi/, function (request, response) {
    response.send("hi");
});
```
You can access regex capture groups by accessing `request.params` as an array. `request.params` also processes query strings in the request.

#### Installing plugins ####
Just write `server.use(thePluginObject)`

#### Creating Plugins ####
Creating plugins works in a very similar way as creating servers. The only difference is you use `new StirFry.extension()` instead of `new StirFry()`. Then you can say `server.use(extension)` and it manages all of the listeners. Here is an example
```javascript
var StirFry = require('stirfry');
var extension = new StirFry.extension();
extension.req(function(request, response) {
	var log = `Request recieved with ${request.post ? `${request.post} as post and `:``} ${request.fullUrl || request.url} as the url. Recieved from ${request.ip} on `+ formatDate(new Date()); //Format date is defined externally
	console.log(log);
});
```
That is similar to the built in logger extension. Here is how you can use it
```javascript
var server = new StirFry(8080);
server.use(extension);
```
The built in logger is a function that returns an extension because I wanted people to be able to define a log file
```javascript
var StirFry = require('stirfry');
var server = new StirFry(8080);
server.use(StirFry.logger("logFile"));
```

#### Post Requests ##
You can access post data by accessing `request.post` as an associative array

## About ##
<a name="about"></a>
StirFry and the documentation was written by Alex Waese-Perlman (I'm twelve ;))
<br>Here's my website: http://www.squishy-banana.com
