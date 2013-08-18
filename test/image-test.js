/*jshint quotmark: false */

"use strict";

var rio = require("../lib/rio"),
    vows = require("vows"),
    assert = require("assert");

vows.describe("Image tests").addBatch({
    "first image test": {
        topic: function () {
            rio.enablePlaybackMode(true, {
                fileName: "test/image-test.bin"
            });

            rio.evaluate('filename <- tempfile("plot", fileext = ".png")\n' +
                'png(filename)\n' +
                'plot(1:10)\n' +
                'dev.off()\n' +
                'image <- readBin(filename, "raw", 9999)\n' +
                'unlink(filename)\n' +
                'image\n', {
                callback: this.callback
            });
        },

        "get image": function (err, topic) {
            if (!err) {
                assert.equal(topic.length, 2259);
            }
        }
    }

}).export(module);