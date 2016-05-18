//NEEXT!!!
var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080);
server.get(/.*/, (req, res) => res.sendFile('testFile.html'));
