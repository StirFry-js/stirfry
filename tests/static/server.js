//PASSED WOOO!!
var StirFry = require('../../stirfry.js');
var server  = new StirFry(8080);
server.pre(StirFry.static('public'));
