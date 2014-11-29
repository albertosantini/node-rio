"use strict";

var rio = require("../lib/rio"),
    vows = require("vows"),
    assert = require("assert");

var isEnablePlaybackMode = process.env.CI === "true";

vows.describe("Basic tests").addBatch({
    "integer test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/integer-test.bin"
            });

            rio.e({
                command: "as.integer(3)",
                callback: this.callback
            });
        },
        "get the integer": function (err, topic) {
            if (err) {
                throw err;
            }
            assert.equal(3, topic);
        }
    },

    "integer array test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/integer-array-test.bin"
            });

            rio.e({
                command: "c(as.integer(1), as.integer(2))",
                callback: this.callback
            });
        },
        "get the integer array": function (err, topic) {
            if (err) {
                throw err;
            }
            assert.deepEqual([1, 2], topic);
        }
    },
    "double number test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/double-test.bin"
            });

            rio.e({
                command: "pi / 2 * 2",
                callback: this.callback
            });
        },

        "get the double number": function (err, topic) {
            if (err) {
                throw err;
            }
            assert.equal(3.141592653589793, topic);
        }
    },

    "double number array test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/double-array-test.bin"
            });

            rio.e({
                command: "c(1, 2)",
                callback: this.callback
            });
        },

        "get the double number array": function (err, topic) {
            if (err) {
                throw err;
            }
            assert.deepEqual([1, 2], topic);
        }
    },

    "string test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/string-test.bin"
            });

            rio.e({
                command: "as.character('Hello World')",
                callback: this.callback
            });
        },

        "get the string": function (err, topic) {
            if (err) {
                throw err;
            }
            assert.equal("Hello World", topic);
        }
    },

    "string array test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/string-array-test.bin"
            });

            rio.e({
                command: "c('a', 'b')",
                callback: this.callback
            });
        },

        "get the string array": function (err, topic) {
            if (err) {
                throw err;
            }
            assert.deepEqual(["a", "b"], topic);
        }
    },

    "boolean test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/boolean-test.bin"
            });

            rio.e({
                command: "TRUE",
                callback: this.callback
            });
        },

        "get the boolean value": function (err, topic) {
            if (err) {
                throw err;
            }
            assert.equal(true, topic);
        }
    },

    "boolean array test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/boolean-array-test.bin"
            });

            rio.e({
                command: "c(TRUE, FALSE)",
                callback: this.callback
            });
        },

        "get the boolean array": function (err, topic) {
            if (err) {
                throw err;
            }
            assert.deepEqual([true, false], topic);
        }
    },

    "utf8 string test": {
        topic: function () {
            rio.enablePlaybackMode(isEnablePlaybackMode, {
                fileName: "test/dump/string-test.bin"
            });

            rio.e({
                command: "# แผ่นดินฮั่นเสื่อมโทรมแสน\n" +
                    "as.character('Hello World')",
                callback: this.callback
            });
        },

        "get the utf8 string": function (err, topic) {
            if (err) {
                throw err;
            }
            assert.equal("Hello World", topic);
        }
    }

}).export(module);
