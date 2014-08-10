'use strict';


function warning(name, message, position, obj) {
    obj.severity = 'warning';
    obj.name = name;
    obj.message = message;
    obj.position = position;
    return obj;
}

// log an error -- not an error effect
function error(name, message, position, obj) {
    obj.severity = 'error';
    obj.name = name;
    obj.message = message;
    obj.position = position;
    return obj;
}


// 1,1          0,1,2   no,yes,no
// null,1       0,1,2   yes,yes,no
// 1,null       0,1,2   no,yes,yes
// null,null    0,1,2   yes,yes,yes    
function arg_check(name, min, max, f, message, node, log) {
    var args = node.elems.length,
        low = (min === null) ? 0 : min,
        high = (max === null) ? Infinity : max;
    if ( ( args >= low ) && ( args <= high ) ) {
        log.push(f(name, message, node.pos, {'arguments': args}));
    }
}

// in node.elems, the first element is the special form symbol
//   the 'operands' are in node.elems.slice(1)
function _traverse_recur(node, start, log) {
    node.elems.slice(start).map(function(n) {
        traverse(n, log);
    });
}

function def(node, log) {
    arg_check('def', null, 1, error, 'too few arguments', node, log);
    arg_check('def', 2, 2, warning, 'missing initial value', node, log);
    arg_check('def', 5, null, error, 'too many arguments', node, log);
    var elems = node.elems;
    if ( elems.length >= 2 ) {
        var second = elems[1];
        if ( second.type !== 'symbol' ) {
            log.push(error('def', '2nd arg must be a symbol', second.pos, {}));
        }
    }
    if ( elems.length >= 4 ) {
        var third = elems[2];
        if ( third.type !== 'string' ) {
            log.push(error('def', 'in 4-arg version, doc-string must be a string', third.pos, {}));
        }
    }
    _traverse_recur(node, 2, log);
}

function if_(node, log) {
    arg_check('if', null, 2, error, 'too few arguments', node, log);
    arg_check('if', 3, 3, warning, 'missing else-branch', node, log);
    arg_check('if', 5, null, error, 'too many arguments', node, log);
    _traverse_recur(node, 1, log);
}

function quote(node, log) {
    arg_check('quote', null, 1, warning, 'missing operand', node, log);
    arg_check('quote', 3, null, warning, 'too many arguments', node, log);
    // don't recur -- because it's quote!
}

function var_(node, log) {
    arg_check('var', null, 1, error, 'too few arguments', node, log);
    arg_check('var', 3, null, error, 'too many arguments', node, log);
    if ( ( node.elems.length >= 2 ) && ( node.elems[1].type !== 'symbol' ) ) {
        log.push(error('var', '2nd argument must be a symbol', node.pos, {}));
    }
    // no need to recur
}

function throw_(node, log) {
    arg_check('throw', null, 1, error, 'too few arguments', node, log);
    arg_check('throw', 3, null, error, 'too many arguments', node, log);
    // TODO is this recursion right?
    _traverse_recur(node, 1, log);
}

function new_(node, log) {
    arg_check('new', null, 1, error, 'too few arguments', node, log);
    // TODO is this recursion right?
    _traverse_recur(node, 1, log);
}

function monitor_enter(node, log) {
    log.push(warning('monitor-enter', 'should be avoided in user code. Use the locking macro', node.pos, {}));
    arg_check('monitor-enter', null, 1, error, 'too few arguments', node, log);
    arg_check('monitor-enter', 3, null, error, 'too many arguments', node, log);
    _traverse_recur(node, 1, log);
}

function monitor_exit(node, log) {
    log.push(warning('monitor-exit', 'should be avoided in user code. Use the locking macro', node.pos, {}));
    arg_check('monitor-exit', null, 1, error, 'too few arguments', node, log);
    arg_check('monitor-exit', 3, null, error, 'too many arguments', node, log);
    _traverse_recur(node, 1, log);
}

function do_(node, log) {
    arg_check('do', null, 1, warning, 'too few arguments', node, log);
    _traverse_recur(node, 1, log);
}

function dot(node, log) {
    arg_check('.', null, 2, error, 'too few arguments', node, log);
    // need to check whether 2nd arg is symbol or list
    // TODO any recursion?
}

