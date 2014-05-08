'use strict';

var fullparser = require('./lib/parser/full'),
    specials = require('./lib/specials'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var parsed = fullparser.fullParse(input);

specials.check_specials(parsed); // TODO only if it's successful

var output = JSON.stringify(parsed, null, 2);

/*
fs.writeFile('output', 
    JSON.stringify(parser.parse(input), null, 2),
    {'encoding': 'utf8'});
*/
// process.stdout.write(output + "\n");


module.exports = {

};

