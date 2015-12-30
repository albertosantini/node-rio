"use strict";

var hexy = require("hexy"),
    config = require("./config");

function enableDebug(isDebug) {
    config.debug = isDebug;

    return this;
}
exports.enableDebug = enableDebug;

function enableRecordMode(isRecordMode, options) {
    var opts = options || {};

    config.dumpFile = opts.fileName || config.dumpFile;
    config.recordMode = isRecordMode;

    return this;
}
exports.enableRecordMode = enableRecordMode;

function enablePlaybackMode(isPlaybackMode, options) {
    var opts = options || {};

    config.dumpFile = opts.fileName || config.dumpFile;
    config.playbackMode = isPlaybackMode;

    return this;
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
