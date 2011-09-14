/*jslint node:true sloppy:true */

var rio = require('rio');

rio.evaluate("pi / 2 * 2");
rio.evaluate('c(1, 2)');
rio.evaluate("as.character('Hello World')");
rio.evaluate('c("a", "b")');
rio.evaluate('Sys.sleep(5); 11');
