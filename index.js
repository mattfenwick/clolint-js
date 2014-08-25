'use strict';

var M = require('./lib/main'),
    C = require('clojarse-js'),
    fs = require('fs');

var input   = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'}),
    m_cst   = C.parseCst(input),
    cst,
    ast,
    output;

function getCheckNames(args) {
    if ( args[0] === 'all' ) {
        return Object.keys(M.checks);
    }
    return args;
}

if ( m_cst.status !== 'success' ) {
    output = {'phase': 'CST parsing', 'error information': m_cst.value};
} else {
    // it's safe to unwrap cst b/c we just checked the case above
    cst = m_cst.value;
    ast = C.cstToAst(cst);
    output = M.driver(cst, ast, getCheckNames(process.argv.slice(2)));
}

process.stdout.write(JSON.stringify(output, null, 2) + "\n");


module.exports = {

};

