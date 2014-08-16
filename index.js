'use strict';

var M = require('./lib/main'),
    C = require('clojarse-js'),
    fs = require('fs');

var input   = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'}),
    m_cst   = C.parseCst(input),
    cst,
    ast,
    errs,
    output;

if ( m_cst.status !== 'success' ) {
    output = {'phase': 'CST parsing', 'error information': m_cst.value};
} else {
    // it's safe to unwrap cst b/c we just checked the case above
    cst = m_cst.value;
    ast = C.cstToAst(m_cst.value);
    errs = M.cstChecks(cst);
    errs = errs.concat(M.standard(ast));
    output = errs;
}
//console.log('output: ' + JSON.stringify(output));
process.stdout.write(JSON.stringify(output, null, 2) + "\n");


module.exports = {

};

