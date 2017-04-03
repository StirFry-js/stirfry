"use strict";
module.exports = function formatDate(date) {
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let output = `${days[date.getDay()]}, the ${date.getDate()}${date.getDate()%10 == 1 && date.getDate() != 11 ? 'st':(date.getDate()%10 == 2 && date.getDate() != 12 ? 'nd':(date.getDate()%10 == 3 && date.getDate() != 13) ? 'rd':'th')} of ${months[date.getMonth()]}, ${date.getFullYear()} at ${date.getHours()}:${date.getMinutes().toString().length == 1 ? '0' + date.getMinutes.toString():date.getMinutes()}`;
    return output;
}