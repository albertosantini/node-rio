var sys = require('sys'),
    rio = require('rio');

function displayResponse(res) {
    sys.puts("Optimal weights: " + res);
}

var args = {
    prods: ["IBM", "YHOO", "MSFT"]
};

var jsonArgsString = JSON.stringify(args);

// Please, change the path of the script based on Rserve machine
rio.Rserve_eval("setwd('/My/Dev/node-rio/examples'); " +
    "source(file='ex2.R', skip.echo=1); " +
    "getOptimalPortfolio('" + jsonArgsString + "')",
    {callback: displayResponse});

