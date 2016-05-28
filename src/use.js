StirFry.prototype.use = function (obj) {
	if (obj instanceof StirFry) {
		//Add all its listeners
		for (var i in obj.listens) {
			for (var k in obj.listens[i]) {
				this.listens[i][k] = obj.listens[i][k];
			}
		}
		return;
	}
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
