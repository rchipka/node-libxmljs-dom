'use strict';
var NodeList = function(array) {
    array.item = item;
    return array;
}

function item(i) {
    return this[i];
}

module.exports = NodeList;
