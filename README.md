RIO
======
[![Build Status](https://travis-ci.org/albertosantini/node-rio.png)](https://travis-ci.org/albertosantini/node-rio)
[![NPM version](https://badge.fury.io/js/rio.png)](http://badge.fury.io/js/rio)
[![NGN Dependencies](https://david-dm.org/albertosantini/node-rio.png)](https://david-dm.org/albertosantini/node-rio)

RIO, R Input Output, connects an app to [Rserve](http://www.rforge.net/Rserve/),
a TCP/IP server which allows other programs to use facilities of [R](http://www.r-project.org).

It supports double, double array, integer, integer array, string, string array,
boolean, boolean array objects and raw vector (images or files).

It supports also the plain text and crypted authentication, if Rserve is
configured for that capability.

The main goal is to pass a string containing a script call using a JSON object
as parameter. Then, inside the script, using `RJSONIO` or `jsonlite` package,
deserializing the JSON object, calling a method, serializing the response and
returning to Node.js.

Examples
========

    var rio = require("rio");

    rio.e({command: "pi / 2 * 2"});
    rio.e({command: "c(1, 2)"});
    rio.e({command: "as.character('Hello World')"});
    rio.e({command: "c('a', 'b')"});
    rio.e({command: "Sys.sleep(5); 11"})

    rio.$e({
        command: "pi / 2 * 2"
    }).then(function (res) {
        console.log(res);
    });

    rio.e({
        command: "2 + 2"
    }).e({
        command: "3 + 3"
    });

See `examples` directory.

- `ex1`: Getting started with `evaluate` api.
- `ex2`: How to evaluate a `filename` and `entrypoint`.
- `ex3`: How to evaluate a `filename` and `host`.
- `ex4`: An example with utf-8 chars.
- `ex5`: How to retrieve a plot.
- `ex6`: How to call functions already loaded in R session.
- `ex7`: An example with large data packet.
- `ex8`: An example with `evaluateDefer` api.
- `ex9`: An example chaining `evaluate` api.
- `ex10`: How to evaluate a matrix, using JSON serialization.

Installation
============

[![NPM](https://nodei.co/npm/rio.png?downloads=true&downloadRank=true)](https://nodei.co/npm/rio/)
[![NPM](https://nodei.co/npm-dl/rio.png)](https://nodei.co/npm/rio/)

To install with [npm](http://github.com/isaacs/npm):

    npm install rio

Tested with Node.js 5.x and Rserve 1.7.3, on Windows 10 64 with R 3.2.2
and on Debian Jessie (USB armory) with R 3.1.1.

Don't forget to start [Rserve](http://cran.r-project.org/web/packages/Rserve/).
For instance, from R console, after installing the package Rserve:

    require("Rserve")
    Rserve()

To shutdown the server from R console:

    require("RSclient")
    c <- RSconnect()
    RSshutdown(c)

Methods
=======

evaluate(config) - e(config)
----------------------------

Evaluate a command, connecting to Rserve, executing the command and then
disconnecting. The result is passed to the callback.

The defaults for the options parameter:

    config = {
        command: "",
        filename: "",

        entrypoint: "",
        data: {},

        callback: function (err, res) {
            if (!err) {
                console.log(res);
            } else {
                console.log("Rserve call failed. " + err);
            }
        },

        host = "127.0.0.1",
        port = "6311",
        path = undefined,

        user = "anon",
        password = "anon"
    }

- `command` OR `filename` OR `entrypoint` need to be filled.
Otherwise it is missing the evaluation object.

- if `command` AND  `filename` AND `entrypoint` are empty then error.
As above, said in different way.

- `command` AND `filename` are exclusive: if both are not empty then error.
Otherwise what does rio evaluate, command or filename?

- if `command` AND  `filename` are empty then `entrypoint` is mandatory.
This is the case when rio evaluates a function defined on R side.

- `host` AND `path` are exclusive.
rio needs to choose beetween net socket or unix socket transport.

When `filename` is filled, rio loads the content of a R file, calling
finally an `entrypoint`, passing `data`.

    config = {
        filename: "foo.R",
        entrypoint: "main", // entrypoint is called
        data: { foo: "bar" } // data is stringified and passed to entrypoint
    }

When `entrypoint` is filled, finally passing `data`, it is used when we
need to call a function defined in Rserve instance.

    config = {
        entrypoint: "echo",
        data: ["test", "data"],
        callback: printEcho
    }

evaluateDefer(config) - $e(config)
----------------------------------

Evaluate a command, returning a promise: config options is the same as
`evaluate`.

shutdown(options)
-----------------

Sends the `CMD_shutdown` command to the Rserve server. Options are the same as
for `evaluate`.

enableDebug(isDebug)
-----------

It enables debugging mode, printing the packet and logging messages on client
side.

You may start also a Rserve instance in debugging mode with following commands
(on Windows box with Git Bash Shell):

```
export R_PATH=/c/My/Programs/R
export PATH=$PATH:$R_PATH/bin/x64

$R_PATH/library/Rserve/libs/x64/Rserve_d.exe --
```

Set your paths accordingly.

enableRecordMode(isRecordMode, options)
----------------

It enables record mode, dumping the incoming data to a file specified in the
options.

    options = {
        fileName: "node-rio-dump.bin"
    }

It is useful to record a Rserve session to replay it in an environment without
[Rserve](http://cran.r-project.org/web/packages/Rserve/) (for example
[Travis CI](https://travis-ci.org/)). For instance,

```
> var rio=require("./index.js")
undefined
> rio.enableRecordMode(true, {fileName: "test/dump/integer-test.bin"});
undefined
> rio.evaluate({command: "as.integer(3)"})
undefined
> 3
(^C again to quit)
```

Then, you need to export the variable `CI` to emulate CI environment:
`export CI=true`

Eventually `npm test`.

enablePlaybackMode(isPlaybackMode, options)
------------------

It enables playback mode, reading a dump file instead connecting to the server.

    options = {
        fileName: "node-rio-dump.bin"
    }


Contributors
============

```
project  : node-rio
repo age : 4 years, 5 months
active   : 111 days
commits  : 256
files    : 59
authors  :
  227  icebox                  88.7%
    8  Alberto Santini         3.1%
    7  Manuel Santillan        2.7%
    6  albertosantini          2.3%
    3  Karthik Madathil        1.2%
    2  Anand Patil             0.8%
    1  Alex Proca              0.4%
    1  Farrin Reid             0.4%
    1  Koichiro Sobue          0.4%
```
