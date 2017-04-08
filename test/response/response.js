'use strict';
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "(should|describe|it)" }]*/
/*global describe it:true*/

const should = require('should');
const StirFry = require('../../stirfry.js');
const request = require('request');
const path = require('path');
const fs = require('fs');

describe('the response object', function() {
	//Send
	it('has a send function', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.send('hello world');
		});

		request('http://localhost:8080', function(error, response) {
			server.close();
			if (error) done(error);
			response.statusCode.should.equal(200);
			response.body.should.equal('hello world');
			done();
		});
	});
	//Send File
	it('has a sendFile function', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.sendFile(path.resolve(__dirname, '../testFiles/test.html'));
		});

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
	//Redirect
	it('has a redirect function', function(done) {
		const server = new StirFry(8080);
		const redirectServer = new StirFry(3020);

		redirectServer.req(function(req, res) {
			res.send('Redirect worked');
		});
		const url = 'http://localhost:3020';

		server.req(function(req, res) {
			res.redirect(url);
		});

		request('http://localhost:8080', function(error, response) {
			request(url, function(reerr, reresponse) {
				server.close();
				redirectServer.close();
				if (error) done(error);
				response.statusCode.should.equal(200);
				response.body.should.equal(reresponse.body);
				done();
			});
		});
	});
	//Set header
	it('can set headers', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.writeHead(404);
		});
		request('http://localhost:8080', function(error, response) {
			server.close();
			if (error) done(error);
			response.statusCode.should.equal(404);
			done();
		});
	});
	//Write header
	it('can write headers', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.setHeader('content-type', 'text/html');
		});
		request('http://localhost:8080', function(error, response) {
			server.close();
			if (error) done(error);
			response.headers['content-type'].should.equal('text/html');
			done();
		});
	});
	//End
	it('should have an end property which ends the connection', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.send('hello ');
			res.end('world');
			res.send('!');
		});
		request('http://localhost:8080', function(error, response) {
			server.close();
			if (error) done(error);
			response.body.should.equal('hello world');
			done();
		});
	});
	//Stop
	it('should have a stop property that ends the connection while resetting the text', function(done) {
		const server = new StirFry(8080);

		server.req(function(req, res) {
			res.send('hello ');
			res.stop('world');
			res.send('!');
		});
		request('http://localhost:8080', function(error, response) {
			server.close();
			if (error) done(error);
			response.body.should.equal('world');
			done();
		});
	});
});
