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
//    console.log(JSON.stringify([node._start, first._start]));
    // first
    if ( node._name === 'clojure' ) {
        // nothing to do
    } else if ( first._start[0] !== node._start[0] ) {
        errs.push(warning('bad indentation -- first form should be on same line as opening brace',
                          node._start, {'element': first._start}));
    }
    errs = errs.concat(indentation(first));
    // rest
    for (var i = 1; i < node.body.length; i++) {
        self = node.body[i];
        if ( prev._start[0] === self._start[0] ) { // same line as previous
            // pass
        } else if ( self._start[1] === first._start[1] ) { // same column as first
            // pass
        } else if ( self._start[1] === (first._start[1] + 1) ) { // 1 column in from first
            // pass
        } else if ( prev._start[1] === self._start[1] ) { // same column as previous
            // pass
        } else {
            errs.push(warning('bad indentation', node._start, {'element': self._start}));
        }
//        console.log(JSON.stringify([self._start, first._start, node._start]) + "\n");
        errs = errs.concat(indentation(self));
        prev = self;
    }
    return errs;
}

function clojure(node) {
    var errs = [];
    for (var i = 0; i < node.body.length; i++) {
        if ( node.body[i]._start[1] !== 1 ) { // have to be in first column
            errs.push(warning('top-level forms must start at the first column', node._start, {'element': node.body[i]._start}));
        }
        errs = errs.concat(indentation(node.body[i]));
    }
    return errs;
}

// clojure, hasBody, hasValue, metadata, token
function indentation(node) {
//    console.log('node -- ' + node._name + '  ' + node._start);
    var errs = [],
        name = node._name;
    if ( name === 'clojure' ) { // TODO oops, special case, relies on this case coming before the next one
        return clojure(node);
    } else if ( St.hasBody.has(name) ) {
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

