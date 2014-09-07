'use strict';


var u = require('./util'),
    error = u.error,
    warning = u.warning;


function ratio_denominator(node) {
    var is_all_zeros = true,
        den = node.denominator;
    for (var i = 0; i < den.length; i++) {
        if ( den[i] !== '0' ) {
            is_all_zeros = false;
        }
    }
    if ( is_all_zeros ) {
        return [error('divide by 0', node.pos, {})];
    }
    return [];
}

function integer_base(node) {
    var base = parseInt(node.base, 10);
    if ( base > 36 ) {
        return [error('radix too large', node.pos, {'radix': base})];
    } else if ( base <= 1 ) {
        return [error('radix too small', node.pos, {'radix': base})];
    }
    return [];
}

function integer_digits(node) {
    var base = node.base,
        errs = [];
    node.digits.split('').map(function(d) {
        var norm,
            c = d.charCodeAt();
        if ( ( c >= 48 ) && ( c <= 57 ) ) { // 0-9
            norm = (c - 48);
        } else if ( ( c >= 65 ) && ( c <= 90 ) ) { // A-Z
            norm = ((c - 65) + 10);
        } else if ( ( c >= 97 ) && ( c <= 122 ) ) { // a-z
            norm = ((c - 97) + 10);
        } else {
            throw new Error('unrecognized digit in ' + JSON.stringify(node));
        }
        if ( norm >= base ) {
            errs.push(error('out of range digit', node.pos, {'digit': d, 'base': base})); // TODO wrong position
        }
    });
    return errs;
}

function float_range(node) {
    var errs = [];
    if ( node.exponent === null ) {
        // TODO what about floats with really big decimal parts? i.e. 330 digits
        return errs;
    }
    var s = node.exponent.sign,
        exp_sign = ( s === null ) ? '' : s,
        exp = parseInt(exp_sign + node.exponent.power, 10),
        d = {'exponent': exp};
    if ( node.suffix === null ) {
        // it's a float: maxes out at about 1e308 or 1e309
        // bottoms out at about 1e-323 or 1e-324
        if ( exp > 308 ) {
            errs.push(warning('possible float overflow', node.pos, d));
        } else if ( exp < -323 ) {
            errs.push(warning('possible float underflow', node.pos, d));
        }
    } else {
        // it's a big decimal
        // exponent has to fit in 32 bits, so between -2147483647 and 2147483647
        if ( exp > 2147473647 ) {
            errs.push(warning('possible big decimal overflow', node.pos, d));
        } else if ( exp < -2147483647 ) {
            errs.push(warning('possible big decimal underflow', node.pos, d));
        }
    }
    return errs;
}

var long_chars = {
    "newline"   : 1,
    "space"     : 1,
    "tab"       : 1,
    "backspace" : 1,
    "formfeed"  : 1,
    "return"    : 1
};

function char_long(node) {
    if ( node.kind !== 'long' ) {
        return [];
    }
    if ( !(long_chars.hasOwnProperty(node.value)) ) {
        return [error('invalid long char', node.pos, {'value': node.value})];
    }
    return [];
}

var _octal_low = 0,
    _octal_high = 255;

function char_octal(node) {
    if ( node.kind !== 'octal' ) {
        return [];
    }
    var val = parseInt(node.value, 8);
    if ( ( val < _octal_low ) ||
         ( val > _octal_high ) ) {
        return [error('invalid octal character: out of range', node.pos, {'value': node.value})];
    }
    return [];
}

var _surrogate_start = 55296, // D800
    _surrogate_stop  = 57343; // DFFF

function char_unicode(node) {
    if ( node.kind !== 'unicode' ) {
        return [];
    }
    var val = parseInt(node.value, 16);
    if ( ( val >= _surrogate_start ) &&
         ( val <= _surrogate_stop ) ) {
        return [error('invalid unicode character: surrogate code unit', node.pos, {'value': node.value})];
    }
    return [];
}

function string_chars(node) {
    var errs = [];
    node.value.map(function(c) {
        if ( c._name === 'octal' ) {
            var val = parseInt(c.value, 8);
            if ( ( val < _octal_low ) ||
                 ( val > _octal_high ) ) {
                errs.push(error('invalid octal string escape: out of range', node.pos, {'value': c.value}));
            }
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


var actions = {
    'integer': [integer_digits, integer_base]  ,
    'float'  : [float_range]                   ,
    'char'   : [char_long, char_unicode, char_octal],
    'ratio'  : [ratio_denominator]             ,
    'table'  : [table_even]                    ,
    'eval'   : [eval_reader]                   ,
    'string' : [string_chars]                  ,
};

function node_check(node) {
    if ( !actions.hasOwnProperty(node.type) ) {
        return [];
    }
    var errs = [];
    actions[node.type].map(function(a) {
        errs = errs.concat(a(node));
    });
    return errs;
}



// forms

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


// traversal machinery

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

function run_metadata(node) {
    function f_meta(node) {
        var errs = metadata_value(node);
        errs = errs.concat(metadata_meta(node));
        return errs;
    }
    return traverse(f_meta)(node);
}

function run_singles(node) {
    return traverse(node_check)(node);
}

function run(node) {
    var errs = run_singles(node);
    errs = errs.concat(run_metadata(node));
    return errs;
}



module.exports = {
    'checks': {
        // tokens
        'ratio_denominator' : ratio_denominator ,
        'integer_base'      : integer_base      ,
        'integer_digits'    : integer_digits    ,
        'float_range'       : float_range       ,
        'char_long'         : char_long         ,
        // 
        'metadata_value'    : metadata_value    ,
        'metadata_meta'     : metadata_meta     ,
        'table_even'        : table_even        ,
        'eval_reader'       : eval_reader       ,
    },
    'run': run
};

