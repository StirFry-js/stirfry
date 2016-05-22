StirFry.prototype.use = function (obj) {
	//Set the listener
	this.on(obj.listener || obj.layer || obj.processor, obj.call);
}
