/*jshint quotmark: false */

"use strict";

var rio = require("../lib/rio"),
    vows = require("vows"),
    assert = require("assert");

var isEnablePlaybackMode = process.env.CI === "true";

vows.describe("Eval errors tests").addBatch({
    "require test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/require-test.bin"
            });

            rio.evaluate("require(xxx)", {
                callback: this.callback
            });
        },

        "missing package": function (err, topic) {
            // library fires a warning and returns false
            // if the package is missing
            //assert.equal("Eval failed with error code 127", err);
            assert.isNotNull(err);
            assert.equal(false, topic);
        }
    },

    "library test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/library-test.bin"
            });

            rio.evaluate("library(xxx)", {
                callback: this.callback
            });
        },

        "missing package": function (err) {

            assert.equal("Eval failed with error code 127", err.message);
        }
    },

    "unknown test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/unknown-test.bin"
            });

            rio.evaluate("x", {
                callback: this.callback
            });
        },

        "getting unknown": function (err) {
            assert.equal("Eval failed with error code 127", err.message);
        }
    },

    "syntax test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/syntax-test.bin"
            });

            rio.evaluate("1 // 3", {
                callback: this.callback
            });
        },

        "getting syntax error": function (err) {
            assert.equal("Eval failed with error code 3", err.message);
        }
    }

}).export(module);
