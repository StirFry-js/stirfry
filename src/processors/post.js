this.process(function(req, res, end, async) {
	//Retrieve post data
	if (req.method == 'POST') {
		async.start();

		var postData = '';

		req.full.on('data', function (data) {
			postData += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (postData.length > 1e6)
                request.connection.destroy();
		})
		req.full.on('end', function() {

			req.post = parse(postData);
			async.done();
		})
	}

});
