'use strict';

var C = require('clolint-js');


function V() {
    this.listeners = [];
}

V.prototype.input = function(text, args) {
    var checks = C.run(text, args);
    this.notify(checks);
};

V.prototype.listen = function(listener) {
    this.listeners.push(listener);
};

V.prototype.notify = function(data) {
    this.listeners.map(function(l) {
        l(data);
    });
};

module.exports = V;

