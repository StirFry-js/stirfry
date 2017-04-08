'use strict';
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "(should|describe|it)" }]*/
/*global describe it:true*/

const should = require('should');
const StirFry = require('../../stirfry.js');
const request = require('request');
const queryString = require('querystring');

describe('the request object', function () {
	it('has a property called url which equals the url', function (done) {
		const url = '/testing.html';
		const server = new StirFry(8080);

		server.req(function (req, res) {
			res.send(req.url);
		});
		request('http://localhost:8080' + url, function(error, response) {
			server.close();
			if (error) done(error);
			response.statusCode.should.equal(200);
			response.body.should.equal(url);
			done();
		});
	});
	it('has an ip address', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.send(req.ip);
		});
		request('http://localhost:8080', function(error, response) {
			server.close();
			if (error) done(error);
			response.statusCode.should.equal(200);
			response.body.should.equal('127.0.0.1');
			done();
		});
	});
	it('should not change between layers', function(done) {
		const server = new StirFry(8080);

		server.pre(function(req) {
			req.someNumber = '3';
		});
		server.req(function(req, res) {
			res.send(req.someNumber);
		});
		request('http://localhost:8080', function(error, response) {
			server.close();
			if (error) done(error);
			response.statusCode.should.equal(200);
			response.body.should.equal('3');
			done();
		});
	});
	it('should contain all of the headers inside the headers property', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.send(req.headers['host']);
		});
		request('http://localhost:8080', function(error, response) {
			server.close();
			if (error) done(error);
			response.body.should.equal('localhost:8080');
			done();
		});
	});
	it('automatically grabs post data', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			if (req.method == 'POST') {
				res.send(req.post.msg);
			}
		});
		request({
			url: 'http://localhost:8080', 
			method: 'POST',
			body: queryString.stringify({'msg': 'Hello world'})
		}, function(error, response) {
			server.close();
			if (error) done(error);
			response.body.should.equal('Hello world');
			done();
		});
	});
	it('parses query strings', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.send(req.params['test']);
		});
		request('http://localhost:8080?test=hello%20world', function(error, response) {
			server.close();
			if (error) done(error);
			response.body.should.equal('hello world');
			done();
		});
	});
	it('has a method property', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.send(req.method);
		});
		request.post({
			url: 'http://localhost:8080', 
			formData: {'msg': 'Hello World'}
		}, function(error, response) {
			if (error) done(error);
			response.body.should.equal('POST');
			request('http://localhost:8080', function(rerror, rresponse) {
				server.close();
				if (rerror) done(rerror);
				rresponse.body.should.equal('GET');
				done();

			});
		});
		
	});
	describe('parameters', function() {
		it('can take get parameters', function(done) {
			const server = new StirFry(8080);

			server.req(function(req, res) {
				res.send(req.params.input);
			});

			request('http://localhost:8080/?input=hello%20world', function(error, response) {
				server.close();
				if (error) done(error);
				response.body.should.equal('hello world');
				done();
			});
		});
		it('can take parameters in the url', function(done) {
			const server = new StirFry(8080);

			server.req('/folder/:file', function(req, res) {
				res.send(req.params.input);
			});

			request('http://localhost:8080/?input=hello%20world', function(error, response) {
				server.close();
				if (error) done(error);
				response.body.should.equal('hello world');
				done();
			});
		});
	});
});
