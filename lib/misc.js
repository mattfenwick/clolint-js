'use strict';


var u = require('./util'),
    error = e.error,
    warning = e.warning;


function indentation(node, log) {
    if ( node.elems.length === 0 ) {
        return;
    }
    // TODO fix this
    //   this check is just for expansions of reader macros that don't have positions, e.g. 'x -> (quote x)
    for (var j = 0; j < node.elems.length; j++) {
        if ( node.elems[j].pos === null ) {
            return;
        }
    }
    var first = node.elems[0],
        prev = node.elems[0],
        self;
    for (var i = 1; i < node.elems.length; i++) {
        self = node.elems[i];
        if ( prev.pos[0] === self.pos[0] ) { // same line as previous
            continue;
        } else if ( self.pos[1] === first.pos[1] ) { // same column as first
            continue;
        } else if ( self.pos[1] === (first.pos[1] + 2) ) { // 2 columns in from first
            continue;
        }
        log.issue(warning('bad indentation', node.pos, {'element': self.pos}));
        prev = self;
    }
}

function count_symbols(node, log) {
    log.symbol(node.ns, node.name);
}

function count_nodes(node, log) {
    if ( !log.hasOwnProperty('node_types') ) {
        log.node_types = {};
    }
    var type = node.type;
    if ( !log.node_types.hasOwnProperty(type) ) {
        log.node_types[type] = 0;
    }
    log.node_types[type]++;
}

module.exports = {
    'indentation'       : indentation       ,
    'count_symbols'     : count_symbols     ,
    'count_nodes'       : count_nodes       ,
};

