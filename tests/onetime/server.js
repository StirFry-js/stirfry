var StirFry = require('../../stirfry.js');
var server = new StirFry(8080);
server.req(/.*/, function(req, res) {
	res.send(req.url);
}, true);
