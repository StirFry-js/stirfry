'use strict';
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "(should|describe|it)" }]*/
/*global describe it:true*/

const should = require('should');
const StirFry = require('../../stirfry.js');
const request = require('request');

describe('the async object', function() {
	describe('timeouts', function() {
		it('has a .end function. WARNING: this test involves a setTimeout and is very slow', function(done) {
			const server = new StirFry(8080);

			server.req(function(req, res, end, async) {
				async.start();
				setTimeout(function() {
					res.send('hello world');
					async.end();
				}, 100);
			});

			request('http://localhost:8080', function(error, response) {
				server.close();
				if (error) done(error);
				response.statusCode.should.equal(200);
				response.body.should.equal('hello world');
				done();
			});
		});
		it('has a .done function. WARNING: this test involves a setTimeout and is very slow', function(done) {
			const server = new StirFry(8080);

			server.req(function(req, res, end, async) {
				async.start();
				setTimeout(function() {
					res.send('hello world');
					async.done();
				}, 100);
			});

			request('http://localhost:8080', function(error, response) {
				server.close();
				if (error) done(error);
				response.statusCode.should.equal(200);
				response.body.should.equal('hello world');
				done();
			});
		});
		it('should work on all layers. WARNING: this test involves a setTimeout and is very slow', function(done) {
			const server = new StirFry(8080);

			server.pre(function(req, res, end, async) {
				async.start();
				setTimeout(function() {
					res.send('hello ');
					async.done();
				}, 100);
			});
			server.req(function(req, res, end, async) {
				async.start();
				setTimeout(function() {
					res.send('world');
					async.done();
				}, 100);
			});
			request('http://localhost:8080', function(error, response) {
				server.close();
				if (error) done(error);
				response.statusCode.should.equal(200);
				response.body.should.equal('hello world');
				done();
			});
		});
	});
	
});
