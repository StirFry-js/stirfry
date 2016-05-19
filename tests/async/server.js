//YAYAYAYAY
var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080);
var fs = require('fs');

server.get(/.*/, function (req, res, end, async) {
	async.start();
	fs.readFile('testfile', function (err, data) {
		if (err) return console.log(err);
		res.send(data);
		async.end();
	})
})
