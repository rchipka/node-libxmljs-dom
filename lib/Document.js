var util    = require('util');
var Element = require('./Element.js')
var NodeList = require('./NodeList.js')

var noop = function() {
    console.log("DOCUMENT NOOP")
}
var Document = {
    readyState: "complete",
    get anchors() {
        return this.getElementsByTagName('a');
    },
    get applets() {
        return this.getElementsByTagName('applet');
    },
    get body() {
        return this.getElementsByTagName('body')[0];
    },
    get head() {
        return this.getElementsByTagName('head')[0];
    },
    get images() {
        return this.getElementsByTagName('img');
    },
    get links() {
        return this.querySelector('a[href]');
    },
    get scripts() {
        if (this.__scripts === undefined)
            this.__scripts = this.getElementsByTagName('script');
        return this.__scripts;
    },
    get cookie() {
        return '';
    },
    addEventListener: function(name) {
        console.log("DOCUMNT EVENT", name)
    },
    set cookie(val) {
        console.log("SET COOKIE", val)
    },
    createDocumentFragment: function() {
        return libxmljs.parseHtml('<body></body>').root();
    },
    createElement: function(name) {
        console.log("CREATING:", name)
        var child =  (new libxmljs.Element(this, name));
        //this.documentElement.addChild(child);
        return child;
    },
    createTextNode: noop,
    get defaultView() {
        if (this.__window === undefined)
            this.__window = new libxmljs.Window(this);
        return this.__window;
    },
    set defaultView(window) {
        this.__window = window;
    },
    get documentElement() {
        if (!this.__documentElement)
            this.__documentElement = this.root();
        return this.__documentElement;
    },
    evaluate: function(xpath, context, namespace, resultType, result) {

    },
    getElementById: function(id) {
        return this.querySelector('#'+id);
    },
    getElementsByTagName: function(name) {
        return this.documentElement.getElementsByTagName(name);
    },
    getElementsByName: function(name) {
        return this.documentElement.querySelectorAll('[name="'+name+'"]');
    },
    hasFocus: function() {
        return true;
    },
    get querySelector() {
        return this.documentElement.querySelector;
    },
    get querySelectorAll() {
        return this.documentElement.querySelectorAll;
    },
    get referrer() {
        return this.request.headers.referer;
    },
    title: function(str) {
        if (!str) {
        }else{

        }
    },
    parse: function(str) {
        return libxmljs.parseHtml(str);
    },
    renameNode: function(node, namespaceURI, nodename) {

    },
    write: function(data) {
        return;
        console.log("WRITE")
        this.writeBuffer += data;
        var res = parser.libxml.parseHtml(this.writeBuffer);
        var errors = res.errors;
        var lastError = errors[errors.length-1]
        if (lastError && lastError.code === 73) { // no end tag found
            //console.log(errors);
        }else{
            var body = this.body;
            parser.libxml.parseHtml('<body>'+this.writeBuffer+'</body>')
            .get('body').childNodes().forEach(function(child) {
                body.addChild(child);
            })
            this.writeBuffer = '';
        }
    },
    charset: 'UTF-8',
    characterSet: 'UTF-8'
};

var libxmljs = null;
module.exports = function(libxml) {
    libxmljs = libxml;
    return Document;
}
