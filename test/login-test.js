"use strict";

var rio = require("../lib/rio"),
    test = require("tape"),

    // http://sandbox.onlinephpfunctions.com/code/811a2bf6260fe1a30ecfaa0810a9c9ffef838094
    crypt = require("../lib/crypt"); // internal lib code like php crypt api

var isEnablePlaybackMode = process.env.CI === "true";

test("login ok test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/login-ok-test.bin"
    });

    rio.e({
        command: "2 + 2",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.equal(res, 4);
            t.end();
        }
    });
});

test("login ok crypted test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/login-ok-crypted-test.bin"
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

test("login ko test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/login-ko-test.bin"
    });

    rio.e({
        command: "2 + 2",
        user: "wrong user",
        password: "wrong password",
        callback: function (err, res) {
            if (!err) {
                t.equal(res, 4);
            } else {
                if (err.code) {
                    t.equal("ECONNRESET", err.code);
                } else {
                    if (err !== "Response with error code 65" && // Rserve
                        err !== "Response with error code 0" && // Local
                        err !== "Eval failed with error code 0") { // Travis
                        t.error(err);
                    } else {
                        t.pass();
                    }
                }
            }
            t.end();
        }
    });
});

test("crypt internal lib test 1", function (t) {
    var text = "whatever",
        hash = crypt(text, "secret");

    t.equal(hash, "setiWoCgqSGEw");
    t.end();
});

test("crypt internal lib test 2", function (t) {
    var text = "test",
        hash = crypt(text, "SO");

    t.equal(hash, "SOVYikZv1wMH.");
    t.end();
});
