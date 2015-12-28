"use strict";

var rio = require("../lib/rio"),
    test = require("tape");

var isEnablePlaybackMode = process.env.CI === "true";

var command = "2 + 2";

test("defer .then part test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/defer-then-test.bin"
    });

    rio.$e({
        command: command
    }).then(function (res) {
        t.equal(res, 4);
        t.end();
    }).catch(function (err) {
        t.fail(err);
    });
});

test("defer .catch part test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/defer-catch-test.bin"
    });

    rio.$e({
        command: "wrong command"
    }).then(function () {
        t.fail("it should generate an error");
    }).catch(function (err) {
        t.equal(err, "Eval failed with error code 3");
        t.end();
    });
});
