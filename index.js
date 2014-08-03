'use strict';
/*
var C = require('clojarse-js'),
    dump = C.ast.dump,
    T = require('./lib/checker'),
    fs = require('fs');

var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'}),
    ast = C.parseAst(input),
    output;

function formatError(e) {
    return '    line ' + e[0] + ', column ' + e[1];
}

if ( ast.status === 'success' ) {
    var out = T.default_traverse(ast.value),
        state = out[0],
        log = out[1]; 
    console.log('state -- ' + JSON.stringify(state, null, 2));
    log._issues.map(function(e) { console.log(JSON.stringify(e)); });
    console.log('node types -- ' + JSON.stringify(log.node_types, null, 2));
    console.log('symbol use -- ' + JSON.stringify(log._symbol_use, null, 2) + "\n");
    output = dump(ast.value);
} else {
    try {
        output = ['error: '].concat(ast.value.map(formatError)).join('\n');
    } catch (e) { // one way to trigger this branch: input is "\oopsie"
        console.log(JSON.stringify(ast.value));
        throw e;
    }
}
*/
/*
fs.writeFile('output', 
    JSON.stringify(parser.parse(input), null, 2),
    {'encoding': 'utf8'});
*/

var M = require('./lib/main'),
    C = require('clojarse-js'),
    fs = require('fs');

var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'}),
    ast = C.parseAst(input);

//console.log(JSON.stringify(ast));
var output = M.traverse(ast.value);

console.log('output: ' + JSON.stringify(output));
process.stdout.write((typeof output === 'string' ? 
                      output :
                      JSON.stringify(output, null, 2))   + "\n");


module.exports = {

};

