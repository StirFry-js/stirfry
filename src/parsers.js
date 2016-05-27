//Function to parse post data
function parse(data) {
	//Split the data by &
	var split = data.split(/&/g);
	//Now loop through and make each one of those an object with key and val
	for (var i = 0; i < split.length; i++) {

		var splitData = split[i].split('=');
		if (splitData.length > 1)
			split[i] = {key: splitData[0], val: splitData[1]};
	}
	var post = {};
	//Now loop through and set post[split[i].key] = split[i].val
	for (var i = 0; i < split.length; i++) {
		post[decodeURIComponent(split[i].key)] = decodeURIComponent(split[i].val);
	}
	return post;
}

//Function to parse a cookie
function parseCookie(cookie) {
	//Set split to be the cookie split by semicolons
	var split = cookie.split(/; ?/g);
	//Now loop through and make each one of those an object with key and val
	for (var i = 0; i < split.length; i++) {

		var splitData = split[i].split('=');
		if (splitData.length > 1)
			split[i] = {key: splitData[0], val: splitData[1]};
	}
	var cookies = {};
	//Now loop through and set post[split[i].key] = split[i].val
	for (var i = 0; i < split.length; i++) {
		cookies[split[i].key] = split[i].val;
	}
	return cookies;

}
