"use strict";
module.exports = function parse(data) {
    //Split the data by &
    let split = data.split(/&/g);
    //Now loop through and make each one of those an object with key and val
    for (let i = 0; i < split.length; i++) {

        let splitData = split[i].split('=');
        if (splitData.length > 1)
            split[i] = {
                key: splitData[0],
                val: splitData[1]
            };
    }
    let post = {};
    //Now loop through and set post[split[i].key] = split[i].val
    for (let i = 0; i < split.length; i++) {
        post[decodeURIComponent(split[i].key)] = decodeURIComponent(split[i].val);
    }
    return post;
}