'use strict';

var S = require('./singleform'),
    Sp = require('./specials'),
    F = require('./func');

function standard(node) {
    var errs = S.run(node);
    errs = errs.concat(Sp.run(node));
    errs = errs.concat(F.run(node));
    return errs;
}

module.exports = {
    'standard'  : standard
};

