## Creating your first server
 ```javascript
 var StirFry = require('stirfry');
 var server  = new StirFry(8080);
 server.request(/.*?\/(.*?)\/.*/, function(request, response, end) {
     response.send(request.params[0]);
     end();
 });
 ```
 
 That code creates a new server and sets it to listen for any request on port 8080 that has at least two slashes in it.
 
 `request.params[0]` is the same as saying $1 in regex replace `request.params[1]` would be the same as saying $2 and so on. `response.send` appends the input to the response. `end()` stops that request from activating any other get listeners.
 
 ## Static file servers
 ```javascript
 var StirFry = require('stirfry');
 var server  = new StirFry(8080);
 server.pre(StirFry.static('public'));
 ```
 That example uses the built in `StirFry.static()` to create a static file server. The `'public'` means that the static files get served from the public folder, it is optional to leave that input. `server.pre()` is a way of saying do this before anything else. If there is no path input it automatically substitutes it with /.\*/, it does the sae for `server.request()`
 
 ## Asynchronous operations
 Asynchronous operations in stirfry run in parallel which means that you can't expect your asynchronous operation in one layer to show up in the same layer, so that is why I provided 3 layers
 An example
 ```javascript
 var StirFry = require('stirfry');
 var fs      = require('fs');
 var server  = new StirFry(8080);
 server.req(function(req, res, end, async) {
 	async.start();
 	fs.readFile('file', function(err, data) {
 		if (err) return console.log(err);
 		res.send(data.toString());
 		async.done();
 	})
 	end();
 });
 ```
 `server.req` is shorthand for `server.request`
 `async.start()` starts an async operation
 `async.end()` ends an async operation.
 The response ends only when there are 0 async operations running. Once `server.process` operations are done it calls `server.pre` operations, and once those are done, it calls `server.request` operations, and once those are done it ends the response
 
 ## Go to the github.io page for more information
 http://stirfryjs.github.io/stirfry
 
 ## Contact me
 My email address is: squishybanana04@gmail.com
 Please email me if you have any ideas/requests/or want to contribute.
 My website is: http://squishybanana.com
 The github.io page is: http://stirfryjs.github.io/stirfry
 
 <sup><sub>I'm twelve.</sub></sup>
