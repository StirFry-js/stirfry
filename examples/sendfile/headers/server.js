var StirFry = require('../../../stirfry');
var server = new StirFry(8080);
server.req(function(req,res) {
	res.sendFile('image.png');
});
