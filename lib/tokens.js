'use strict';


var u = require('./util'),
    error = e.error,
    warning = e.warning;


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

/*function char_octal(node) {

}*/

/*function char_unicode(node) {

}*/

function string_unicode(node) {

}




module.exports = {
    'ratio_denominator' : ratio_denominator ,
    'integer_base'      : integer_base      ,
    'integer_digits'    : integer_digits    ,
    'float_range'       : float_range       ,
    'char_long'         : char_long         ,
};

