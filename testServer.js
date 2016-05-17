var StirFry = require('./index');
var server  = new StirFry(8080, '0.0.0.0');
var users   = [
	'asdfghjkl;',
	"1234567890",
	"1q2w3e4r5t",
	"pqowieuryt"
]

server.get(/\/(user|account)\/(.{10}?)/, function (req, res) {
	console.log(req.url);
	console.log(req.params[1]);
	if (users.indexOf(req.params[1]) != -1) {
		res.send("Hello " + req.params[1]);
	}
	else {
		res.send("user does not exist");
	}
});

server.listen();
