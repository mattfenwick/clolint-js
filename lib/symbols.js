'use strict';

var data = require('data-js'),
    Dict = data.Dict,
    S = data.Set,
    u = require('./util'),
    B = require('./builtins'),
    warning = u.warning;


function _collect_builtins() {
    var groups = [B.functions, B.macros, B.other, B.keywords, B.specials];
    return Array.prototype.concat.apply([], groups.map(function(g) {return g.keys();}));
}

var builtins = new S(_collect_builtins()),

    defs = new S([
        'def'         ,
        'definline'   ,
        'definterface',
        'defmacro'    ,
        'defmethod'   ,
        'defmulti'    ,
        'defn'        ,
        'defn-'       ,
        'defonce'     ,
        'defprotocol' ,
        'defrecord'   ,
        'defstruct'   ,
        'deftype*'    ,
        'deftype'     ,
    ]);

function isDef(node) {
    if ( ( node.type !== 'list' ) ||
         ( node.elems.length === 0 ) ) {
        return false;
    }
    var first = node.elems[0];
    return ( first.type === 'symbol' ) &&
           ( first.ns   === null     ) &&
           ( defs.has(first.name)    );
}

function is2ndSymbol(node) {
    return ( node.elems.length >= 2 ) && ( node.elems[0].type === 'symbol' );
}

function isQuote(node) {
    if ( ( node.type !== 'list'    ) ||
         ( node.elems.length === 0 ) ) {
        return false;
    }
    var fst = node.elems[0];
    return ( fst.type === 'symbol' ) &&
           ( fst.ns === null       ) &&
           ( fst.name === 'quote'  );
}

function isSyntaxQuote(node) {
    return node.type === 'syntax-quote';
}


//   1. redefs of built-in symbols
//   2. multiple defs of same symbol
//   3. lexically bound symbols by fn/fn*, let/let*, loop/loop*, ?catch?,
//      letfn/letfn*, for, ns/use/require, ????  
//   4. defs need to be toplevel
//   5. symbols being defined shouldn't use namespaces

//   4. defs at toplevel
//   5. no namespaces
function form(node, table, isToplevel) {
    var errs = [];
    if ( isDef(node) && is2ndSymbol(node) ) {
        var sym = node.elems[1],
            name = sym.name;
        if ( sym.ns !== null ) {
            errs.push(warning('definitions should not use a namespace', sym.pos, {'namespace': sym.ns}));
        }
        if ( !table.has(name) ) {
            table.set(name, []);
        }
        table.get(name).push(node);
        if ( !isToplevel ) {
            errs.push(warning('definitions should be at the top level', node.pos, {}));
        }
    }
    if ( isQuote(node) || isSyntaxQuote(node) ) {
        // don't recur into these
    } else if ( node._tag === 'struct' ) {
        node.elems.forEach(function(e) {
            form(e, table, false);
        });
    }
    return errs;
}

function collectDefs(node) {
    var table = new Dict({}),
        errs = form(node, table, true);
    return {'defs': table, 'errs': errs};
}

function f_pos(d) {
    return d.pos;
}

// 1. redefs on builtins
// 2. multiple defs
function checkDefs(table) {
    var errs = [];
    table.items().forEach(function(pair) {
        var name = pair[0],
            defs = pair[1];
        if ( defs.length > 1 ) {
            errs.push(warning('multiple definitions of symbol',
                              defs[0].pos,
                              {'positions': defs.slice(1).map(f_pos),
                               'name': name}));
        }
        if ( builtins.has(name) ) {
            errs.push(warning('redefinition of built-in symbol',
                              defs[0].pos,
                              {'name': name}));
            // TODO should this generate a warning for *each* of the
            //   redefinitions ... or is that just yak-shaving?
        }
    });
    return errs;
}

function resolveSymbols(node) {
    var out = collectDefs(node),
        errs = out.errs,
        table = out.defs;
    errs = errs.concat(checkDefs(table));
    return errs;
}
        
// let, fn, loop -- lexical stuff
//   1. undefineds
//   2. shadowing
//   3. defined, not used
//   4. multiple defs in same scope

module.exports = {
    'checkDefs'      : checkDefs      ,
    'resolveSymbols' : resolveSymbols ,
};

