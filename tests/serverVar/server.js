//ANOTHER PASS WOOT!!!!
var StirFry = require('../../stirfry.js');
var http    = require('http');
var app     = new StirFry(false);
var server  = http.createServer(app.respond);
app.get(/.*/, (req, res) => res.send("Hello there!"));
server.listen(8080);
