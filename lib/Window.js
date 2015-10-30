var History = require('./History.js');
var vm = require('vm');
var URL = require('url');
var Event = require('./Event.js');

function bindEvent(name, cb) {
    return cb;
}

var noop = function() {

}

function Window(context, request, opts, cb) {
    var window = this;
    this.location = {
        href: context.request?context.request.url:'http://localhost'
    }
    this.stack = {
        count: 0,
        push: function() {
            window.stack.count++;
        },
        pop: function() {
            if (--window.stack.count === 0 && window.stack.done) {
                window.stack.done();
            }
        }
    }
    this.document = context;
    this.document.defaultView = this;
    this.document.location = this.location;
    if (cb !== undefined) {
        this.events.load.push(function() {
            cb(window)
        })
    }
    if (!opts && typeof request !== 'function') {
        request = undefined;
        opts = request;
    }
    opts = opts||{};

    if (request !== undefined) {
        this.XMLHttpRequest = require('./XMLHttpRequest.js')(this, request);
    }
    this.eval = window.eval.bind(this);

    this.loadScript = function(index) {
        var script = window.document.scripts[index];
        if (script === undefined) {
            window.dispatchEvent('load');
            return;
        }
        if (script.src !== undefined) {
            if (request !== undefined && opts.loadExternalScripts !== false) {
                window.stack.push();
                request('get', URL.resolve(window.location.href, script.src), {}, function(err, res, data) {
                    if (err)
                        console.log("error:", err)
                    else if (res.headers && res.headers['content-type'] !== undefined && res.headers['content-type'].indexOf('javascript') === -1)
                        console.log("Got non javascript", res.headers['content-type'])
                    else
                        window.eval(data.toString());
                    window.loadScript(++index);
                    window.stack.pop();
                }, { headers: { referer: window.location.href }, accept: '*/*', parse: false })
            }
        }else{
            window.stack.push();
            var type = script.getAttribute('type');
            if (type !== null && type.toLowerCase().indexOf('text/j') === -1) {
                return window.loadScript(++index);
            }
            window.eval(script.text());
            window.loadScript(++index);
            window.stack.pop();
        }
    }
    if (opts.loadScripts !== false && window.document.scripts.length > 0) {
        this.loadScript(0);
    }else{
        window.dispatchEvent('load');
    }
}


function extend(obj1, obj2) {
    for (var key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            obj1[key] = obj2[key];
        }
    }
    return obj1;
}


Window.prototype = {
    get window() {
        return this;
    },
    history: new History(),
    navigator: require('./Navigator.js'),
    screen: {
        colorDepth: 24,
        pixelDepth: 24,
        availHeight: 1000,
        availWidth: 1000,
        width: 1000,
        height: 1000
    },
    events: {
        'load': [
            function(e) {
                this.dispatchEvent('DOMContentLoaded');
                this.document.querySelectorAll('[onload]').forEach(function(node) {
                })
            }
        ]
    },
    addEventListener: function(name, cb, capture) {
        if (this.events[name] === undefined)
            this.events[name] = [];
        var e = new Event(cb);
        e.target = this;
        e.currentTarget = e.target;
        e.type = name;
        this.events[name].push(e);
    },
    dispatchEvent: function(name) {
        var self = this;
        var event = this.events[name];
        if (event === undefined) return true;
        event.forEach(function(cb) {
            cb.call(self)
        })
    },
    alert: function(m) { console.log('alert:', m) },
    closed: false,
    defaultStatus: '',
    eval: function(code, window) {
        try {
            var self = window||this;
            if (this.__scriptContext === undefined) {
                Object.defineProperty(self, '__scriptContext', { value: vm.createContext(), enumerable:false });
                [self, Window.prototype].forEach(function(obj) {
                    Object.keys(obj).forEach(function(key) {
                        if (typeof self[key] === 'function')
                            self.__scriptContext[key] = self[key].bind(self);
                        else
                            self.__scriptContext[key] = self[key];
                    })
                });
            }
            this.__scriptContext.window = this.__scriptContext;
            this.__scriptContext.top = this.__scriptContext;
            this.__scriptContext.document = self.document;
            this.__scriptContext.setInterval = setInterval;
            this.__scriptContext.clearTimeout = clearTimeout;
            this.__scriptContext.console = console;
            var script = vm.createScript(code);
            script.runInContext(this.__scriptContext, {
              filename: "vm",
              displayErrors: true
            });
            for (var key in this.__scriptContext) {
                if (self[key] !== undefined) continue;
                self[key] = this.__scriptContext[key];
            }
            //console.log(context);
            return this.__scriptContext;
        } catch (err) {
            err.stack.replace(/\:([0-9]+)\:([0-9]+)/, function(m, m1, m2) {
                var lines = code.split("\n");
                for (line = parseInt(m1)-2; line < parseInt(m1); line++) {
                    if (!lines[line]) break;
                    console.log("Line "+m1+": "+lines[line].trim());
                }
            })
            console.log(code);
            console.log(err.stack);
        }
    },
    frameElement: null,
    frames: [],
    getComputedStyle: function(node) {
        return node.styles;
    },
    innerHeight: 1000,
    innerWidth: 1000,
    length: 1,
    name: '',
    opener: null,
    outerHeight: 1000,
    outerWidth: 1000,
    pageXOffset: 0,
    pageYOffset: 0,
    get parent() {
        return this;
    },
    screenLeft:0,
    screenTop:0,
    screenX:0,
    screenY:0,
    scrollX:0,
    scrollY:0,
    get self() {
        return this;
    },
    status: '',
    get top() {
        return this;
    },
    confirm: noop,
    prompt: noop,
    atob: function(s) { return (new Buffer(s, 'base64')).toString() },
    btoa: function(s) { return s.toString('base64') },
    blur: noop,
    close: noop,
    createPopup: noop,
    focus: noop,
    moveBy: noop,
    moveTo: noop,
    open: noop,
    print: noop,
    removeEventListener: noop,
    resizeBy: noop,
    resizeTo: noop,
    scroll: noop,
    scrollBy: noop,
    scrollTo: noop,
    stop: noop,
    setTimeout: function(cb, delay) {
        console.log("got setTimeout")
        var self = this;
        self.stack.push();
        setTimeout(function() {
            cb();
            self.stack.pop();
        }, delay)
    },
    setInterval: setInterval,
    clearTimeout: clearTimeout,
    clearInterval: clearInterval,
    console: console,
}

module.exports = Window;
