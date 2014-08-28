"use strict";

var M = require('../lib/main'),
    C = require('clojarse-js'),
    fs = require('fs'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("main", function() {

    (function singleform() {
        var text = fs.readFileSync('clj/examples.clj', {'encoding': 'utf8'}),
            m_ast = C.parseAst(text),
            messages = [
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
        m_ast.fmap(function(ast) {
            var checks = M.checks['singleform'][1](ast);
//            console.log('checks -- ' + JSON.stringify(checks));
            checks.map(function(c, ix) {
                var m = messages[ix];
                test(ix + ': "' + c.message + '" -- "' + messages[ix] + '"', function() {
                    deepEqual(c.message, messages[ix]);
                    // TODO check the position as well
                });
            });
        }).mapError(function(e) {
            test("parsing failed", function() {
                deepEqual(true, false, 'parsing failed -- ' + JSON.stringify(e));
            });
        });
    })();

    (function indentation() {
        var text = fs.readFileSync('clj/indent.clj', {'encoding': 'utf8'}),
            m_cst = C.parseCst(text);
        var messages = [
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
        m_cst.fmap(function(cst) {
            var checks = M.checks['indentation'][1](cst);
    //        console.log(JSON.stringify(checks));
            messages.map(function(m, ix) {
                try {
                    var c = checks[ix];
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
            for (var ix = messages.length; ix < checks.length; ix++) {
                test(checks[ix].message, function() {
                    deepEqual(true, false);
                });
            }
        }).mapError(function(e) {
            test('parsing failed', function() {
                deepEqual(true, false, 'indentation parsing failed -- ' + JSON.stringify(e));
            });
        });
    })();
});

