var libxmljs = require('../index');
var fs = require('fs');

var doc = libxmljs.parseHtml(fs.readFileSync(__dirname+'/css2xpath.html'));
doc.root().namespace('http://example.com/test/testing?test=true')

var tests = {
    'first-child': 'ul.items-2 li:first-child, ul.items-1 li:first-child',
    'not first-child': 'ul.items-2 li:not(:first-child)',
    'last-child': 'ul.items-2 li:last-child',
    'not last-child': 'ul.items-2 li:not(:last-child)',
    'only-child': 'li:only-child',
    'not only-child': 'li:not(:only-child)',
    'has': 'ul:has(li)',
    'contains next-sibling': 'li:contains("first") + li',
    'internal': 'a:internal',
    'not internal': 'a:not(:internal)',
    'external': 'a:external',
    'path': 'a:path("/test/page")',
    'domain': 'a:domain("test")',
    'https': 'a:https',
}

function qsa(selector) {
    return doc.querySelectorAll(selector);
}

module.exports.attributes = function(assert) {
    assert.ok(qsa('[only]').length === 1);
    assert.ok(qsa('[only="true"]').length === 1);
    assert.ok(qsa('[only*="ru"]').length === 1);
    assert.ok(qsa('[only^="tr"]').length === 1);
    assert.ok(qsa('[only$="ue"]').length === 1);
    assert.ok(qsa('.items-2 > li[items-2!="first"]').length === 1);
    assert.ok(qsa('[spaces~="first"]').length === 1);
    assert.ok(qsa('[spaces~="second"]').length === 1);
    assert.ok(qsa('[spaces~="t s"]').length === 0);
    assert.ok(qsa('[dashes|="first"]').length === 1);

    assert.done();
}

module.exports.contains = function(assert) {
    assert.ok(qsa('li:contains("only")').length === 1);
    assert.ok(qsa('li:contains("first") + li:contains("last")').length === 1);
    assert.done();
}

module.exports.ids = function(assert) {
    assert.ok(qsa('#only').length === 1);
    assert.done();
}

module.exports.skip = function(assert) {
    assert.ok(qsa('.items-2 li:skip(1)').length === 1);
    assert.done();
}
