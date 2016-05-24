StirFry.prototype.use = function (obj) {
	//If the object is an array
	if (Array.isArray(obj)) {
		//Run this function on each of the inner ones
		for (var i = 0; i < obj.length; i++) {
			this.use(obj[i]);
		}
	}
	else {
		//If there is a url parameter
		if (obj.url)
			this[obj.layer](obj.url, obj.call);
		else
			this[obj.layer](obj.call);
	}
}
