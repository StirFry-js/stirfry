var StirFry = require('../../../stirfry.js');
var server  = new StirFry(8080);
server.request(/.*/, function (req, res) {
	res.sendFile('post.html');
	if (req.method == 'POST')
		res.send(JSON.stringify(req.post));
})
