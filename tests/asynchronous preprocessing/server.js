//WOO!!
//This also proves that preprocessing works
var StirFry = require('../../stirfry.js');
var fs = require('fs');
var server  = new StirFry(8080);
server.pre((req, res, end, async) => {
	async.start();
	fs.readFile('testfile.js', function(err, data) {
		if (err) return console.log(err);
		//Add that as part of the response object
		res.stuff = data.toString();
		async.done();
	})
});
server.get(/.*/, (req, res) => res.send(res.stuff));
