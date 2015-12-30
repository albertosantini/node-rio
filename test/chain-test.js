"use strict";

var rio = require("../lib/rio"),
    test = require("tape");

var isEnablePlaybackMode = process.env.CI === "true";

test("chain test", function (t) {
    t.plan(2);

    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/chain-test.bin"
    }).e({
        command: "2 * 2",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.equal(res, 4);
        }
    }).e({
        command: "2 * 2",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.equal(res, 4);
        }
    });

});
