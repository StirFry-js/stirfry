//PASSED WOOO!!
var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080, '0.0.0.0');
server.request(StirFry.static('public'));
