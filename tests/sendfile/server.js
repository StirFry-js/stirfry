//NEEXT!!!
var StirFry = require('../../index.js');
var server  = new StirFry(8080);
server.get(/.*/, (req, res) => res.sendFile('testFile.html'));
