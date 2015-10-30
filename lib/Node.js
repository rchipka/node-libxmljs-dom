var NodeList = require('./NodeList.js');

Node = {
    appendChild: function(child) {
        this.__children = undefined;
        this.addChild(child)
        return child;
    },
    get baseURI() {
        return this.doc().defaultView.location.href;
    },
    get childElementCount() {
        return this.childNodes.length;
    },
    get childNodes() {
        return NodeList(this.__childNodes());
        if (!this.__children)
        this.__children = NodeList(this.__childNodes());
        return this.__children
    },
    get children() {
        return this.childNodes;
    },
    cloneNode: function(recursive) {
        return this.clone(recursive)
    },
    compareDocumentPosition: function(node) {
        var bitmask = 0;
        var h1 = this.hash();
        var h2 = node.hash();
        if (h1.length > h2.length) {
            bitmask += Node.DOCUMENT_POSITION_PRECEDING;
            if (h2.indexOf(h1) === 0) {
                bitmask += Node.DOCUMENT_POSITION_CONTAINS;
            }
        }else if (h2.length > h1.length) {
            bitmask += Node.DOCUMENT_POSITION_FOLLOWING;
            if (h1.indexOf(h2) === 0) {
                bitmask += Node.DOCUMENT_POSITION_CONTAINED_BY;
            }

        }
        return bitmask;
    },
    contains: function(node) {
        return node.path().indexOf(this.path()) === 0;
    },
    get firstChild() {
       return this.childNodes[0]||null;
    },
    get firstElementChild() {
        return this.firstChild;
    },
    // getFeature()
    getUserData: function(key) {
        if (this.__userData === undefined)
            return;
        return this.__userData[key];
    },
    hasAttributes: function() {
        return this.attrs().length !== 0;
    },
    hasChildNodes: function() {
        return this.childNodes.length !== 0;
    },
    insertBefore: function(node, sibling) {
        if (!sibling) {
            if (this.lastChild !== null)
                return this.lastChild.addNextSibling(node);
            return null;
        }
        return sibling.addPrevSibling(node);
    },
    isDefaultNamespace: function(namespace) {
        return true;
    },
    isEqualNode: function(node) {
        return this.toString() === node.toString();
    },
    isSameNode: function(node) {
        return this.hash() === node.hash();
    },
    isSupported: function(feature, version) {
        return true;
    },
    get lastElementChild() {
        return this.lastChild;
    },
    get lastChild() {
       return this.childNodes[this.childNodes.length-1]||null;
    },
    get localName() {
        return this.name();
    },
    lookupNamespaceURI: function() {
        return null;
    },
    lookupPrefix: function() {
        return null;
    },
    namespaceURI: null,
    get nextSibling() {
        return this.__nextSibling()
    },
    get nodeName() {
        if (this.nodeType === Node.DOCUMENT_NODE)
            return '#document';
        return this.name();
    },
    nodePrincipal: undefined,
    get nodeType() {
        if (this.documentElement !== undefined)
            return Node.DOCUMENT_NODE;
        return Node.ELEMENT_NODE;
    },
    get nodeValue() {
        // TODO: return text for Node.TEXT_NODE and Node.COMMENT_NODE
        return null;
    },
    normalize: function() {
        // TODO: remove empty text nodes and join adjacent text nodes
    },
    get ownerDocument() {
        return this.doc();
    },
    get parentElement() {
        if (this.parent === undefined)
            return null;
        return this.parent();
    },
    get parentNode() {
        if (this.parent === undefined)
            return null;
        return this.parent();
    },
    prefix: null,
    get previousSibling() {
        return this.prevSibling()
    },
    removeChild: function(child) {
        return child.remove();
    },
    replaceChild: function(newChild, oldChild) {
        return oldChild.replace(newChild);
    },
    setUserData: function(key, value, handler) {
        // TODO: handler callback on Node clone, import, rename, delete or adopt
        if (!this.__userData)
            this.__userData = {};
        this.__userData[key] = value;
    },
    get textContent() {
        return this.text();
    },
    DOCUMENT_POSITION_DISCONNECTED: 	1,
    DOCUMENT_POSITION_PRECEDING: 	2,
    DOCUMENT_POSITION_FOLLOWING: 	4,
    DOCUMENT_POSITION_CONTAINS: 	8,
    DOCUMENT_POSITION_CONTAINED_BY: 	16,
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 	32,
    ELEMENT_NODE:      1,
    ATTRIBUTE_NODE:    2,
    TEXT_NODE:         3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE:    6,
    PROCESSING_INSTRUCTION_NODE:	7,
    COMMENT_NODE:	8,
    DOCUMENT_NODE:	9,
    DOCUMENT_TYPE_NODE:	10,
    DOCUMENT_FRAGMENT_NODE:	11,
    NOTATION_NODE: 12,
}
module.exports = Node;