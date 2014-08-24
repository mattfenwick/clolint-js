'use strict';


var u = require('./util'),
    error = u.error,
    warning = u.warning,
    P = require('clojarse-js').parser;


function struct(node) {
    var errs = [];
    if ( node.body.length === 0 ) {
        if ( node._start[0] !== node._end[0] ) {
            errs.push(warning('bad indentation -- close brace of empty structure should be on same line as opening brace',
                              node._start, {'element': node._end}));
        }
        return errs;
    }
    var first = node.body[0],
        prev = node.body[0],
        self;
//    console.log(JSON.stringify([node._start, first._start]));
    // first
    if ( first._start[0] !== node._start[0] ) {
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
        errs = errs.concat(indentation(self));
        prev = self;
    }
    if ( prev._end[0] !== node.close._start[0] ) {
        errs.push(warning('bad indentation -- closing punctuation should appear on same line as last form',
                          node._start, {'element': prev._start}));
    }
    return errs;
}

function clojure(node) {
    var errs = [];
    for (var i = 0; i < node.forms.length; i++) {
        if ( node.forms[i]._start[1] !== 1 ) { // have to be in first column
            errs.push(warning('top-level forms must start at the first column', node._start, {'element': node.forms[i]._start}));
        }
        errs = errs.concat(indentation(node.forms[i]));
    }
    return errs;
}

function indentation(node) {
    var errs = [],
        grp = P.nodeGroups.get(node._name);
    if ( grp === 'clojure' ) {
        return clojure(node);
    } else if ( grp === 'hasBody' ) {
        return struct(node);
    } else if ( grp === 'hasValue' ) {
    
    } else if ( grp === 'metadata' ) {
    
    } else if ( grp === 'token' ) {
    
    } else {
        throw new Error('unexpected group -- ' + grp);
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

