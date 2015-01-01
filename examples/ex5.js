"use strict";

var fs = require("fs"),
    path = require("path"),
    rio = require("../lib/rio");

function getPlot(error, res) {
    if (!error) {
        fs.writeFile("myPlot.png", res, {encoding: "binary"}, function (err) {
            if (!err) {
                console.log("myPlot.png saved in ", __dirname);
            }
        });
    } else {
        console.log("Loading image failed");
    }
}

rio.e({
    filename: path.join(__dirname, "ex5.R"),
    entrypoint: "createDummyPlot",
    callback: getPlot
});
