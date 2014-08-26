'use strict';

var G = require('genhtml-js'),
    H = G.html,
    S = G.serialize;

var div = H.div;


function Output(elem) {
    // let's assume the elem is $("#output") -- a div
    this.elem = elem;
}


Output.prototype.render = function(result) {
    // blow away everything on this.elem
    this.elem.empty();
//    this.elem.clear();
//    this.elem.val(...)?
    this.elem.text(JSON.stringify(result));
};

module.exports = Output;

