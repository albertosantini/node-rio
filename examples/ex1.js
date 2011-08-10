var rio = require('rio');

rio.Rserve_eval("pi / 2 * 2");
rio.Rserve_eval('c(1, 2)');
rio.Rserve_eval("as.character('Hello World')");
rio.Rserve_eval('c("a", "b")');
rio.Rserve_eval('Sys.sleep(5); 11');
