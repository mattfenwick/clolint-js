'use strict';

var S = require('data-js').Set;

var defs = new S([
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

var simpleEscapes = {
    'b': '\b',
    't': '\t',
    'n': '\n',
    'f': '\f',
    'r': '\r',
    '"': '"',
    '\\': '\\'
};

function docString(node) {
    if ( node && ( node.type === 'string' ) ) {
        return node.value.map(function(c) {
            if ( typeof c === 'string' ) {
                return c;
            } else if ( c.kind === 'simple' ) {
                return simpleEscapes[c.value];
            }
            return '?';
        }).join('');
    }
    return '';
}

function isLongEnough(node) {
    return node.elems.length >= 4;
}

function extractFuncInfo(node) {
    return {
        'type'      : node.elems[0].name,
        'name'      : node.elems[1].name,
        'position'  : node.pos,
        'doc'       : docString(node.elems[2])
    };
}

function getToplevelDefns(ast) {
    var funcs = [];
    ast.elems.forEach(function(e) {
//        var yep = [isDef, is2ndSymbol, isLongEnough].map(function(f) {return f(e);});
//        console.log(JSON.stringify(e.elems.slice(0, 4).concat(yep)));
        if ( isDef(e) && is2ndSymbol(e) && isLongEnough(e) ) {
            funcs.push(extractFuncInfo(e));
        }
    });
    return funcs;
}


module.exports = {
    'extractFuncInfo' : extractFuncInfo ,
    'getToplevelDefns': getToplevelDefns,
};

