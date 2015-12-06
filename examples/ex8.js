"use strict";

var assert = require("assert"),
    // internal lib code reproducing php crypt api
    crypt = require("../lib/crypt");

var text,
    hash;

text = "whatever";
hash = crypt(text, "secret");
console.log(text, hash);
assert.equal(hash, "setiWoCgqSGEw");

text = "test";
hash = crypt(text, "SO");
console.log(text, hash);
assert.equal(hash, "SOVYikZv1wMH.");

// http://sandbox.onlinephpfunctions.com/code/811a2bf6260fe1a30ecfaa0810a9c9ffef838094
