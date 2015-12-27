"use strict";

var fs = require("fs"),
    main = require("./main"),
    config = require("./config");

function evaluate(params) {
    var cmd = params.command || "",
        filename = params.filename || "",
        entrypoint = params.entrypoint || "",
        options = params;

    if (!cmd && !filename && !entrypoint) {
        throw new Error("command or filename or entrypoint need to be filled.");
    }

    if (cmd && filename) {
        throw new Error("command and filename are exclusive.");
    }

    if (params.host && params.path) {
        throw new Error("host and path are exclusive.");
    }

    if (filename) {
        cmd = fs.readFileSync(filename, "utf8");
        cmd = cmd.replace(/(\r\n)/g, "\n");
    }

    if (entrypoint) {
        cmd += "\n" + entrypoint + "(";
        if (params.data) {
            cmd += "'" + JSON.stringify(params.data) + "')";
        } else {
            cmd += ")";
        }
    }

    main.sendAction(cmd, config.CMD_TYPE.EVAL,
        "Sending command to Rserve", options);

    return this;
}
exports.evaluate = evaluate;
