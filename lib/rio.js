"use strict";

var evaluate = require("./evaluate"),
    shutdown = require("./shutdown"),
    trace = require("./trace");

exports.e = evaluate.evaluate;
exports.evaluate = evaluate.evaluate;
exports.shutdown = shutdown.shutdown;
exports.enableDebug = trace.enableDebug;
exports.enableRecordMode = trace.enableRecordMode;
exports.enablePlaybackMode = trace.enablePlaybackMode;
