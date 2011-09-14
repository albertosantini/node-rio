/*jslint node:true sloppy:true nomen:true */

var sys = require('sys'),
    rio = require('rio');

function displayResponse(res) {
    if (res !== false) {
        res = JSON.parse(res);
        sys.puts("Optimal weights: " + res.pw);
    }
}

var args = {
    prods: ["IBM", "YHOO", "MSFT"]
};

rio.sourceAndEval(__dirname + "/ex2.R", {
    entryPoint: "getOptimalPortfolio",
    data: args,
    callback: displayResponse
});

