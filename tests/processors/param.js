var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080);
server.get(/.*/, function (req, res) {
	res.send(JSON.stringify(req.params));
})
