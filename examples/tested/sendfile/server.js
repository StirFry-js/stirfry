//NEEXT!!!
var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080);
server.request((req, res) => res.sendFile('testFile.html'));
