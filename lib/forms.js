'use strict';

var u = require('./util'),
    error = u.error;


var allows_metadata = {
    'table': 1, 'set': 1, 'list': 1,
    'vector': 1, 'function': 1, 'symbol': 1
};

function metadata_value(node) {
    var errs = [];
    if ( node.meta.length > 0 ) {
        if ( !allows_metadata.hasOwnProperty(node.type) ) {
            errs.push(error('form does not support metadata', node.pos, {'type': node.type}));
        }
    }
    return errs;
}

var can_be_metadata = {
    'keyword': 1, 'autokey': 1,
    'symbol': 1, 'string': 1, 'table': 1
};

function metadata_meta(node) {
    var errs = [];
    node.meta.map(function(m) {
        if ( !can_be_metadata.hasOwnProperty(m.type) ) {
            errs.push(error('invalid metadata type', m.pos, {'type': m.type}));
        }
    });
    return errs;
}

function table_even(node) {
    var errs = [];
    if ( ( node.elems.length % 2 ) === 1 ) {
        errs.push(error('uneven number of elements in table', node.pos, {'number': node.elems.length}));
    }
    return errs;
}

function eval_reader(node) {
    if ( node.elems.length !== 1 ) {
        throw new Error('eval form must have exactly one child');
    }
    var form = node.elems[0],
        errs = [];
    if ( form.type === 'symbol' ) {
        // good to go
    } else if ( form.type === 'list' ) {
        if ( form.elems.length === 0 ) {
            errs.push(error('list in eval reader must have at least one form', form.pos, {}));
        }
    } else {
        errs.push(error('eval reader requires symbol or list', node.pos, {'actual': form.type}));
    }
    return errs;
}

module.exports = {
    'metadata_value'    : metadata_value    ,
    'metadata_meta'     : metadata_meta     ,
    'table_even'        : table_even        ,
    'eval_reader'       : eval_reader       ,
};

