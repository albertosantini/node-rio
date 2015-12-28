"use strict";

var rio = require("../lib/rio"),
    test = require("tape");

var isEnablePlaybackMode = process.env.CI === "true";

test("integer test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/integer-test.bin"
    });

    rio.e({
        command: "as.integer(3)",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.equal(res, 3);
            t.end();
        }
    });
});

test("integer array test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/integer-array-test.bin"
    });

    rio.e({
        command: "c(as.integer(1), as.integer(2))",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.deepEqual(res, [1, 2]);
            t.end();
        }
    });
});

test("double number test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/double-test.bin"
    });

    rio.e({
        command: "pi / 2 * 2",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.equal(res, 3.141592653589793);
            t.end();
        }
    });
});

test("double number array test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/double-array-test.bin"
    });

    rio.e({
        command: "c(1, 2)",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.deepEqual(res, [1, 2]);
            t.end();
        }
    });
});

test("string test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/string-test.bin"
    });

    rio.e({
        command: "as.character('Hello World')",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.equal(res, "Hello World");
            t.end();
        }
    });
});

test("string array test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/string-array-test.bin"
    });

    rio.e({
        command: "c('a', 'b')",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.deepEqual(res, ["a", "b"]);
            t.end();
        }
    });
});

test("boolean test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/boolean-test.bin"
    });

    rio.e({
        command: "TRUE",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.equal(res, true);
            t.end();
        }
    });
});

test("boolean array test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/boolean-array-test.bin"
    });

    rio.e({
        command: "c(TRUE, FALSE)",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.deepEqual(res, [true, false]);
            t.end();
        }
    });
});

test("utf8 string test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/string-test.bin"
    });

    rio.e({
        command: "# แผ่นดินฮั่นเสื่อมโทรมแสน\n" +
            "as.character('Hello World')",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.equal(res, "Hello World");
            t.end();
        }
    });
});
