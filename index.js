'use strict';

var fullparser = require('./lib/parser/full'),
    A = require('./lib/ast'),
    M = require('./lib/misc'),
    builder = require('./lib/astbuilder'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var parsed = fullparser.fullParse(input);
var ast = parsed.fmap(builder.build);

ast.fmap(function(a) {
    var state = {},
        log = [];
    M.traverse(a, state, log);
    console.log('state -- ' + JSON.stringify(state));
    log.map(function(l) {
        console.log(JSON.stringify(l));
    });
    console.log();
});

// var output = JSON.stringify(parsed, null, 2) + JSON.stringify(ast, null, 2) + ast.fmap(A.dump).value;
// var output = JSON.stringify(ast, null, 2) + '\n' + ast.fmap(A.dump).value;
var output = ast.fmap(A.dump).mapError(JSON.stringify).value;
// var output = ast.mapError(JSON.stringify).value;

/*
fs.writeFile('output', 
    JSON.stringify(parser.parse(input), null, 2),
    {'encoding': 'utf8'});
*/
process.stdout.write((typeof output === 'string' ? 
                      output :
                      JSON.stringify(output))   + "\n");


module.exports = {

};

