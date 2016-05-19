//WOO!!
var StirFry = require('../../stirfry.js');
var fs = require('fs');
var server  = new StirFry(8080, '0.0.0.0');
server.pre((req, res, end, async) => {
	async.start();
	fs.readFile('pre', function(err, data) {
		if (err) return console.log(err);
		//Add that as part of the response object
		res.stuff = data.toString();
		async.done();
	})
});
server.get(/.*/, (req, res, end, async) => {
	async.start();
	fs.readFile('get', function(err, data) {
		if (err) return console.log(err);
		//Add that as part of the response object
		res.send(res.stuff + data.toString());
		async.done();
	})
});
