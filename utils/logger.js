/*eslint no-console: ["error", { allow: ["log"] }] */
'use strict';
let StirFry = require('../stirfry.js');
let fs = require('fs');
let formatDate = require('./formatdate');

module.exports = function(path) {
	let extension = new StirFry.extension();
	extension.req(function(request) {
		let log = `Request recieved with ${request.post ? `${JSON.stringify(request.post)} as post and ` : ''} ${request.fullUrl || request.url} as the url. Recieved from ${request.ip} on ` + formatDate(new Date());
		console.log(log);
		if (path) {
			fs.appendFile(path, log + '\n');
		}
	});
	return extension;
};
