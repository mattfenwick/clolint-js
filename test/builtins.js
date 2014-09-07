"use strict";

var B = require('../lib/builtins'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("builtins", function() {

    var counts = [
            ['specials' , 22 ],
            ['keywords' , 3  ],
            ['other'    , 12 ],
            ['macros'   , 68 ],
            ['functions', 441]
        ];
    counts.forEach(function(c) {
        test("number of " + c[0] + ' -- ' + c[1], function() {
            deepEqual(c[1], B[c[0]].keys().length);
        });
    });

});

