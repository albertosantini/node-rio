"use strict";

var rio = require("../lib/rio");

// rio.enableDebug(true);
// rio.enableRecordMode(true, {fileName: "dump.bin"});
// rio.enablePlaybackMode(true, {fileName: "dump.bin"});

rio.e({command: "pi / 2 * 2"});
rio.e({command: "c(1, 2)"});
rio.e({command: "as.character('Hello World')"});
rio.e({command: "c('a', 'b')"});
rio.e({command: "Sys.sleep(5); 11"});
