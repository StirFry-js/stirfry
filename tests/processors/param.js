var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080);
server.request(function (req, res) {
	res.send(JSON.stringify(req.params));
})
