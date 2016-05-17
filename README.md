```javascript
var StirFry = require('stirfry');
var server  = new StirFry(8080);
server.get(/.*?\/(.*?)\/.*/, function(request, response, end) {
    response.send(request.params[0]);
    end();
});
server.listen();
```

That code creates a new server and sets it to listen for any request on port 8080 that has at least two slashes in it.

`request.params[0]` is the same as saying $1 in regex replace `request.params[1]` would be the same as saying $2 and so on. `response.send` appends the input to the response. `end()` stops that request from activating any other get listeners. And `server.listen()` starts it.

## Contact me
My email address is: squishybanana04@gmail.com
Please email me if you have any ideas/requests/or want to contribute.
My website is: http://squishy-banana.com


<sup>I'm twelve so don't judge</sup>
