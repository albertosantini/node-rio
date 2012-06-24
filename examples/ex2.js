/*jslint node:true sloppy:true nomen:true */

var util = require('util'),
    rio = require('../lib/rio');

var args = {
    prods: ["IBM", "YHOO", "MSFT"]
};

function displayResponse(res) {
    var i;

    if (res !== false) {
        res = JSON.parse(res);
        for (i = 0; i < args.prods.length; i += 1) {
            util.puts("Optimal weight for " + args.prods[i] +
                " is " + res.pw[i]);
        }
        // Optimal weights: 0.27107,0.2688,0.46013
    } else {
        util.puts("Optimization failed");
    }
}

rio.sourceAndEval(__dirname + "/ex2.R", {
    entryPoint: "getOptimalPortfolio",
    data: args,
    callback: displayResponse
});

