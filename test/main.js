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
        [[18,7], 'top-level forms must start at the first column'                           ],
        [[20,1], 'bad indentation -- first form should immediately follow opening brace'    ],
        [[22,2], 'top-level forms must start at the first column'                           ],
        [[24,8], 'top-level forms must start at the first column'                           ],
        [[26,1], 'bad indentation -- first form should immediately follow opening brace'    ],
        [[29,1], 'bad indentation -- closing brace should immediately follow last form'     ],
        [[32,1], 'bad indentation -- closing brace of empty structure should immediately follow opening brace'],
        [[35,1], 'bad indentation -- closing brace should immediately follow last form'     ],
        [[37,1], 'bad indentation -- closing brace should immediately follow last form'     ],
        [[,], 'bad indentation'],
        ];
    if ( indent_ast.status === 'success' ) {
        var indent_checks = M.cstChecks(indent_ast.value);
//        console.log(JSON.stringify(indent_checks));
        indent_messages.map(function(m, ix) {
            try {
                var c = indent_checks[ix];
                test(ix + ': "' + c.message + '" -- "' + m[1] + '"', function() {
                    deepEqual(c.message, m[1]);
                    // TODO check the position as well
                });
            } catch (e) {
                test(JSON.stringify(m), function() {
                    deepEqual(false, true, e.message);
                });
            }
        });
        for (var ix = indent_messages.length; ix < indent_checks.length; ix++) {
            test(indent_checks[ix].message, function() {
                deepEqual(true, false);
            });
        }
    } else {
        deepEqual(true, false, 'indentation parsing failed');
    }

});

