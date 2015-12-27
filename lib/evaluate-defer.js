"use strict";

exports.evaluateDefer = evaluateDefer;

var evaluate = require("./evaluate");

function evaluateDefer(params) {
    if (typeof Promise !== "function") {
        throw new Error("Promise api is not supported.");
    }

    if (params.callback) {
        throw new Error("Use .then part as callback with Promise.");
    }

    return new Promise(function (resolve, reject) {
        params.callback = function (err, res) {
            if (err) {
                return reject(err);
            }

            return resolve(res);
        };

        return evaluate.evaluate(params);
    });
}
