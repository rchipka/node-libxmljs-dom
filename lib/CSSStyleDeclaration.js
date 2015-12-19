'use strict';
var CSSStyleDeclaration = function(str, obj) {
    Object.defineProperty(this, 'length', { value: 0, writable: true });
    var self = this;
    str.split(';').forEach(function(style) {
        self.length++;
        var s = style.split(':');
        if (s[0].length > 0)
        self[s[0]] = s[1];
    })
}

CSSStyleDeclaration.prototype = {
    get cssText() {
        var str = '';
        for (key in this) {
            str += key+':'+this[key];
        }
        return str;
    },
    parentRule: null,
    getPropertyPriority: function() {
        return '';
    },
    getPropertyValue: function(key) {
        return this[key];
    },
    item: function(i) {
        for (var key in this) {
            if (--i !== 0) continue;
            return key;
        }
    },
    removeProperty: function(key) {
            delete this[key];
    },
    setProperty: function(key, value, important) {
        console.log('setProperty', key, value)
        this[key] = value;
    },
    getPropertyCSSValue: function() {

    }
}

module.exports = CSSStyleDeclaration;
