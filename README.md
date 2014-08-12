[clolint-js](https://www.npmjs.org/package/clolint-js)
=================

# Quick start #

    $ git clone git@github.com:mattfenwick/clolint-js
    $ cd clolint-js
    $ cat clj/examples.clj | node index.js > output.json


# Overview #

A tool for sanity checking Clojure code, by parsing it and performing various
static analyses.  I wrote it to help me learn Clojure -- it finds my stupid 
mistakes!


# Examples #

Parse errors such as mismatched or unmatched braces generate traces of 
line/column information, indicating what the parser was working on when it
failed:

    $ echo '(a b c' | node index.js

        {
          "status": "error",
          "value": {
            "phase": "parsing",
            "error information": [
              ["clojure", [1, 1]],
              ["list", [1, 1]],
              ["close", [2, 1]]
            ]
          }
        }


Domain checks of forms -- i.e. do the values satisfy Clojure constraints:

    $ echo '{:a} \newlin ^ 3 []' | node index.js

        {
          "status": "success",
          "value": [
            {
              "number": 1,
              "severity": "error",
              "message": "uneven number of elements in table",
              "position": [1, 1]
            },
            {
              "value": "newlin",
              "severity": "error",
              "message": "invalid long char",
              "position": [1, 6]
            },
            {
              "type": "integer",
              "severity": "error",
              "message": "invalid metadata type",
              "position": [1, 16]
            }
          ]
        }


Special form syntax:

    $ echo '(def x :docs 4)' | node index.js

        {
          "status": "success",
          "value": [
            {
              "severity": "error",
              "name": "def",
              "message": "in 4-arg version, doc-string must be a string",
              "position": [1, 8]
            }
          ]
        }

    
Anonymous functions and arguments:

    $ echo '%x #(%a)' | node index.js
    
        {
          "status": "success",
          "value": [
            {
              "symbol": "%x",
              "severity": "warning",
              "message": "%-args should not be used outside of #-shorthand functions",
              "position": [1, 1]
            },
            {
              "error": [["token", [1, 7]]],
              "text": "%a",
              "severity": "error",
              "message": "invalid %-arg",
              "position": [1, 6]
            }
          ]
        }


    $ echo '#(a #(b %1) %)' | node index.js

        {
          "status": "success",
          "value": [
            {
              "positions": [[1, 1]],
              "severity": "error",
              "message": "nested shorthand function",
              "position": [1, 5]
            }
          ]
        }


(TODO) Macro and function syntax

    $ echo '(fn)' | node index.js
    
    ... TODO ...

(TODO) Indentation

(TODO) Symbol definitions: unused, undefined, redefined, shadowed


# Other resources #

 - [the CCW ANTLR grammar](https://github.com/laurentpetit/ccw) 
 - [the Clojure implementation](https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/LispReader.java)
 - [the parsing library](https://github.com/mattfenwick/clojarse-js)


# License #

MIT.  Please don't use it for evil.


# Contributing #

Features, patches, ideas, corrections are all welcome!

