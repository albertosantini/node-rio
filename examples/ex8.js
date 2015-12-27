"use strict";

var rio = require("../lib/rio");

rio.$e({
    command: "2 + 2"
}).then(function (data) {
    console.log(data); // displays 4
}).catch( function (err) {
    console.log(err);
});
