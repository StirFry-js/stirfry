var StirFry = require('../../stirfry');
var server  = new StirFry(8080);
server.sendFile('testFile.html');
