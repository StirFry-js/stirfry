//WOOT WOOT!!
var StirFry = require('../../index.js');
var server  = new StirFry(8080);
server.get(/.*/, (req, res) => res.send(req.url));
