"use strict";

var fs = require("fs"),
    rio = require("../lib/rio");

function getPlot(err, res) {
    if (!err) {
        fs.writeFile("myPlot.png", res, { encoding: "binary" }, function (err) {
            if (!err) {
                console.log("myPlot.png saved in " + __dirname);
            }
        });
    } else {
        console.log("Loading image failed");
    }
}

rio.sourceAndEval(__dirname + "/ex5.R", {
    entryPoint: "createDummyPlot",
    callback: getPlot
});

