'use strict';

var S = require('./singleform');


var actions = {
    'integer': [S.integer_digits, S.integer_base],
    'float'  : [S.float_range]                   ,
    'char'   : [S.char_long]                     ,
    'ratio'  : [S.ratio_denominator]             ,
    'table'  : [S.table_even]                    ,
    'eval'   : [S.eval_reader]                   ,
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
    var errs = S.metadata_value(node);
    errs = errs.concat(S.metadata_meta(node));
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

