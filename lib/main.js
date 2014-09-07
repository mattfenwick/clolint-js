'use strict';

var S  = require('./singleform'),
    Sp = require('./specials'),
    F  = require('./func'),
    I  = require('./indentation'),
    Sy = require('./symbols'),
    D  = require('./docs');


function symbols(ast) {
    return Sy.run(ast, 1);
}

var checks = {
    'indentation'   : ['cst', I.run  ],
    'singleform'    : ['ast', S.run  ],
    'specials'      : ['ast', Sp.run ],
    'functions'     : ['ast', F.run  ],
    'docs'          : ['ast', D.getToplevelDefns  ],
//    'symbols'       : ['ast', symbols], // disactivated because it's annoying
};

function driver(cst, ast, checkNames) {
    var out = {};
    checkNames.map(function(c) {
        if ( !(checks.hasOwnProperty(c)) ) {
            throw new Error('illegal check name -- ' + c);
        }
        var tree = checks[c][0] === 'ast' ? ast : cst;
        out[c] = checks[c][1](tree);
    });
    return out;
}

module.exports = {
    'checks': checks,
    'driver': driver,
};

