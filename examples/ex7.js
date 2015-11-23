"use strict";

var assert = require("assert"),
    rio = require("../lib/rio");

rio.e({
    command: "library('RJSONIO'); toJSON(seq(0, 5000000, 1))",
    callback: function (err, res) {
        var data;

        if (err) {
            console.log("Large packet failed");
        } else {
            /*eslint-disable */
            // data = JSON.parse(res); // parse fails
            data = json_parse(res);
            assert(data.length === 5000001);
            console.log("Large packet ok");
        }
    }
});



// rio info with debug enabled
//
// Connected to Rserve
// Supported capabilities --------------
//
// Sending command to Rserve
// 00000000: 0300 0000 3400 0000 0000 0000 0000 0000  ....4...........
// 00000010: 0430 0000 6c69 6272 6172 7928 2752 4a53  .0..library('RJS
// 00000020: 4f4e 494f 2729 3b20 746f 4a53 4f4e 2873  ONIO');.toJSON(s
// 00000030: 6571 2830 2c20 3530 3030 3030 302c 2031  eq(0,.5000000,.1
// 00000040: 2929 0001                                ))..
//
// Data Header
// 00000000: 0100 0100 d0fc 8403 0000 0000 0000 0000  ....P|..........
//
// Data packet
// 00000000: 0300 0000 62c0 fc84 0300 0000 5b20 2020  ....b@|.....[...
// 00000010: 2020 2030 2c20 2020 2020 2031 2c20 2020  ...0,......1,...
// ...
// 0084fcb0: 3630 3665 2b30 352c 2037 2e36 3630 3665  606e+05,.7.6606e
// 0084fcc0: 2b30 352c 2037 2e36                      +05,.7.6
//
// Type SEXP 3
// Type 3 is currently not implemented
// Rserve call failed. true
// Disconnected from Rserve
// Closed from Rserve

// Rserve info with debug instance
//
// header read result: 16
// DUMP [16]: 03 00 00 00 34 00 00 00 00 00 00 00 00 00 00 00  |....4...........
// loading buffer (awaiting 52 bytes)
// parsing parameters (buf=0000000002656160, len=52)
// DUMP [52]: 04 30 00 00 6c 69 62 72 61 72 79 28 27 52 4a 53 4f 4e 49 4f 27 29 3b 20 74 6f 4a 53 4f 4e 28 73 65 71 28 30 2c 20 35 30 30 30 30 30 30 2c 20 31 29 29 00 01  |.0..library('RJSONIO'); toJSON(seq(0, 5000000, 1))..
// PAR[0]: 00000034 (PAR_LEN=48, PAR_TYPE=4, large=no, c=0000000002656160, ptr=0000000002656164)
// CMD=00000003, pars=1
// parseString("library('RJSONIO'); toJSON(seq(0, 5000000, 1))")
// buffer parsed, stat=1, parts=2
// result type: 20, length: 2
// R_tryEval(xp,R_GlobalEnv,&Rerror);
// Calling R_tryEval for expression 1 [type=6] ...
// Expression 1, error code: 0
// Calling R_tryEval for expression 2 [type=6] ...
// Expression 2, error code: 0
// expression(s) evaluated (Rerror=0).
// String vector of length 1:
// scalar string: "[      0,      1,      2,      3,      4,      5,      6,      7,      8,      9,     10,     11,     12,
// ...
// +06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06,  5e+06 ]"
// getStorageSize(000000000515A380,type=16,len=1) getStorageSize(0000000005169D50,type=9,len=59047101) = 59047112
// = 59047120
// result storage size = 73808900 bytes
// Trying to allocate temporary send buffer of 73809920 bytes.
// stored 000000000515A380 at 000000001B78C048, 59047108 bytes
// stored SEXP; length=59047120 (incl. DT_SEXP header)
// OUT.sendRespData
// HEAD DUMP [16]: 01 00 01 00 d0 fc 84 03 00 00 00 00 00 00 00 00  |................
// BODY DUMP [59047120]: 4a c8 fc 84 03 00 00 00 62 c0 fc 84 03 00 00 00 5b 20 20 20 20 20 20 30 2c 20 20 20 20 20 20 31 2c 20 20 20 20 20 20 32 2c 20 20 20 20 20 20 33 2c 20 20 20 20 20 20 34 2c 20 20 20 20 20 20 35 2c 20 20 20 20 20 20 36 2c 20 20 20 20 20 20 37 2c 20 20 20 20 20 20 38 2c 20 20 20 20 20 20 39 2c 20 20 20 20 20 31 30 2c 20 20 20 20 20 31 31 2c 20 20 20 20 20 31 32 2c 20 20 20 20 20 31 33 2c ...  |J.......b.......[      0,      1,      2,      3,      4,      5,      6,      7,      8,      9,     10,     11,     12,     13,
// Releasing temporary sendbuf and restoring old size of 2097152 bytes.
// reply sent.
// Connection closed by peer.
// done.
//

