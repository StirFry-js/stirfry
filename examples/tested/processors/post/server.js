'use strict';
const StirFry = require('../../../stirfry.js');
const server = new StirFry(8080);

server.req(function (req, res) {
	res.sendFile('post.html');
	if (req.method == 'POST') {
		res.send(JSON.stringify(req.post));
	}
});
