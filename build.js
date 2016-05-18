#!/usr/bin/env nodejs
var fs     = require('fs');
var output = fs.readFileSync(process.argv[2]).toString();

var regexp = /#include\b.*?;/g;
while (true) {
	var matches = output.match(regexp);
	if (matches == null) {
		break;
	}
	else for (var i in matches) {
		var fileName = matches[i].slice(9, -1);
		output = output.replace(matches[i], fs.readFileSync('src/' + fileName).toString());
	}
}N
output = "//This code has been precompiled, please do not edit it. If you would like to make your own changes visit our github\n" + output;
fs.writeFile('stirfry.js', output);