/*
    json_parse.js
    2015-05-02

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    This file creates a json_parse function.

        json_parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = json_parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint for */

/*property
    at, b, call, charAt, f, fromCharCode, hasOwnProperty, message, n, name,
    prototype, push, r, t, text
*/

var json_parse = (function () {
    "use strict";

// This is a function that can parse a JSON text, producing a JavaScript
// data structure. It is a simple, recursive descent parser. It does not use
// eval or regular expressions, so it can be used as a model for implementing
// a JSON parser in other languages.

// We are defining the function inside of another function to avoid creating
// global variables.

    var at,     // The index of the current character
        ch,     // The current character
        escapee = {
            '"': '"',
            '\\': '\\',
            '/': '/',
            b: '\b',
            f: '\f',
            n: '\n',
            r: '\r',
            t: '\t'
        },
        text,

        error = function (m) {

// Call error when something is wrong.

            throw {
                name: 'SyntaxError',
                message: m,
                at: at,
                text: text
            };
        },

        next = function (c) {

// If a c parameter is provided, verify that it matches the current character.

            if (c && c !== ch) {
                error("Expected '" + c + "' instead of '" + ch + "'");
            }

// Get the next character. When there are no more characters,
// return the empty string.

            ch = text.charAt(at);
            at += 1;
            return ch;
        },

        number = function () {

// Parse a number value.

            var number,
                string = '';

            if (ch === '-') {
                string = '-';
                next('-');
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
            if (ch === '.') {
                string += '.';
                while (next() && ch >= '0' && ch <= '9') {
                    string += ch;
                }
            }
            if (ch === 'e' || ch === 'E') {
                string += ch;
                next();
                if (ch === '-' || ch === '+') {
                    string += ch;
                    next();
                }
                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    next();
                }
            }
            number = +string;
            if (!isFinite(number)) {
                error("Bad number");
            } else {
                return number;
            }
        },

        string = function () {

// Parse a string value.

            var hex,
                i,
                string = '',
                uffff;

// When parsing for string values, we must look for " and \ characters.

            if (ch === '"') {
                while (next()) {
                    if (ch === '"') {
                        next();
                        return string;
                    }
                    if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else {
                        string += ch;
                    }
                }
            }
            error("Bad string");
        },

        white = function () {

// Skip whitespace.

            while (ch && ch <= ' ') {
                next();
            }
        },

        word = function () {

// true, false, or null.

            switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            }
            error("Unexpected '" + ch + "'");
        },

        value,  // Place holder for the value function.

        array = function () {

// Parse an array value.

            var array = [];

            if (ch === '[') {
                next('[');
                white();
                if (ch === ']') {
                    next(']');
                    return array;   // empty array
                }
                while (ch) {
                    array.push(value());
                    white();
                    if (ch === ']') {
                        next(']');
                        return array;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad array");
        },

        object = function () {

// Parse an object value.

            var key,
                object = {};

            if (ch === '{') {
                next('{');
                white();
                if (ch === '}') {
                    next('}');
                    return object;   // empty object
                }
                while (ch) {
                    key = string();
                    white();
                    next(':');
                    if (Object.hasOwnProperty.call(object, key)) {
                        error('Duplicate key "' + key + '"');
                    }
                    object[key] = value();
                    white();
                    if (ch === '}') {
                        next('}');
                        return object;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad object");
        };

    value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

        white();
        switch (ch) {
        case '{':
            return object();
        case '[':
            return array();
        case '"':
            return string();
        case '-':
            return number();
        default:
            return ch >= '0' && ch <= '9'
                ? number()
                : word();
        }
    };

// Return the json_parse function. It will have access to all of the above
// functions and variables.

    return function (source, reviver) {
        var result;

        text = source;
        at = 0;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error("Syntax error");
        }

// If there is a reviver function, we recursively walk the new structure,
// passing each name/value pair to the reviver function for possible
// transformation, starting with a temporary root object that holds the result
// in an empty key. If there is not a reviver function, we simply return the
// result.

        return typeof reviver === 'function'
            ? (function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }({'': result}, ''))
            : result;
    };
}());
