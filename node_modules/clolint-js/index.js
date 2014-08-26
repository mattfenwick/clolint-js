'use strict';

var M = require('./lib/main'),
    C = require('clojarse-js');


function getCheckNames(args) {
    if ( args[0] === 'all' ) {
        return Object.keys(M.checks);
    }
    return args;
}

function run(text, args) {
    return C.parseCst(text).fmap(function(cst) {
        var ast = C.cstToAst(cst);
        return M.driver(cst, ast, getCheckNames(args));
    });
}


module.exports = {
    'getCheckNames': getCheckNames,
    'run'          : run          ,
    // TODO could import all modules here, too, although that's not too important
};

