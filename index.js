'use strict';

var M = require('./lib/main'),
    C = require('clojarse-js'),
    fs = require('fs');

var input   = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'}),
    ast     = C.parseAst(input);

var output = ast.fmap(M.standard).mapError(function(e) {
    return {'phase': 'parsing', 'error information': e};
});

//console.log('output: ' + JSON.stringify(output));
process.stdout.write(JSON.stringify(output, null, 2) + "\n");


module.exports = {

};

