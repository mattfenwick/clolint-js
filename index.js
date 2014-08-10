'use strict';

var M = require('./lib/main'),
    C = require('clojarse-js'),
    fs = require('fs');

var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'}),
    ast = C.parseAst(input),
    output = M.standard(ast.value);

console.log('output: ' + JSON.stringify(output));
process.stdout.write((typeof output === 'string' ? 
                      output :
                      JSON.stringify(output, null, 2))   + "\n");


module.exports = {

};

