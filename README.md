# Stir Fry #
Stir fry is a ___fast___, ___lightweight___, and ___easy to use___ web framework for nodejs.
#### Creating your first server ##
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
To create a plugin just create an object (or array of objects) that have a layer property, a call property, and a url property (optional). This example is a logger very similar to the built in one:
```javascript
module.exports = {
	layer: 'pre',
	call: function(req, res) {
		var log = `request for ${req.fullUrl} from ${req.ip} at ${new Date()}`
		console.log(log);
	}
}
```
When you say `server.use(logger)`, in the background that does:
`server[logger.layer](call)` or if you have a url property, `server[logger.layer](logger.url, call)`

You also can put an array of plugin objects if you need multiple. Or if it makes it easier to understand the code, you can put arrays of arrays of logger objects. It runs recursively.

#### Post Requests ##
You can access post data by accessing `request.post` as an associative array
