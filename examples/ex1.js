var sys = require('sys'),
    rio = require('rio');

function displayResponse(res) {
    sys.puts("Callback response: " + res);
}

rio.Rserve_eval("pi / 2 * 2", displayResponse);
rio.Rserve_eval('c(1, 2)', displayResponse);
rio.Rserve_eval("as.character('Hello World')", displayResponse);
rio.Rserve_eval('c("a", "b")', displayResponse);
rio.Rserve_eval('Sys.sleep(5); 11', displayResponse);
