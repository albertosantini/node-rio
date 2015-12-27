"use strict";

exports.evaluateDefer = evaluateDefer;

var evaluate = require("./evaluate");

function evaluateDefer(params) {
    if (typeof Promise !== "function") {
        throw new Error("Promise api is not supported.");
    }

    return new Promise(function (resolve, reject) {
        if (params.callback) {
            return reject("Use .then part as callback with Promise.");
        }

        params.callback = function (err, res) {
            if (err) {
                return reject(err);
            }

            return resolve(res);
        };

        return evaluate.evaluate(params);
    });
}
