## Creating your first server
```javascript
var StirFry = require('stirfry');
var server  = new StirFry(8080);
server.get(/.*?\/(.*?)\/.*/, function(request, response, end) {
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
That example uses the built in `StirFry.static()` to create a static file server. The `'public'` means that the static files get served from the public folder, it is optional to leave that input. `server.pre()` is a way of saying do this before anything else. If there is no path input it automatically substitutes it with /.\*/



## Contact me
My email address is: squishybanana04@gmail.com
Please email me if you have any ideas/requests/or want to contribute.
My website is: http://squishy-banana.com


<sup><sub>I'm twelve.</sub></sup>
