'use strict';

var tokens = require('../parser/tokens');


function warning(message, position, obj) {
    obj.severity = 'warning';
    obj.message = message;
    obj.position = position;
    return obj;
}

// log an error -- not an error effect
function error(message, position, obj) {
    obj.severity = 'error';
    obj.message = message;
    obj.position = position;
    return obj;
}


var allows_metadata = {
    'table': 1, 'set': 1, 'list': 1,
    'vector': 1, 'function': 1, 'symbol': 1
};

function metadata_value(node, state, log, env) {
    if ( node.meta.length > 0 ) {
        if ( !allows_metadata.hasOwnProperty(node.type) ) {
            log.issue(error('form does not support metadata', node.pos, {'type': node.type}));
        }
    }
}

var can_be_metadata = {
    'keyword': 1, 'autokey': 1,
    'symbol': 1, 'string': 1, 'table': 1
};

function metadata_meta(node, state, log, env) {
    node.meta.map(function(m) {
        if ( !can_be_metadata.hasOwnProperty(m.type) ) {
            log.issue(error('invalid metadata type', m.pos, {'type': m.type}));
        }
    });
}

function ratio_denominator(node, state, log, env) {
    var is_all_zeros = true,
        den = node.denominator;
    for (var i = 0; i < den.length; i++) {
        if ( den[i] !== '0' ) {
            is_all_zeros = false;
        }
    }
    if ( is_all_zeros ) {
        log.issue(error('divide by 0', node.pos, {}));
    }
}

function integer_base(node, state, log, env) {
    var base = parseInt(node.base, 10);
    if ( base > 36 ) {
        log.issue(error('radix too large', node.pos, {'radix': base}));
    } else if ( base <= 1 ) {
        log.issue(error('radix too small', node.pos, {'radix': base}));
    }
}

function integer_digits(node, state, log, env) {
    var base = parseInt(node.base, 10);
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
            console.log(norm + ' -- ' + base);
            log.issue(error('out of range digit', node.pos, {'digit': d})); // TODO wrong position
        }
    });
}

function float_range(node, state, log, env) {
    if ( node.exponent === null ) {
        return;
    }
    var s = node.exponent.sign,
        exp_sign = ( s === null ) ? '' : s,
        exp = parseInt(exp_sign + node.exponent.power, 10),
        d = {'exponent': exp};
    if ( node.suffix === null ) {
        // maxes out at about 1e308 or 1e309
        // bottoms out at about 1e-323 or 1e-324
        if ( exp > 308 ) {
            log.issue(warning('possible floating-point overflow', node.pos, d));
        } else if ( exp < -323 ) {
            log.issue(warning('possible floating-point underflow', node.pos, d));
        }
    } else { // it's a big decimal
        // exponent has to fit in 32 bits, so between -2147483647 and 2147483647
        if ( exp > 2147473647 ) {
            log.issue(warning('possible big decimal overflow', node.pos, d));
        } else if ( exp < -2147483647 ) {
            log.issue(warning('possible big decimal underflow', node.pos, d));
        }
    }
}

function table_even(node, state, log, env) {
    if ( ( node.elems.length % 2 ) === 1 ) {
        log.issue(error('uneven number of elements in table', node.pos, {'number': node.elems.length}));
    }
}

function indentation(node, state, log, env) {
    if ( node.elems.length === 0 ) {
        return;
    }
    // TODO fix this
    //   this check is just for expansions of reader macros that don't have positions, e.g. 'x -> (quote x)
    for (var j = 0; j < node.elems.length; j++) {
        if ( node.elems[j].pos === null ) {
            return;
        }
    }
    var first = node.elems[0],
        prev = node.elems[0],
        self;
    for (var i = 1; i < node.elems.length; i++) {
        self = node.elems[i];
        if ( prev.pos[0] === self.pos[0] ) { // same line as previous
            continue;
        } else if ( self.pos[1] === first.pos[1] ) { // same column as first
            continue;
        } else if ( self.pos[1] === (first.pos[1] + 2) ) { // 2 columns in from first
            continue;
        }
        log.issue(warning('bad indentation', node.pos, {'element': self.pos}));
        prev = self;
    }
}

function count_symbols(node, state, log, env) {
    log.symbol(node.ns, node.name);
}

function count_nodes(node, state, log, env) {
    if ( !log.hasOwnProperty('node_types') ) {
        log.node_types = {};
    }
    var type = node.type;
    if ( !log.node_types.hasOwnProperty(type) ) {
        log.node_types[type] = 0;
    }
    log.node_types[type]++;
}

function shorthand_function(node, state, log, env) {
    if ( node.type === 'function' ) {
        if ( env._functions.length !== 0 ) {
            var err = error('nested shorthand function', node.pos, {'enclosing positions': env._functions});
            log.issue(err);
        }
        return env.add_function(node.pos);
    } else if ( ( node.type === 'symbol' ) && ( node.ns === null ) && ( node.name[0] === '%' ) ) {
        if ( ( node.name === '%' ) || ( node.name === '%&' ) ) {
            return env;
        }
        var pos = [node.pos[0], node.pos[1] + 1];
        var n = tokens.parse_('number', node.name.slice(1), pos);
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
    }
    return env;
}


module.exports = {
    'metadata_value'    : metadata_value    ,
    'metadata_meta'     : metadata_meta     ,
    'ratio_denominator' : ratio_denominator ,
    'integer_base'      : integer_base      ,
    'integer_digits'    : integer_digits    ,
    'float_range'       : float_range       ,
    'table_even'        : table_even        ,
    'indentation'       : indentation       ,
    'count_symbols'     : count_symbols     ,
    'count_nodes'       : count_nodes       ,
    'shorthand_function': shorthand_function
};
