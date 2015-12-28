"use strict";

var rio = require("../lib/rio"),
    test = require("tape");

var isEnablePlaybackMode = process.env.CI === "true";

test("require test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/require-test.bin"
    });

    rio.e({
        command: "require(xxx)",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            // library fires a warning and returns false
            // if the package is missing
            // assert.equal("Eval failed with error code 127", err);
            t.equal(res, false);
            t.end();
        }
    });
});

test("library test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/library-test.bin"
    });

    rio.e({
        command: "library(xxx)",
        callback: function (err) {
            t.equal(err, "Eval failed with error code 127");
            t.end();
        }
    });
});

test("unknown test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/unknown-test.bin"
    });

    rio.e({
        command: "x",
        callback: function (err) {
            t.equal(err, "Eval failed with error code 127");
            t.end();
        }
    });
});

test("syntax test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/syntax-test.bin"
    });

    rio.e({
        command: "1 // 3",
        callback: function (err) {
            t.equal(err, "Eval failed with error code 3");
            t.end();
        }
    });
});
