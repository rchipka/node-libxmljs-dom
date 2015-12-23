var libxmljs = require('../index');
var fs = require('fs');

var doc = libxmljs.parseHtml(fs.readFileSync(__dirname+'/css2xpath.html'));
doc.location = 'http://example.com/test/testing?test=true';

var text = null;
function qsa(selector) {
    var res = doc.querySelectorAll(selector);
    if (res.length === 1) {
        text = res[0].text();
    }else{
        text = null;
    }
    return res;
}

module.exports.after = function(assert) {
    assert.ok(qsa('.items-2 li:first:after(.items-1)').length === 1 && text === 'first');
    assert.done();
}

module.exports.after_sibling = function(assert) {
    assert.ok(qsa('li:contains("last"):after-sibling(:contains("first"))').length === 1 && text === 'last');
    assert.done();
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
    assert.ok(qsa('ul/@class').length === qsa('ul').length)
    assert.done();
}

module.exports.before = function(assert) {
    assert.ok(qsa('#only:before(.items-2)').length === 1 && text === 'only');
    assert.done();
}

module.exports.before_sibling = function(assert) {
    assert.ok(qsa('li:contains("first"):before-sibling(:contains("last"))').length === 1 && text === 'first');
    assert.done();
}

module.exports.checked = function(assert) {
    assert.ok(qsa('input:checked').length === 1);
    assert.done();
}

module.exports.contains = function(assert) {
    assert.ok(qsa('li:contains("only")').length === 1);
    assert.ok(qsa('li:contains("first") + li:contains("last")').length === 1);
    assert.done();
}

module.exports.domain = function(assert) {
    assert.ok(qsa('a:domain("example.com")').length === qsa('a:internal').length);
    assert.ok(qsa('a:domain("external.com")').length === qsa('a:external').length);
    assert.done();
}

module.exports.empty = function(assert) {
    assert.ok(qsa('img:empty').length === 1);
    assert.ok(qsa('div:empty').length === 1);
    assert.ok(qsa('ul:empty').length === 0);
    assert.done();
}

module.exports.ends_with = function(assert) {
    assert.ok(qsa('li:ends-with("Nly")').length === 0);
    assert.ok(qsa('li:ends-with("only")').length === 1 && text === 'only');
    assert.ok(qsa('li:ends-with("nly")').length === 1 && text === 'only');
    assert.ok(qsa('li:iends-with("Nly")').length === 1 && text === 'only');
    assert.done();
}

module.exports.even = function(assert) {
    assert.ok(qsa('.items-3 li:even').length === 1 && text == 'second');
    assert.done();
}

module.exports.external = function(assert) {
    assert.ok(qsa('a:external').length === qsa('a').length-qsa('a:internal').length);
    assert.done();
}

module.exports.first_child = function(assert) {
    assert.ok(qsa('.items-2 li:first-child').length === 1 && text === 'first');
    assert.done();
}

module.exports.has = function(assert) {
    assert.ok(qsa('ul:has(#only[only="true"])').length === 1);
    assert.done();
}

module.exports.has_ancestor = function(assert) {
    assert.ok(qsa('li:contains("last"):has-parent(ul):has-ancestor(body)').length === 1 && text === 'last');
    assert.ok(qsa('li:contains("last"):has-ancestor(none)').length === 0);
    assert.done();
}

module.exports.has_parent = function(assert) {
    assert.ok(qsa('li:contains("last"):has-parent(ul)').length === 1 && text === 'last');
    assert.ok(qsa('li:contains("last"):has-parent(body)').length === 0);
    assert.done();
}

module.exports.has_sibling = function(assert) {
    assert.ok(qsa('li:contains("last"):has-sibling(li:contains("first"))').length === 1 && text === 'last');
    assert.ok(qsa('li:contains("last"):has-sibling(li:contains("last"))').length === 0);
    assert.done();
}

module.exports.ids = function(assert) {
    assert.ok(qsa('#only').length === 1);
    assert.done();
}

module.exports.internal = function(assert) {
    assert.ok(qsa('a:internal').length === qsa('a').length-qsa('a:external').length);
    assert.done();
}

module.exports.last_child = function(assert) {
    assert.ok(qsa('.items-2 li:last-child').length === 1 && text === 'last');
    assert.done();
}

module.exports.not = function(assert) {
    assert.ok(qsa('#only:not(#only)').length === 0);
    assert.ok(qsa(':not(#only)').length > 1);
    assert.ok(qsa('li:istarts-with("Fir"):not(:icontains("LAST")):icontains("ST")').length > 1);
    assert.done();
}

