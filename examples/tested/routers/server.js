var StirFry = require('../../stirfry.js');
var router  = StirFry.extension();
var server  = new StirFry(8080);

router.request(function(req, res) {
	res.send("hi");
})

server.use(router);
