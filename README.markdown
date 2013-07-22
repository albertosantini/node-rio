RIO
======
[![Build Status](https://travis-ci.org/albertosantini/node-rio.png)](https://travis-ci.org/albertosantini/node-rio)
[![NPM version](https://badge.fury.io/js/rio.png)](http://badge.fury.io/js/rio)
[![NGN Dependencies](https://david-dm.org/albertosantini/node-rio.png)](https://david-dm.org/albertosantini/node-rio)

RIO, R Input Output, connects an app to [Rserve](http://www.rforge.net/Rserve/),
a TCP/IP server which allows other programs to use facilities of [R](http://www.r-project.org).

It supports double, double array, string and string array objects.

It supports also the plain text authentication, if Rserve is configured for that
capability.

The main goal is to pass a string containing a script call using a JSON object
as parameter. Then, inside the script, using RJSONIO package, deserializing
the JSON object, calling a method, serializing the response and returning to
NodeJS.

Example
========

    var rio = require('rio');

    rio.evaluate("pi / 2 * 2");
    rio.evaluate('c(1, 2)');
    rio.evaluate("as.character('Hello World')");
    rio.evaluate('c("a", "b")');
    rio.evaluate('Sys.sleep(5); 11')

See examples directory.

Installation
============

[![NPM](https://nodei.co/npm/rio.png?downloads=true)](https://nodei.co/npm/rio/)
[![NPM](https://nodei.co/npm-dl/rio.png)](https://nodei.co/npm/rio/)

To install with [npm](http://github.com/isaacs/npm):

    npm install rio

Tested with node 0.10.7 and Rserve 0.6.8 (on Windows 7) with R 3.0.1.

Don't forget to start [Rserve](http://cran.r-project.org/web/packages/Rserve/).
For instance, from R console, after installing the package Rserve:

    require('Rserve')
    Rserve()

To shutdown the server from R console:

    require('Rserve')
    c <- RSconnect()
    RSshutdown(c)

Methods
=======

evaluate(command, options)
--------------------------

Evaluate a command, connecting to Rserve, executing the command and then
disconnecting.

The defaults for the options parameter:

    options = {
        callback: function (err, res) {
            if (err) {
                util.puts(res);
            } else {
                util.puts("Rserve call failed");
            }
        },
        host = "127.0.0.1",
        port = 6311,
        path = undefined,
        user = "anon",
        password = "anon"
    }

Either define `path`, the path of a Unix socket, or `host`/`port`.

shutdown(options)
-----------------

Sends the `CMD_shutdown` command to the Rserve server. Options are the same as
for `evaluate`.

sourceAndEval(filename, options)
-------------

It loads the content of a R file and calls the "evaluate" method, merging,
finally, the options parameter:

    options = {
        entryPoint: "main", // entryPoint is called
        data: { foo: "bar" } // data is stringified and passed to entryPoint
    }

enableDebug(isDebug)
-----------

It enables debugging mode, printing the packet and logging messages.

enableRecordMode(isRecordMode, options)
----------------

It enables record mode, dumping the incoming data to a file specified in the
options.

    options = {
        fileName: "node-rio-dump.bin"
    }

enablePlaybackMode(isPlaybackMode, options)
------------------

It enables playback mode, reading a dump file instead connecting to the server.

    options = {
        fileName: "node-rio-dump.bin"
    }
