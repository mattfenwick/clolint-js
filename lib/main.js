'use strict';

var S = require('./singleform'),
    Sp = require('./specials'),
    F = require('./func'),
    I = require('./indentation');

function cstChecks(cst) {
    return I.run(cst);
}

function standard(node) {
    var errs = S.run(node);
    errs = errs.concat(Sp.run(node));
    errs = errs.concat(F.run(node));
    return errs;
}

module.exports = {
    'standard'  : standard,
    'cstChecks': cstChecks
};

