"use strict";

var rio = require("../lib/rio"),
    test = require("tape");

test("command or filename or entrypoint need to be filled", function (t) {
    try {
        rio.e({
            // empty
        });
    } catch (e) {
        t.pass(e.message);
        t.end();
    }
});

test("command and filename are exclusive", function (t) {
    try {
        rio.e({
            command: "2 + 2",
            filename: "foo.R"
        });
    } catch (e) {
        t.pass(e.message);
        t.end();
    }
});

test("host and path are exclusive", function (t) {
    try {
        rio.e({
            command: "2 + 2",
            host: "127.0.0.1",
            path: "my-unix-pipe"
        });
    } catch (e) {
        t.pass(e.message);
        t.end();
    }
});

test("Use .then part as callback with Promise", function (t) {
    try {
        rio.$e({
            callback: function () {}
        });
    } catch (e) {
        t.pass(e.message);
        t.end();
    }
});
