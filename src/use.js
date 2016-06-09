StirFry.prototype.use = function (obj) {
	if (obj.listens) {
		//Add all its listeners
		for (var i in obj.listens) {
			for (var k in obj.listens[i]) {
				this.listens[i][k] = obj.listens[i][k];
			}
		}
		return;
	}
}
