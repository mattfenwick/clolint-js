'use strict';

var S = require('./singleform'),
    Sp = require('./specials');

function standard(node) {
    var errs = S.run(node);
    errs = errs.concat(Sp.run(node));
    return errs;
}

module.exports = {
    'standard'  : standard
};

