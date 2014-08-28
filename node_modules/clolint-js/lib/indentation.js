'use strict';


var u = require('./util'),
    error = u.error,
    warning = u.warning,
    P = require('clojarse-js').parser;


function getEnd(node) {
    switch (P.nodeGroups.get(node._name)) {
        case 'token':
            return node._end;
        case 'hasBody':
            return node.close._end;
        case 'hasValue':
            return getEnd(node.value);
        case 'metadata':
            return getEnd(node.value);
        default:
            throw new Error('invalid call of getEnd on -- ' + grp);
    }
}
        

function struct(node) {
    var errs = [];
    if ( node.body.length === 0 ) {
        if ( ( node.open._end[0] !== node.close._start[0] ) ||
             ( node.open._end[1] !== node.close._start[1] ) ) {
            errs.push(warning('bad indentation -- closing brace of empty structure should immediately follow opening brace',
                              node.close._start, {}));
        }
        return errs;
    }
    var first = node.body[0],
        prev = node.body[0],
        self;
    // first
    if ( ( node.open._end[0] !== first._start[0] ) ||
         ( node.open._end[1] !== first._start[1] ) ) {
        errs.push(warning('bad indentation -- first form should immediately follow opening brace',
                          first._start, {}));
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
            errs.push(warning('bad indentation', self._start, {}));
        }
        errs = errs.concat(indentation(self));
        prev = self;
    }
    var nodeEnd = getEnd(prev);
//    console.log('positions -- ' + JSON.stringify([nodeEnd, node.close._start]));
    if ( ( nodeEnd[0] !== node.close._start[0] ) ||
         ( nodeEnd[1] !== node.close._start[1] ) ) {
        errs.push(warning('bad indentation -- closing brace should immediately follow last form',
                          node.close._start, {}));
    }
    return errs;
}

function clojure(node) {
    var errs = [],
        start;
    for (var i = 0; i < node.forms.length; i++) {
        start = node.forms[i]._start;
        if ( start[1] !== 1 ) {
            errs.push(warning('top-level forms must start at the first column', start, {}));
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

