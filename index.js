var libxmljs    = require('libxmljs');
var css2xpath   = require('./lib/css2xpath.js');

libxmljs.css2xpath = css2xpath;
var Window = require('./lib/Window.js');
libxmljs.Window                         = Window;

var XMLDocument = libxmljs.Document.prototype;
var XMLElement  = libxmljs.Element.prototype;

XMLDocument.css2xpath   = libxmljs.css2xpath;
XMLDocument.doc = function() {
    return this;
}

XMLElement.css2xpath    = libxmljs.css2xpath;
XMLElement.__childNodes = XMLElement.childNodes;
XMLElement.__nextSibling = XMLElement.nextSibling;
delete XMLElement.childNodes;

var Node = require('./lib/Node.js');
var Element = extend(require('./lib/Element.js'), Node, true);
extend(XMLElement, Element);

var Document = extend(require('./lib/Document.js')(libxmljs), Node, true);
extend(XMLDocument, Document)

function extend(parent, child, enumerable) {
    for (var key in child) {
        var desc = Object.getOwnPropertyDescriptor(child, key);
        if (desc.value !== undefined) {
            parent[key] = child[key];
        }else{
            Object.defineProperty(parent, key, { get: desc.get, set: desc.set, enumerable: true, configurable: true });
        }
    }
    return parent;
}

module.exports = libxmljs;