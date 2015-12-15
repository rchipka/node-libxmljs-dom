'use strict';
var needle = require('needle');
var URL = require('url');

module.exports = function(window) {
    var XMLHttpRequest = function() {
        this.opts = {
            parse: false
        };
    }

    XMLHttpRequest.prototype = {
        status: 200,
        statusText: '',
        readyState: 0,
        withCredentials: false,
        getAllResponseHeaders: function() {

        },
        getResponseHeader: function(header) {

        },
        setRequestHeader: function(header, value) {
            if (this.opts.headers === undefined)
                this.opts.headers = {};
            this.opts.headers[header] = value;
        },
        open: function(method, url, async, user, pass) {
            this.method = method;
            this.setRequestHeader('Referer', window.location.href);
            this.setRequestHeader('Cookie', window.document.cookie);
            this.url = URL.format(URL.resolve(window.location.href, url));
            this.async = async;
            this.user = user;
            this.pass = pass;
            this.readState = 1;
        },
        overrideMimeType: function(mime) {

        },
        send: function(data) {
            var self = this;
            window.__stackPush();
            needle.request(this.method, this.url, data, function(err, res, data) {
                self.readyState = 4;
                self.responseText = data;
                if (self.onreadystatechange !== undefined) {
                    self.onreadystatechange();
                }else if (self.onload !== undefined) {
                    self.onload();
                }
                window.__stackPop();
            }, this.opts)
        }
    }

    return XMLHttpRequest;
}