function set_bang(node, log) {
    arg_check('set!', null, 2, error, 'too few arguments', node, log);
    arg_check('set!', 4, null, error, 'too many arguments', node, log);
    // need to check whether 1st arg is a valid target or Java target
    _traverse_recur(node, 2, log);
}

function recur(node, log) {
    // nothing to do
    // but would be nice to warn if not in a loop or fn
    // also, check if in tail position
    _traverse_recur(node, 1, log);
}

function _list_starts_with(node, name) {
    return (node.type === 'list') && 
           (node.elems.length > 0) &&
           (node.elems[0].type === 'symbol') &&
           (node.elems[0].ns === null) &&
           (node.elems[0].name === name);
}

function _catch(node, log) {
    arg_check('catch', null, 2, error, 'too few arguments', node, log);
    arg_check('catch', 3, 3, warning, 'missing expression(s)', node, log);
    var exc_type = node.elems[1],
        name = node.elems[2];
    if ( exc_type && ( exc_type.type !== 'symbol' ) ) {
        log.push(error('catch', 'exception type must be a symbol', exc_type.pos, {}));
    }
    if ( name && ( name.type !== 'symbol' ) ) {
        log.push(error('catch', 'exception name must be a symbol', name.pos, {}));
    }
    _traverse_recur(node, 3, log);
}

function _finally(node, log) {
    arg_check('finally', null, 1, warning, 'missing expression(s)', node, log);
    _traverse_recur(node, 1, log);
}

function try_(node, log) {
    var exprs = [],
        catches = [],
        final = null,
        i = 1,
        e;
    for ( ; i < node.elems.length; i++) {
        e = node.elems[i];
        if ( _list_starts_with(e, 'catch') || _list_starts_with(e, 'finally') ) {
            break;
        }
        exprs.push(e);
    }
    exprs.map(function(n) {
        traverse(n, log);
    });
        
    for ( ; i < node.elems.length; i++) {
        e = node.elems[i];
        if ( _list_starts_with(e, 'catch') ) {
            catches.push(e);
            _catch(e, log);
        } else if ( _list_starts_with(e, 'finally') ) {
            break;
        } else {
            log.push(error('try', 'invalid expression in catch/finally', e.pos, {}));
        }
    }
    if ( i < node.elems.length ) {
        e = node.elems[i];
        if ( _list_starts_with(e, 'finally') ) {
            final = e;
            _finally(e, log);
        }
        i++;
    }
    for ( ; i < node.elems.length; i++) {
        e = node.elems[i];
        log.push(error('try', 'invalid expression after finally', e.pos, {}));
    }
    if ( exprs.length === 0 ) {
        log.push(warning('try', '0 expressions', node.pos, {}));
    }
    if ( ( catches.length === 0 ) && ( final === null ) ) {
        log.push(warning('try', 'no catch or finally', node.pos, {}));
    }
}


var specials = {
    'def'   : def     ,
    'if'    : if_     ,
    'quote' : quote   ,
    'var'   : var_    ,
    'throw' : throw_  ,
    'new'   : new_    ,
    'do'    : do_     ,
    '.'     : dot     ,
    'set!'  : set_bang,
    'recur' : recur   ,
    'try'   : try_    ,
    'monitor-enter': monitor_enter,
    'monitor-exit' : monitor_exit
};


function operator(node, log) {
    if ( node.elems.length === 0 ) { 
        return;
    }
    var first = node.elems[0];
    if ( ( first.type !== 'symbol'              ) ||
         ( first.ns !== null                    ) ||
         ( !specials.hasOwnProperty(first.name) ) ) {
        _traverse_recur(node, 0, log);
        return;
    }
    return specials[first.name](node, log);
}

function traverse(node, log) {
    node.meta.map(function (n) {traverse(n, log);});
    // don't recurse into syntax-quote
    if ( node.type === 'syntax-quote' ) {
        return;
    }
    if ( node.type === 'list' ) {
        operator(node, log);
        return;
    }
    switch (node._tag) {
        case 'token':
            break;
        case 'struct':
            _traverse_recur(node, 0, log);
            break;
        default:
            throw new Error('unexpected AST node tag -- ' + JSON.stringify(node));
    }
}

function run(node) {
    var log = [];
    traverse(node, log);
    return log;
}


module.exports = {
    'specials'  : specials  ,
    'run'       : run       ,
};

