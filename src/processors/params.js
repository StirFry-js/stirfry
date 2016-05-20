this.process(function(req, res, end, async) {
	//Split the request by ?
	var split = req.url.split('?');
	//res.send(split);
	if (split[1]) {
		//Clone req.url to req.fullUrl
		req.fullUrl = req.url.slice(0);
		//Now parse it
		var parsed = parse(split[1]);
		req.url = split[0];
		//res.send(JSON.stringify(parsed));

		var params = parsed;
		for (var i in req.params) params[i] = req.params[i];
		req.params = params;
		//res.send(JSON.stringify(req.params));
	}
});
