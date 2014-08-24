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

    var indent_text = fs.readFileSync('clj/indent.clj', {'encoding': 'utf8'}),
        indent_ast = C.parseCst(indent_text);
    var indent_messages = [
        'top-level forms must start at the first column',
        'bad indentation -- close brace of empty structure should be on same line as opening brace',
        'top-level forms must start at the first column',
        'top-level forms must start at the first column',
        'bad indentation -- first form should be on same line as opening brace',
        'bad indentation -- closing punctuation should appear on same line as last form',
        'bad indentation -- close brace of empty structure should be on same line as opening brace'
        ];
    if ( indent_ast.status === 'success' ) {
        var indent_checks = M.cstChecks(indent_ast.value);
        indent_checks.map(function(c, ix) {
            var m = indent_messages[ix];
            test(ix + ': "' + c.message + '" -- "' + indent_messages[ix] + '"', function() {
                deepEqual(c.message, indent_messages[ix]);
                // TODO check the position as well
            });
        });
    } else {
        deepEqual(true, false, 'indentation parsing failed');
    }

});

