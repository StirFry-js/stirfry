//PASSED WOOO!!
var StirFry = require('../../index.js');
var server  = new StirFry(8080);
server.pre(StirFry.static('public'));