module.exports.nth_child = function(assert) {
    assert.ok(qsa('.items-3 li:nth-child(0)').length === 0);
    assert.ok(qsa('.items-3 li:nth-child(1)').length === 1 && text == 'first');
    assert.ok(qsa('.items-3 li:nth-child(2)').length === 1 && text == 'second');
    assert.ok(qsa('.items-3 li:nth-child(3)').length === 1 && text == 'third');
    assert.ok(qsa('.items-3 li:nth-child(even)').length === 1 && text == 'second');
    assert.ok(qsa('.items-3 li:nth-child(odd)').length === 2);
    assert.ok(qsa('.items-3 li:nth-child(2n)').length === 1 && text == 'second');
    assert.ok(qsa('.items-3 li:nth-child(3n+1)').length === 1 && text == 'first');
    assert.ok(qsa('.items-3 li:nth-child(3n+2)').length === 1 && text == 'second');
    assert.ok(qsa('.items-3 li:nth-child(2n+1)').length === 2);
    assert.ok(qsa('.items-3 li:nth-child(n+0)').length === 3);
    assert.ok(qsa('.items-3 li:nth-child(n+1)').length === 3);
    assert.ok(qsa('.items-3 li:nth-child(n+2)').length === 2);
    assert.ok(qsa('.items-3 li:nth-child(n+3)').length === 1);
    assert.ok(qsa('.items-3 li:nth-child(n+4)').length === 0);
    assert.done();
}

module.exports.nth_of_type = function(assert) {
    assert.ok(qsa('.items-3 li:nth-of-type(0)').length === 0);
    assert.ok(qsa('.items-3 li:nth-of-type(1)').length === 1 && text == 'first');
    assert.ok(qsa('.items-3 li:nth-of-type(even)').length === 1 && text == 'second');
    assert.ok(qsa('.items-3 li:nth-of-type(odd)').length === 2);
    assert.ok(qsa('.items-3 li:nth-of-type(2n)').length === 1 && text == 'second');
    assert.ok(qsa('.items-3 li:nth-of-type(3n+1)').length === 1 && text == 'first');
    assert.ok(qsa('.items-3 li:nth-of-type(3n+2)').length === 1 && text == 'second');
    assert.ok(qsa('.items-3 li:nth-of-type(2n+1)').length === 2);
    assert.ok(qsa('.items-3 li:nth-of-type(n+0)').length === 3);
    assert.ok(qsa('.items-3 li:nth-of-type(n+1)').length === 3);
    assert.ok(qsa('.items-3 li:nth-of-type(n+2)').length === 2);
    assert.ok(qsa('.items-3 li:nth-of-type(n+3)').length === 1);
    assert.ok(qsa('.items-3 li:nth-of-type(n+4)').length === 0);
    assert.done();
}

module.exports.odd = function(assert) {
    assert.ok(qsa('.items-3 li:odd').length === 2);
    assert.done();
}

module.exports.only_child = function(assert) {
    assert.ok(qsa('li:only-child').length === 1);
    assert.ok(qsa('ul:only-child').length === 0);
    assert.done();
}

module.exports.path = function(assert) {
    assert.ok(qsa('a:path("/test/page")').length === 1);
    assert.done();
}

module.exports.protocol = function(assert) {
    assert.ok(qsa('a:http').length === 5);
    assert.ok(qsa('a:https').length === 1);
    assert.done();
}

module.exports.range = function(assert) {
    assert.ok(qsa('.items-2 li:range(1, 3)').length === 2);
    assert.ok(qsa('.items-3 li:range(2, 3)').length === 2);
    assert.done();
}

module.exports.skip = function(assert) {
    assert.ok(qsa('.items-2 li:skip(1)').length === 1 && text == 'last');
    assert.ok(qsa('.items-3 li:skip(2)').length === 1 && text == 'third');
    assert.done();
}

module.exports.skip_last = function(assert) {
    assert.ok(qsa('.items-3 li:skip-last').length === 2);
    assert.ok(qsa('.items-2 li:skip-last').length === 1 && text == 'first');
    assert.ok(qsa('.items-3 li:skip-last(2)').length === 1 && text == 'first');
    assert.done();
}

module.exports.starts_with = function(assert) {
    assert.ok(qsa('.items-2 li:starts-with("fir")').length === 1 && text == 'first');
    assert.ok(qsa('.items-2 li:istarts-with("FIR")').length === 1 && text == 'first');
    assert.done();
}
