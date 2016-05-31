var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080);
console.log("test");
server.request(function(req, res) {
	res.runFile('test.js');
})
