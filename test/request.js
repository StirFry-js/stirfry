'use strict';

let should = require('should');
let StirFry = require('../stirfry.js');
let request = require('request');
describe('the request object', function () {
    it('has a property called url which equals the url', function (done) {
        let url = '/testing.html'
        let server = new StirFry(8080);
        server.req(function(req, res) {
            res.send(req.url);
        });
        request('http://localhost:8080' + url, function(error, response, body) {
            if (error) done(error);
            response.statusCode.should.equal(200);
            response.body.should.equal(url);
            done();
            server.close();
        });
    });
    it('has an ip address', function(done) {
        let server = new StirFry(8080);
        server.req(function(req, res) {
            res.send(req.ip);
        });
        request('http://localhost:8080', function(error, response, body) {
            if (error) done(error);
            response.statusCode.should.equal(200);
            response.body.should.equal('127.0.0.1');
            done();
            server.close();
        });
    });
    it('has a redirect function', function(done) {
        let server = new StirFry(8080);
        let redirectServer = new StirFry(3020);
        redirectServer.req(function(req, res) {
            res.send("Redirect worked");
        });
        let url = 'http://localhost:3020';
        server.req(function(req, res) {
            res.redirect(url);
        });

        request('http://localhost:8080', function(error, response, body) {
            request(url, function(reerr, reresponse, rebody) {
                if (error) done(error);
                response.statusCode.should.equal(200);
                response.body.should.equal(reresponse.body);
                done();
                server.close();
            });
        });
    });
    it('can set headers', function(done) {
        let server = new StirFry(8080);
        server.req(function(req, res) {
            res.writeHead(404);
        });
        request('http://localhost:8080', function(error, response, body) {
            if (error) done(error);
            response.statusCode.should.equal(404);
            done();
            server.close();
        });
    });
    it('can write headers', function(done) {
        let server = new StirFry(8080);
        server.req(function(req, res) {
            res.setHeader('content-type', 'text/html');
        });
        request('http://localhost:8080', function(error, response, body) {
            if (error) done(error);
            response.headers['content-type'].should.equal('text/html');
            done();
            server.close();
        });
    });
    it('should not change between layers', function(done) {
        let server = new StirFry(8080);
        server.pre(function(req, res) {
            req.someNumber = '3';
        });
        server.req(function(req, res) {
            res.send(req.someNumber);
        });
        request('http://localhost:8080', function(error, response, body) {
            if (error) done(error);
            response.statusCode.should.equal(200);
            response.body.should.equal('3');
            done();
            server.close();
        });
    });
});