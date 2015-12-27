"use strict";

var evaluate = require("./evaluate"),
    evaluateDefer = require("./evaluateDefer"),
    shutdown = require("./shutdown"),
    trace = require("./trace");

exports.e = evaluate.evaluate;
exports.evaluate = evaluate.evaluate;
exports.$e = evaluateDefer.evaluateDefer;
exports.evaluateDefer = evaluateDefer.evaluateDefer;
exports.shutdown = shutdown.shutdown;
exports.enableDebug = trace.enableDebug;
exports.enableRecordMode = trace.enableRecordMode;
exports.enablePlaybackMode = trace.enablePlaybackMode;
