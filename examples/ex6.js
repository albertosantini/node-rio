// In order to start server run following line in examples directory
// R -f server.R --gui-none --no-save

"use strict";

var rio = require("../lib/rio");

function printEcho(err, res) {
    if (err) {
        console.log("An error occured : " + err);
    } else {
        console.log("Response is : " + res);
    }
}

rio.e({
    entrypoint: "echo",
    data: ["test", "data"],
    callback: printEcho
});
