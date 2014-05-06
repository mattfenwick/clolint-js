"use strict";

var F = require('../../lib/parser/full'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("parser/full", function() {

    var inp = '\\b \\u0041 \\backspace \\o101',
        out = F.fullParse(inp);

    test("char", function() {
        deepEqual(out.body.length, 4);
    });

    test("char simple", function() {
        deepEqual(out.body[0].value._name, 'simple');
    });

    test("char unicode", function() {
        deepEqual(out.body[1].value._name, 'unicode');
    });

    test("char long", function() {
        deepEqual(out.body[2].value._name, 'long');
    });

    test("char octal", function() {
        deepEqual(out.body[3].value._name, 'octal');
    });
    
    test("char error", function() {
        var out = F.fullParse("\\bac"); // also for \obac.  but is already correct for \ubac
        deepEqual(out.body[0].status, 'error');
        deepEqual(out.body[0].value[0][0], 'char');
    });
    
    var coarse = '1 1.2 1/3 x/y :x/y ::x/y "" #"" \\z \\tab';
    
    test("coarse test", function() {
        deepEqual(F.fullParse(coarse).body.map(function(x) {return x._name;}),
                  ['integer', 'float', 'ratio', 'symbol', 'keyword',
                   'auto keyword', 'string', 'regex', 'char', 'char']);
    });
    
    var ints = '1 +1N 0 0756 -0756 0x32f 36r0az',
        errors = '08 100r0 0x0g';
    
    var floats = '8M 8.2';

});
