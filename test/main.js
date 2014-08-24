"use strict";

var M = require('../lib/main'),
    C = require('clojarse-js'),
    fs = require('fs'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("main", function() {

    var text = fs.readFileSync('clj/examples.clj', {'encoding': 'utf8'}),
        ast = C.parseAst(text);
    var messages = [
            'radix too large',
            'out of range digit',
            'possible float overflow',
            'possible float underflow',
            'possible big decimal overflow',
            'divide by 0',
            'invalid long char',
            'invalid unicode character: surrogate code unit',
            'invalid unicode character: surrogate code unit',
            'invalid octal character: out of range',
            'uneven number of elements in table',
            'eval reader requires symbol or list',
            'list in eval reader must have at least one form',
            'form does not support metadata',
            'invalid metadata type',
        ];
    if ( ast.status === 'success' ) {
        var checks = M.standard(ast.value);
        checks.map(function(c, ix) {
            var m = messages[ix];
            test(ix + ': "' + c.message + '" -- "' + messages[ix] + '"', function() {
                deepEqual(c.message, messages[ix]);
                // TODO check the position as well
            });
        });
    } else {
        deepEqual(true, false, 'parsing failed');
    }

});

