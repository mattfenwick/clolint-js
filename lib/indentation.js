'use strict';


var u = require('./util'),
    error = u.error,
    warning = u.warning,
    St = require('clojarse-js').structure;


function struct(node) {
    if ( node.body.length === 0 ) {
        return [];
    }
    var first = node.body[0],
        prev = node.body[0],
        self,
        errs = [];
    for (var i = 1; i < node.body.length; i++) {
        self = node.body[i];
        if ( prev._start[0] === self._start[0] ) { // same line as previous
            continue;
        } else if ( self._start[1] === first._start[1] ) { // same column as first
            continue;
        } else if ( self._start[1] === (first._start[1] + 2) ) { // 2 columns in from first
            continue;
        } // TODO what about same column as previous?
        errs.push(warning('bad indentation', node._start, {'element': self._start}));
        prev = self;
    }
    node.body.map(function(e) {
        errs = errs.concat(indentation(e));
    });
    return errs;
}

// hasBody, hasValue, metadata, token
function indentation(node) {
    console.log('poopoy');
    var errs = [],
        name = node._name;
    console.log('name -- ' + name);
    if ( St.hasBody.has(name) ) {
        return struct(node);
    } else if ( St.hasValue.has(name) ) {
    
    } else if ( name === 'metadata' ) {
    
    } else { // it's a token -- number, string, regex, char, ident
    
    }
    return errs;
}

function run(node) {
    return indentation(node);
}

module.exports = {
    'indentation'       : indentation       ,
    'run'               : run               ,
};

