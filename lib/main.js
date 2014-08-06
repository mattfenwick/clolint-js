'use strict';

var T = require('./tokens'),
    F = require('./forms');

var actions = {
    'integer': [T.integer_digits, T.integer_base],
    'float'  : [T.float_range]                   ,
    'char'   : [T.char_long]                     ,
    'ratio'  : [T.ratio_denominator]             ,
    'table'  : [F.table_even]                    ,
    'eval'   : [F.eval_reader]                   ,
};

function node_check(node) {
//    console.log('bye -- ' + JSON.stringify(node));
    if ( !actions.hasOwnProperty(node.type) ) {
        return [];
    }
    var errs = [];
    actions[node.type].map(function(a) {
        errs = errs.concat(a(node));
    });
    return errs;
}

function all_nodes(node) {
    var errs = F.metadata_value(node);
    errs = errs.concat(F.metadata_meta(node));
    return errs;
}

function traverse(f) {
    return function inner(node) {
        var errs = [];
        errs = errs.concat(f(node));
        switch (node._tag) {
            case 'token':
                break;
            case 'struct':
                node.elems.map(function(e) {
                    errs = errs.concat(inner(e));
                });
                break;
            default:
                throw new Error('unexpected AST node tag -- ' + JSON.stringify(node));
        }
        node.meta.map(function(m) {
            errs = errs.concat(inner(m));
        });
        return errs;
    };
}



function standard(node) {
    var errs = traverse(node_check)(node);
    errs = errs.concat(traverse(all_nodes)(node));
    return errs;
}

module.exports = {
    'node_check': node_check,
    'traverse'  : traverse  ,
    'standard'  : standard
};

