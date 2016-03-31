"use strict";

var rio = require("../lib/rio");

// matrix needs JSON serialization, because the binary protocol uses attributes,
// not yet implemented.
rio.$e({
    command: "require(RJSONIO); a=matrix(1:6, nrow=2, ncol=3, byrow=T); toJSON(a)"
}).then(function (data) {
    console.log(JSON.parse(data));
}).catch(function (err) {
    console.log(err);
});
