var libxmljs = require('libxmljs');

var doc = libxmljs.parseHtml('<div><img three/></div><img two/><img one/>');

console.log(doc.find('/descendant::img[last()]')[0].toString())
