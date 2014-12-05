"use strict";

var fs = require("fs"),
    main = require("./main"),
    config = require("./config");

function evaluate(params) {
    var cmd = params.command || "",
        filename = params.filename || "",
        entrypoint = params.entrypoint || "",
        options = params;

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
}
exports.evaluate = evaluate;
