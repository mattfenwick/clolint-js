'use strict';

var M = require('./lib/main'),
    C = require('clojarse-js'),
    fs = require('fs');

var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'}),
    ast = C.parseAst(input);

//console.log(JSON.stringify(ast));
//var output = M.traverse(M.node_check)(ast.value);
var output = M.standard(ast.value);

console.log('output: ' + JSON.stringify(output));
process.stdout.write((typeof output === 'string' ? 
                      output :
                      JSON.stringify(output, null, 2))   + "\n");


module.exports = {

};

