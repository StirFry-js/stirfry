var StirFry = require('../../stirfry.js');
var server = new StirFry(8080);
server.use(StirFry.logger('log'));
server.send("Hi");
