/*eslint no-console: ["error", { allow: ["log"] }] */
'use strict';
const StirFry = require('../stirfry.js');
const fs = require('fs');
const formatDate = require('./formatdate');

module.exports = function(path) {
	const extension = StirFry.extension();

	extension.req(function(request) {
		const log = `Request recieved with ${request.post ? `${JSON.stringify(request.post)} as post and ` : ''} ${request.fullUrl || request.url} as the url. Recieved from ${request.ip} on ` + formatDate(new Date());
		
		console.log(log);
		if (path) {
			fs.appendFile(path, log + '\n');
		}
	});
	return extension;
};
