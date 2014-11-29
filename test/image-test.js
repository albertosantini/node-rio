/*jshint quotmark: false */

"use strict";

var rio = require("../lib/rio"),
    vows = require("vows"),
    assert = require("assert");

var isEnablePlaybackMode = process.env.CI === "true";

vows.describe("Image tests").addBatch({
    "first image test": {
        topic: function () {
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
                callback: this.callback
            });
        },

        "get image": function (err, topic) {
            if (!err) {
                // the length depends on graphics system used
                assert(topic.length >= 2259);
            }
        }
    }

}).export(module);
