'use strict';

var C = require('clojarse-js'),
    u = require('./util'),
    warning = u.warning,
    error = e.error;


// for functions
function shorthand(node, log, env, state) {
    if ( env._functions.length !== 0 ) {
        var err = error('nested shorthand function', node.pos, {'enclosing positions': env._functions});
        log.issue(err);
    }
    return env.add_function(node.pos);
}

// for symbols
function shorthand_args(node, log, env, state) {
    if ( ( env._functions.length === 0 ) || 
         ( node.ns !== null )            ||
         ( node.name[0] !== '%' ) ) {
        return env;
    }
    if ( ( node.name === '%' ) || ( node.name === '%&' ) ) {
        return env;
    }
    var pos = [node.pos[0], node.pos[1] + 1];
    var n = C.tokens.parse_('number', node.name.slice(1), pos);
    if ( n.status !== 'success' ) {
        log.issue(error('invalid %-arg', node.pos, {'error': n.value, 'text': node.name}));
    } else {
        var v = n.value; // it parsed correctly
        // TODO but is it valid according to the rest of the rules? (valid base, range, digits, etc.)
        if ( v.sign === '-' ) {
            log.issue(error('%-args may not be negative', node.pos, {'actual': v}));
        }
        if ( v._name !== 'integer' ) {
            log.issue(warning('%-args should be integers', node.pos, {'actual': v}));
        } else if ( v.base !== 10 ) {
            log.issue(warning('%-args should use base10 notation', node.pos, {'actual': v}));
        } else if ( parseInt(v.digits, 10) > 20 ) {
            log.issue(error('%-args may not exceed 20', node.pos, {'actual': v}));
        }
    }
    return env;
}


module.exports = {
    'shorthand'     : shorthand,
    'shorthand_args': shorthand_args,
};

