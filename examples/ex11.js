"use strict";

var path = require("path"),
    rio = require("../lib/rio");

function displayResponse(err, res) {

    if (!err) {
        res = JSON.parse(res);
        console.log(unescape(res.hello)); // Hello 'world'!
    } else {
        console.log(err, "Rserve call failed");
    }
}

rio.e({
    filename: path.join(__dirname, "ex11.R"),
    entrypoint: "run",
    data: {
        "hello": escape("Hello 'world'!")
    },
    callback: displayResponse
});

rio.e({command: "as.character('Hello \\'World\\'!')"}); // Hello 'world'!
