'use strict';

var C = require('clojarse-js'),
    u = require('./util'),
    warning = u.warning,
    error = u.error;


// for functions
function shorthand_func(node, log, funcs) {
    if ( funcs.length !== 0 ) {
        var err = error('nested shorthand function', node.pos, {'positions': funcs.slice()});
        log.push(err);
    }
}

// %-symbols inside of #(...)'s
function arg_in(node, log) {
    var name = node.name;
    if ( ( name === '%' ) || ( name === '%&' ) ) {
        return;
    }
    var pos = [node.pos[0], node.pos[1] + 1];
    var n = C.tokens.parse_('number', name.slice(1), pos);
    if ( n.status !== 'success' ) {
        log.push(error('invalid %-arg', node.pos, {'error': n.value, 'text': name}));
    } else {
        var v = n.value; // it parsed correctly
        // TODO but is it valid according to the rest of the rules? (valid base, range, digits, etc.)
        if ( v.sign === '-' ) {
            log.push(error('%-args may not be negative', node.pos, {'actual': v}));
        }
        if ( v._name !== 'integer' ) {
            log.push(warning('%-args should be integers', node.pos, {'actual': v}));
        } else if ( v.base !== 10 ) {
            log.push(warning('%-args should use base10 notation', node.pos, {'actual': v}));
        } else if ( parseInt(v.digits, 10) > 20 ) {
            log.push(error('%-args may not exceed 20', node.pos, {'actual': v}));
        }
    }
}

function shorthand_arg(node, log, funcs) {
    if ( node.name[0] !== '%' ) {
        // nothing to do
    } else if ( node.ns !== null ) {
        log.push(warning('potentially confusing use of namespaced %-arg', node.pos, {'name': node.name, 'ns': node.ns}));
    } else if ( funcs.length > 0 ) {
        arg_in(node, log);
    } else {
        log.push(warning('%-args should not be used outside of #-shorthand functions', node.pos, {'symbol': node.name}));
    }
}

function traverse(node, log, funcs) {
    if ( node.type === 'symbol' ) {
        shorthand_arg(node, log, funcs);
    } else if ( node.type === 'function' ) {
        shorthand_func(node, log, funcs);
        funcs.push(node.pos);
        node.elems.map(function(e) {
            traverse(e, log, funcs);
        });
        funcs.pop();
    } else if ( node._tag === 'token' ) {
        // nothing to do
    } else if ( node._tag === 'struct' ) {
        node.elems.map(function(e) {
            traverse(e, log, funcs);
        });
    } else {
        throw new Error('unexpected error: no cases matched -- ' + JSON.stringify(node));
    }
}

function run(node) {
    var log = [],
        funcs = [];
    traverse(node, log, funcs);
    return log;
}

module.exports = {
    'run': run
};

