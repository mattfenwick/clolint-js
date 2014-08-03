'use strict';

var T = require('./tokens');//,
//    F = require('./forms');


function f_token(node) {
    if ( node.type === 'integer' ) {
        return T.integer_digits(node);
    }
    return [];
}

function traverse(node) {
//    console.log(JSON.stringify(node));
    var errs = [];
    switch (node._tag) {
        case 'token':
            errs = errs.concat(f_token(node));
            break;
        case 'struct':
            node.elems.map(function(e) {
                errs = errs.concat(traverse(e));
            });
            break;
        default:
            throw new Error('unexpected AST node tag -- ' + JSON.stringify(node));
    }
    node.meta.map(function(m) {
        errs = errs.concat(traverse(m));
    });
    console.log('in traverse, errors: ' + JSON.stringify(errs));
    return errs;
}


module.exports = {
    'traverse': traverse
};

