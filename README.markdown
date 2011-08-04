RIO
======

RIO, R Input Output, allows connecting an app with [Rserve](http://www.rforge.net/Rserve/),
a TCP/IP server which allows other programs to use facilities of [R](http://r-project.org).

It supports double, double array, string and string array objects.

The main goal is to pass a string containing a script call using a JSON object 
as parameter. Then, inside the script, using rjsonio package, deserializing
the JSON object, calling a method, serializing the response and returning to 
nodejs.

Example
========

    var rio = require('rio');

    function displayResponse(res) {
        sys.puts("Callback response: " + res);
    }

    rio.Rserve_eval("pi / 2 * 2", displayResponse);
    rio.Rserve_eval('c(1, 2)', displayResponse);
    rio.Rserve_eval("as.character('Hello World')", displayResponse);
    rio.Rserve_eval('c("a", "b")', displayResponse);
    rio.Rserve_eval('Sys.sleep(5); 11', displayResponse);

See examples directory.

Installation
============

To install with [npm](http://github.com/isaacs/npm):

    npm install rio

Tested with node 0.4.10 and Rserve 0.6.5

Notes
=====

- It works if Rserve runs on a little endian machine.
- Adding error handling if the communication fails.

Methods
=======

Rserve_eval(command, callback, host, port)

Eval a command, connecting to Rserve and then disconnecting.
