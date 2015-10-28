var util = require('util');
var NodeList = require('./NodeList.js');
var Event = require('./Event.js');
var CSSStyleDeclaration = require('./CSSStyleDeclaration.js');

var noop = function() {
}

var Element = {
    accessKey: null,
    addEventListener: function(name, cb) {
        if (this.events === undefined)
            this.events = {};
        if (this.events[name] === undefined)
            this.events[name] = [];
        var e = new Event(cb);
        e.target = this;
        e.currentTarget = e.target;
        e.type = name;
        this.events[name].push(e);
    },
    get attributes() {
        var obj = {};
        this.attrs().forEach(function(attr) {
            obj[attr.name()] = attr.value();
        })
        return obj;
    },
    blur: noop,
    get childElementCount() {
        return this.childNodes.length;
    },
    get children() {

    },
    classList: {
        get length() {
            return this.__classes.length;
        }
    },
    get className() {
        return this.getAttribute('class')||'';
    },
    click: noop,
    clientHeight: null,
    clientLeft: null,
    clientTop: null,
    clientWidth: null,
    checked: false,
    contentEditable: null,
    removeEventListener: function(ev, cb) {
        if (ev.indexOf('load')) cb();
    },
    setAttribute: function(name, value) {
        this.attr(name, value);
    },
    dir: null,
    dispatchEvent: function(name) {
        if (this.events === undefined)
            this.events = {};
        if (this.events[name] === undefined) return true;
        this.events[name].forEach(function(e) {
            e.cb(e);
        })
    },
    get: function(selector) {
        return this.find(selector)[0]||null;
    },
    firstElementChild: null,
    focus: function() {
    },
    getAttribute: function(name) {
        if (this.attr !== undefined)
            return this.attr(name);
        else
            return null;
    },
    getAttributeNode: noop,
    getElementsByClassName: function(name) {
        return this.querySelectorAll('.'+name);
    },
    getElementsByTagName: function(name) {
        return this.querySelectorAll(name);
    },
    id: null,
    get innerHTML() {
        if (this.documentElement === undefined) {
            var src = this.toString(false);
            return src.substring((src.indexOf(">")||-1)+1, src.lastIndexOf("<")||src.length)
        }else
            return this.toString(false);
    },
    set innerHTML(str) {
        var self = this;
        var doc = this.doc().parse('<body>'+str+'</body>').root()
        if (doc === null) {
            self.text(str);
            return;
        }
        var body = doc.get('body');
        if (body !== null)
            doc = body;
        self.text("");
        doc.__childNodes().forEach(function(child) {
            self.appendChild(child);
        })
    },
    isContentEditable: null,
    lang: null,
    lastElementChild: null,
    nextElementSibling: null,
    offsetHeight: null,
    offsetWidth: null,
    offsetLeft: null,
    offsetParent: null,
    offsetTop: null,
    previousElementSibling: null,
    querySelector: function(selector) {
        var res = this.get(this.css2xpath(selector));
        if (!res) return null;
        return res;
    },
    querySelectorAll: function(selector) {
        var arr = this.find(this.css2xpath(selector))||[];
        arr.forEach(function(el, i) {
            arr[i] = el;
        })
        return NodeList(arr);
    },
    removeAttribute: noop,
    removeAttributeNode: noop,
    removeEventListener: noop,
    scrollHeight: null,
    scrollLeft: null,
    scrollTop: null,
    scrollWidth: null,
    setAttribute: function(name, val) {
        var attr = {};
        attr[name] = val;
        this.attr(attr);
    },
    get src() {
        return this.getAttribute('src')||undefined;
    },
    set src(url) {
    },
    get style() {
        if (!this.__styles)
            this.__styles = new CSSStyleDeclaration(this.getAttribute('style')||'');
        return this.__styles;
    },
    set style(str) {
        var arr = str.split(':');
    },
    tabIndex: null,
    tagName: null,
    title: null,
}

module.exports = Element;
