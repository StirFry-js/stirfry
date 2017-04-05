"use strict";
let StirFry = require('../../stirfry.js');
let server = new StirFry(8080, '0.0.0.0');
server.createLayer('final');
server.placeLayer('final', 'request');
server.addListenerOnLayer('final', function(req, res) {
    res.send('Hello World!');
});