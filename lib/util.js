'use strict';


function warning(message, position, obj) {
    obj.severity = 'warning';
    obj.message = message;
    obj.position = position;
    return obj;
}

// log an error -- not an error effect
function error(message, position, obj) {
    var out = warning(message, position, obj);
    out.severity = 'error';
    return out;
}


module.exports = {
    'warning': warning,
    'error': error
};

