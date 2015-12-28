"use strict";

var rio = require("../lib/rio"),
    test = require("tape");

var isEnablePlaybackMode = process.env.CI === "true";

test("first image test", function (t) {
    rio.enablePlaybackMode(isEnablePlaybackMode, {
        fileName: "test/dump/image-test.bin"
    });

    rio.e({
        command: "filename <- tempfile('plot', fileext = '.png')\n" +
            "png(filename)\n" +
            "plot(1:10)\n" +
            "dev.off()\n" +
            "image <- readBin(filename, 'raw', 29999)\n" +
            "unlink(filename)\n" +
            "image\n",
        callback: function (err, res) {
            if (err) {
                t.fail(err);
            }
            t.ok(res.length >= 2259);
            t.end();
        }
    });
});
