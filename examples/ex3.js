/*jslint node:true, sloppy:true nomen:true */

var rio = require("../lib/rio"),
    assert = require("assert");

var args = {};

args.prods = ["IBM", "YHOO", "MSFT"];
args.referenceDate = "Sat, 06 Aug 2011 12:00:00 GMT";
args.targetReturn = undefined;
args.lows = [0, 0, 0];
args.highs = [1, 1, 1];

function getOptimalPortfolio(params, callback, config) {
    var cfg = {
        entryPoint: "getOptimalPortfolio",
        data: params
    };

    if (config) {
        cfg.host = config.host;
        cfg.port = config.port;
        cfg.user = config.user;
        cfg.password = config.password;
    }

    cfg.callback = function (err, res) {
        var mess, ans = {};

        if (!err) {
            ans = JSON.parse(res);
        } else {
            mess = "Rserve call failed";
            ans.message = mess;
        }

        callback(ans);
    };

    rio.sourceAndEval(__dirname + "/ex3.R", cfg);
}

getOptimalPortfolio(args, function (res) {
    var i;

    if (res.message !== "") {
        console.log(res.message);
    } else {
        for (i = 0; i < args.prods.length; i += 1) {
            console.log("Optimal weight for " + args.prods[i] +
                " is " + res.optim.pw[i]);
        }
        console.log("Portfolio performances: " + res.perf);

        assert.deepEqual([0.27107, 0.2688, 0.46013], res.optim.pw);
        assert.deepEqual([0.0000000,
            -0.0510010, -0.0131090, -0.0039485, 0.0173990, 0.0692240],
            res.perf.slice(0, 6));
    }

}, {
    host: "127.0.0.1"
});


