this.process(function(req, res, end, async) {
	if (req.full.headers.cookie)
		req.cookies = parseCookie(req.full.headers.cookie);
	else
		req.cookies = {};
});
