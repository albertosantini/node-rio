"use strict";

exports.debug = false;
exports.recordMode = false;
exports.playbackMode = false;
exports.dumpFile = "node-rio-dump.bin";

exports.CMD_TYPE = {
    LOGIN: 1,
    EVAL: 3,
    SHUTDOWN: 4
};

exports.CAPABILITIES = {
    PLAIN: false,
    CRYPT: false
};
