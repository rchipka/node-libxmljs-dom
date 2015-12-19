'use strict';
var URL     = require('url');
var needle  = require('needle');

needle.defaults({
    follow: 3,
    compressed: true,
    parse_response: false,
    decode_response: true,
    follow_set_cookies: true,
    follow_set_referer: true,
    rejectUnauthorized: false
})

function HttpRequest(window, url, callback) {
    if (typeof url === 'string')
        url = URL.parse(url);
    var method  = url.method||'get';
    var href    = URL.format(url);
    if (url.host === null || url.protocol === null)
        href    = URL.resolve(URL.format(window.location), href);

    var data    = url.data;
    var opts = {
        proxy:      url.proxy,
        timeout:    url.timeout||30*1000,
        user_agent: url.user_agent||window.navigator.userAgent,
        //headers:    url.headers,
        headers: {
            referer:    url.referer||window.location.href,
        },
        cookies:    window.document.cookies,
        accept:     url.accept
    }

    needle.request(method, href, data, opts, function(err, res, data) {
        if (res.cookies !== undefined)
            window.document.cookies = res.cookies;
        callback(err, res, data);
    })
}

module.exports = HttpRequest;
