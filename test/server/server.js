'use strict';
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/

const should = require('should');
const StirFry = require('../../stirfry.js');
const request = require('request');
const path = require('path');
const fs = require('fs');

describe('the server object', function() {
	describe('server.send', function() {
		it('can send values', function(done) {
			const server = new StirFry(8080);

			server.send("Hello world");

			request('http://localhost:8080', function(error, response) {
				server.close();
				if (error) done(error);
				response.body.should.equal('Hello world');
				done();
			});
		});
		it('can send the url', function(done) {
			const server = new StirFry(8080);

			server.send("Hello ${url}");

			request('http://localhost:8080/world', function(error, response) {
				server.close();
				if (error) done(error);
				response.body.should.equal('Hello /world');
				done();
			});
		});
		it('can send the ip', function(done) {
			const server = new StirFry(8080);

			server.send("Hello ${ip}");

			request('http://localhost:8080', function(error, response) {
				server.close();
				if (error) done(error);
				response.body.should.equal('Hello 127.0.0.1');
				done();
			});
		});
		it('can send the method', function(done) {
			const server = new StirFry(8080);

			server.send("Hello ${method}");

			request('http://localhost:8080', function(error, response) {
				server.close();
				if (error) done(error);
				response.body.should.equal('Hello GET');
				done();
			});
		});
	});
	describe('server.sendFile', function() {
		it('should send files', function(done) {
			let server = new StirFry(8080);
			server.sendFile(path.resolve(__dirname, '../testFiles/test.html'));

			request('http://localhost:8080', function(error, response) {
				server.close();
				if (error) done(error);
				response.statusCode.should.equal(200);
				fs.readFile(path.resolve(__dirname, '../testFiles/test.html'), function(err, data) {
					if (err) done(err);
					response.body.should.equal(data.toString());
					done();
				});
			});
		});
	});
	describe('importing servers', function() {
		it('should accept other servers into the .use function', function(done) {
			let server = new StirFry(8080);
			let ext = new StirFry.extension();

			ext.pre(function(req, res) {
				res.send('hello ');
			});
			server.use(ext);
			server.req(function(req, res) {
				res.send('world');
			});
			request('http://localhost:8080', function(error, response) {
				server.close();
				if (error) done(error);
				response.body.should.equal('hello world');
				done();
			});
		});
	});
	describe('onetime', function() {
		it('should only be called once', function(done) {
			let server = new StirFry(8080);
			server.req(function(req, res) {
				res.send('hello world');
			}, true);
			request('http://localhost:8080', function(error, response) {
				if (error) done(error);
				response.body.should.equal('hello world');
				request('http://localhost:8080', function(error, response) {
					server.close();
					if (error) done(error);
					response.body.should.equal('');
					done();
				});
			});
		});
	});
	describe('creating and deleting layers', function() {
		it('should be able to create layers', function(done) {
			let server = new StirFry(8080);
			server.createLayer('final');
			server.placeLayer('final', 'request');
			server.createLayer('beforeFinal');
			server.placeLayer('beforeFinal', 'request');

			server.addListenerOnLayer('beforeFinal', function(req, res) {
				res.send('hello');
			});
			server.addListenerOnLayer('final', '/', function(req, res) {
				res.send(' world');
			});
			request('http://localhost:8080', function(error, response) {
				if (error) done(error);
				response.body.should.equal('hello world');
				request('http://localhost:8080/test', function(error, response) {
					server.close();
					if (error) done(error);
					response.body.should.equal('hello');
					done();
				});
			});
		});
		it('should be able to delete layers', function(done) {
			let server = new StirFry(8080);
			server.createLayer('final');
			server.placeLayer('final', 'request');
			server.createLayer('beforeFinal');
			server.placeLayer('beforeFinal', 'request');

			server.addListenerOnLayer('beforeFinal', function(req, res) {
				res.send('hello');
			});
			server.addListenerOnLayer('final', function(req, res) {
				res.send(' world');
			});
			request('http://localhost:8080', function(error, response) {
				if (error) done(error);
				response.body.should.equal('hello world');
				server.destroyLayer('final');
				request('http://localhost:8080', function(error, response) {
					server.close();
					if (error) done(error);
					response.body.should.equal('hello');
					done();
				});
			});
		});
	});
});