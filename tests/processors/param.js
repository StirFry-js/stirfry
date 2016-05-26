var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080);
server.request('/hi/:there', function (req, res) {
	res.send(JSON.stringify(req.params));
	console.log(req.params);
	console.log("hi");
})
