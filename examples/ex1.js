"use strict";

var rio = require("../lib/rio");

// rio.enableDebug(true);
// rio.enableRecordMode(true, {fileName: 'dump.bin'});
// rio.enablePlaybackMode(true, {fileName: 'dump.bin'});

rio.evaluate("pi / 2 * 2");
rio.evaluate("c(1, 2)");
rio.evaluate("as.character('Hello World')");
rio.evaluate("c('a', 'b')");
rio.evaluate("Sys.sleep(5); 11");
