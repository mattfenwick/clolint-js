'use strict';

var S = require('./singleform'),
    Sp = require('./specials'),
    F = require('./func'),
    I = require('./indentation'),
    Sy = require('./symbols');

function cstChecks(cst) {
    return I.run(cst);
}

function standard(node) {
    var errs = S.run(node);
    errs = errs.concat(Sp.run(node));
    errs = errs.concat(F.run(node));
    errs = errs.concat(Sy.run(node, 1));
    return errs;
}

module.exports = {
    'standard'  : standard,
    'cstChecks': cstChecks
};

