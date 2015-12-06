"use strict";

var hexy = require("hexy"),
    config = require("./config");

function enableDebug(isDebug) {
    config.debug = isDebug;
}
exports.enableDebug = enableDebug;

function enableRecordMode(isRecordMode, options) {
    var opts = options || {};

    config.dumpFile = opts.fileName || config.dumpFile;
    config.recordMode = isRecordMode;
}
exports.enableRecordMode = enableRecordMode;

function enablePlaybackMode(isPlaybackMode, options) {
    var opts = options || {};

    config.dumpFile = opts.fileName || config.dumpFile;
    config.playbackMode = isPlaybackMode;
}
exports.enablePlaybackMode = enablePlaybackMode;

function log(o) {
    if (config.debug && typeof (o) === "object") {
        console.log(hexy.hexy(o));
    } else if (config.debug && typeof (o) === "string") {
        console.log(o);
    }
}
exports.log = log;
