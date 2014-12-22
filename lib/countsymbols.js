'use strict';

var D = require('data-js/lib/dict'),
    u = require('./util'),
    warning = u.warning;


function addSymbol(symbols, node) {
    // TODO separating with a / is pretty silly
    var symName = node.name + '/' + (node.ns === null ? '' : node.ns);
    if ( !symbols.has(symName) ) {
        symbols.set(symName, []);
    }
    symbols.get(symName).push(node.pos);
}

function collectSymbols(symbols, node) {
    if ( node.type === 'symbol' ) {
        addSymbol(symbols, node);
    } else if ( node._tag === 'struct' ) {
        node.elems.map(function(e) {
            collectSymbols(symbols, e);
        });
        node.meta.map(function(e) {
            collectSymbols(symbols, e);
        });
    } else if ( node._tag === 'token' ) {
        // all tokens except for `symbol`
    } else {
        throw new Error('unrecognized node -- ' + node.type);
    }
}

function run(node, minTimes) {
    var symbols = new D({}),
        errors = [];
    collectSymbols(symbols, node);
    symbols.items().map(function(i) {
        if ( i[1].length <= minTimes ) {
            errors.push(warning('symbol ' + i[0] + ' seen rarely', i[1][0], {'positions': i[1].slice(1)}));
        }
    });
    return errors;
}

module.exports = {
    'run': run,
};

