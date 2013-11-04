"use strict";

var rio = require("../lib/rio"),
    vows = require("vows"),
    assert = require("assert");

var isEnablePlaybackMode = process.env.CI === "true";

vows.describe("Basic tests").addBatch({
    "double number test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/double-test.bin"
            });

            rio.evaluate("pi / 2 * 2", {
                callback: this.callback
            });
        },

        "get the double number": function (err, topic) {
            if (!err) {
                assert.equal(3.141592653589793, topic);
            }
        }
    },

    "double number array test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/double-array-test.bin"
            });

            rio.evaluate("c(1, 2)", {
                callback: this.callback
            });
        },

        "get the double number array": function (err, topic) {
            if (!err) {
                assert.deepEqual([1, 2], topic);
            }
        }
    },

    "string test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/string-test.bin"
            });

            rio.evaluate("as.character('Hello World')", {
                callback: this.callback
            });
        },

        "get the string": function (err, topic) {
            if (!err) {
                assert.equal("Hello World", topic);
            }
        }
    },

    "string array test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/string-array-test.bin"
            });

            rio.evaluate("c('a', 'b')", {
                callback: this.callback
            });
        },

        "get the string array": function (err, topic) {
            if (!err) {
                assert.deepEqual(["a", "b"], topic);
            }
        }
    },

    "utf8 string test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/string-test.bin"
            });

            rio.evaluate("# แผ่นดินฮั่นเสื่อมโทรมแสน\n" +
                "as.character('Hello World')", {
                callback: this.callback
            });
        },

        "get the utf8 string": function (err, topic) {
            if (!err) {
                assert.equal("Hello World", topic);
            }
        }
    },

    "cound not find a function test": {
        topic: function () {
            var args = {
                prods: ["IBM", "YHOO", "MSFT"]
            }, self = this;
            rio.sourceAndEval(__dirname + "/test.R", {
                entryPoint: "getOptimalPortfolio",
                data: args,
                callback: function (err, res) {
                    console.log(err, res);
                    self.callback(err);
                }
            });
        },

        "get closed but no response value returned": function (err) {
            assert.ok(err);
        }
    }

}).export(module);
