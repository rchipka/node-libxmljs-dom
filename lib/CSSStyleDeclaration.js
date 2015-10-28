var CSSStyleDeclaration = function(str) {
    Object.defineProperty(this, 'length', { value: 0 });
    this.styles = {};
    var self = this;
    console.log('styles');
    str.split(';').forEach(function(style) {
        self.length++;
        var s = style.split('=');
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
        return this.styles[key];
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
        this[key] = value;
    },
    getPropertyCSSValue: function() {

    }
}

module.exports = CSSStyleDeclaration;
