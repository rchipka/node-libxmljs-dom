'use strict';
var util    = require('util');
var Element = require('./Element.js');
var Location = require('./Location.js');

var noop = function(name) {
    return function() {
        console.log("DOCUMENT NOOP", name, JSON.stringify(arguments))
    }
}
var Document = {
    get activeElement() {
        return this.__activeElement||this.body;
    },
    set activeElement(el) {
        return this.__activeElement = el;
    },
    adoptNode: noop,
    alinkColor: '',
    get all() {
        return this.querySelectorAll('[id]');
    },
    get anchors() {
        return this.getElementsByTagName('a');
    },
    get applets() {
        return this.getElementsByTagName('applet');
    },
    get baseURI() {
        return this.URL;
    },
    bgColor: '',
    get body() {
        return this.getElementsByTagName('body')[0];
    },
    charset: 'UTF-8',
    characterSet: 'UTF-8',
    childElementCount: 1,
    get childNodes() {
        return this.documentElement.childNodes;
    },
    get children() {
        return this.documentElement;
    },
    close: function() {
        return this;
    },
    compatMode: 'CSS1Compat',
    contentType: 'text/html',
    cookies: {},
    get cookie() {
        var i = 0;
        var str = '';
        var keys = Object.keys(this.cookies);
        for (var i = 0; i < keys.length; i++) {
            str += keys[i]+':'+this.cookies[keys[i]];
            if (i !== keys.length-1)
                str += '; '
        }
        return str;
    },
    set cookie(val) {
        if (typeof val === 'object') {
            for (var key in val) {
                this.cookies[key] = val[key];
            }
            return;
        }
        var arr = val.split('; ');
        var i = arr.length;
        while (i--) {
            var cookie = arr[i].split(':');
            this.cookies[cookie[0], cookie[1]];
        }
    },
    currentScript: null,
    createAttribute: function(name) {
        //console.log('create attribute:', name);
        var el = this.createElement('attrElement');
        el.attr(name, '');
        return el.attr(name);
    },
    createComment: function(text) {
        //console.log('create comment:', text)
        return new libxmljs.Comment(this, text);
    },
    createDocument: function() {
        //console.log('create document')
        return new libxmljs.Document;
    },
    createDocumentFragment: function() {
        //console.log('create document fragment')
        var frag = this.createElement('#document-fragment');
        //Object.defineProperty
        return frag;
    },
    createElement: function(name) {
        //console.log('create element:', name)
        var child = new libxmljs.Element(this, name);
        if (name === 'script') {
            var window = this.defaultView;
            process.nextTick(function() {
                window.__evalScripts();
            })
        }
        return child;
    },
    createTextNode: function(text) {
        //console.log("create text:", text)
        return new libxmljs.Text(this, new String(text));
    },
    get defaultView() {
        if (this.__window === undefined)
            this.__window = new libxmljs.Window(this);
        return this.__window;
    },
    set defaultView(window) {
        this.__window = window;
    },
    designMode: 'off',
    dir: 'ltr',
    doctype: {

    },
    get documentElement() {
        if (!this.__documentElement)
            this.__documentElement = this.root();
        return this.__documentElement;
    },
    get documentURI() {
        return this.URL;
    },
    get domain() {
        return this.location.hostname;
    },
    get embeds() {
        return this.getElementsByTagName('embeds');
    },
    evaluate: function(xpath, context, namespace, resultType, result) {

    },
    fgColor: '',
    fonts: {

    },
    get forms() {
        return this.getElementsByTagName('form');
    },
    getElementById: function(id) {
        return this.querySelector('#'+id);
    },
    getElementsByClassName: function(name) {
        return this.documentElement.getElementsByClassName(name);
    },
    getElementsByName: function(name) {
        return this.documentElement.querySelectorAll('[name="'+name+'"]');
    },
    getElementsByTagName: function(name) {
        return this.documentElement.getElementsByTagName(name);
    },
    getElementsByTagNameNS: function(namespace, name) {
        return this.documentElement.getElementsByTagNameNS(name);
    },
    hasFocus: function() {
        return true;
    },
    get head() {
        return this.getElementsByTagName('head')[0];
    },
    hidden: false,
    get images() {
        return this.getElementsByTagName('img');
    },
    implementation: {
        hasFeature: function(name, version) {
            console.log("checking for feature", name, version);
            return true;
        }
    },
    importNode: noop,
    inputEncoding: 'UTF-8',
    get lastModified() {
        return this.defaultView.request.headers['last-modified'];
    },
    lastStyleSheet: null,
    linkColor: '',
    get links() {
        return this.querySelector('a[href]');
    },
    localName: null,
    get location() {
        if (this.__location === undefined)
            this.__location = new Location('http://localhost', this);
        return this.__location;
    },
    set location(val) {
        this.__location = new Location(val, this);
        if (this.documentElement !== null) {
            this.documentElement.attr({ 'url': this.__location.href });
        }
    },
    namespaceURI: null,
    open: function() {
        return this;
    },
    parse: function(str) {
        return libxmljs.parseHtml(str); // parseHtmlFragment when available
    },
    plugins: {},
    prefix: null,
    get querySelector() {
        return this.documentElement.querySelector;
    },
    get querySelectorAll() {
        return this.documentElement.querySelectorAll;
    },
    __readyState: "loading",
    get readyState() {
        if (this.querySelectorAll('script:not([ran])').length === 0)
            this.readyState = "complete";
        else
            this.readyState = "interactive";
        return this.__readyState;
    },
    set readyState(val) {
        if (val === this.__readyState) return;
        this.__readyState = val;
        this.dispatchEvent('readystatechange');
    },
    get referrer() {
        return this.request.headers.referer;
    },
    renameNode: function(node, namespaceURI, nodename) {

    },
    get scripts() {
        return this.getElementsByTagName('script');
    },
    title: function(str) {
        if (!str) {
            return this.querySelector('title').innerHTML;
        }else{

        }
    },
    visibilityState: 'visible',
    vlinkColor: '',
    write: function(data) {
        var script = this.currentScript;
        var b = libxmljs.parseHtml('<body>'+data+'</body>').get('body');
        if (!b) return;
        var children = b.childNodes;
        var i   = children.length;
        while (i--) {
            script.addNextSibling(children[i]);
        }
    },
    get URL() {
        return this.location.toString();
    },
};

var libxmljs = null;
module.exports = function(libxml) {
    libxmljs = libxml;
    return Document;
}
