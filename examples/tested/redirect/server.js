var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080);
server.req(function(req, res) {
	res.redirect('http://www.google.com');
})
