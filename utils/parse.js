'use strict';
module.exports = function(data) {
	//Split the data by &
	const split = data.split(/&/g);

	//Now loop through and make each one of those an object with key and val
	for (let i = 0; i < split.length; i++) {

		const splitData = split[i].split('=');

		if (splitData.length > 1) {
			split[i] = {
				key: splitData[0],
				val: splitData[1]
			};
		}
	}
	const post = {};
	//Now loop through and set post[split[i].key] = split[i].val

	for (let i = 0; i < split.length; i++) {
		post[decodeURIComponent(split[i].key)] = decodeURIComponent(split[i].val);
	}
	return post;
};
