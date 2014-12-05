"use strict";

var main = require("./main"),
    config = require("./config");

function shutdown(options) {
    main.sendAction("SHUTDOWN", config.CMD_TYPE.SHUTDOWN,
        "Shutting down Rserve server", options);
}
exports.shutdown = shutdown;
