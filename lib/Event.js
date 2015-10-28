var Event = function(cb) {
    this.cb = cb;
    this.timeStamp = (new Date()).getTime();
}

Event.prototype = {
    bubbles:            true,
    cancelable:         true,
    target:             null,
    currentTarget:      null,
    defaultPrevented:   false,
    eventPhase:         2,
    type:               null,
    isTrusted:          false,
    preventDefault:     function() {

    },
    stopImmediatePropagation: function() {

    },
    stopPropagation:    function() {

    }
}

var phases = {
    NONE: 0,
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE:	3
}

module.exports = Event;
