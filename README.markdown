RIO
======

RIO, R Input Output, connects an app to [Rserve](http://www.rforge.net/Rserve/),
a TCP/IP server which allows other programs to use facilities of [R](http://www.r-project.org).

It supports double, double array, string and string array objects.

It supports also the plain text authentication, if Rserve is configured for that
capability.

The main goal is to pass a string containing a script call using a JSON object 
as parameter. Then, inside the script, using rjsonio package, deserializing
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

To install with [npm](http://github.com/isaacs/npm):

    npm install rio

Tested with node 0.4.10 and Rserve 0.6.5 (on Windows 7).

Don't forget to start [Rserve](http://cran.r-project.org/web/packages/Rserve/).
For instance, from R console, after installing the package Rserve:

    require('Rserve')
    Rserve()

To shutdown the server from R console:

    require('Rserve')
    c <- RSconnect()
    RSshutdown(c)

Notes
=====

- It works if Rserve runs on a little endian machine.

    return jspack.Unpack(">d", buf, o); // big endian

    return jspack.Unpack("<d", buf, o); // little endian

- Adding a better error handling if the communication fails.

- If the authentication fails, the callback is not called

Methods
=======

evaluate(command, options)
--------

Evaluate a command, connecting to Rserve, executing the command and then 
disconnecting.

The argument of the callback is false if there is any error.

The defaults for the options parameter:

    options = {
        callback: function (res) { if (res !== false) sys.puts(res); },
        host = "127.0.0.1",
        port = 6311,
        user = "anon",
        password = "anon"
    }


sourceAndEval(filename, options)
-------------

It loads the content of a R file and calls the "evaluate" method, merging,
finally, the options parameter:

    options = {
        entryPoint: "main", // entryPoint is called
        data: { foo: "bar" } // data is stringified and passed to entryPoint
    }

