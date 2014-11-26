"use strict";

var util = require("util"),
    fs = require("fs"),
    net = require("net"),
    binary = require("binary"),
    hexy = require("hexy");

var debug = false,
    recordMode = false,
    playbackMode = false,
    dumpFile = "node-rio-dump.bin";

var CMD_TYPE = {
        LOGIN: 1,
        EVAL: 3,
        SHUTDOWN: 4
    }, CAPABILITIES = {
        PLAIN: false,
        CRYPT: false
    };

function enableDebug(isDebug) {
    debug = isDebug;
}
exports.enableDebug = enableDebug;

function enableRecordMode(isRecordMode, options) {
    var opts = options || {};

    dumpFile = opts.fileName || dumpFile;
    recordMode = isRecordMode;
}
exports.enableRecordMode = enableRecordMode;

function enablePlaybackMode(isPlaybackMode, options) {
    var opts = options || {};

    dumpFile = opts.fileName || dumpFile;
    playbackMode = isPlaybackMode;
}
exports.enablePlaybackMode = enablePlaybackMode;

function log(o) {
    if (debug && typeof (o) === "object") {
        console.log(hexy.hexy(o));
    } else if (debug && typeof (o) === "string") {
        util.puts(o);
    }
}

function int8(buf, o) {
    o = o || 0;

    return buf[o];
}

function int24(buf, o) {
    o = o || 0;

    return buf[o] | buf[o + 1] << 8 | buf[o + 2] << 16;
}

function int32(buf, o) {
    o = o || 0;

    return buf[o] | buf[o + 1] << 8 | buf[o + 2] << 16 | buf[o + 3] << 24;
}

function mkint32(v, buf, o) {
    buf[o] = v & 0xff;
    buf[o + 1] = (v & 0xff00) >> 8;
    buf[o + 2] = (v & 0xff0000) >> 16;
    buf[o + 3] = (v & 0xff000000) >> 24;
}

function mkint24(v, buf, o) {
    buf[o] = v & 0xff;
    buf[o + 1] = (v & 0xff00) >> 8;
    buf[o + 2] = (v & 0xff0000) >> 16;
}

function flt64(buf, o) {
    o = o || 0;

    return buf.readDoubleLE(o);
}

function parse_SEXP(buf, offset) {
    var r, i, oi, ra, rl, eoa, len, n, k, v, res = [];

    r = buf;
    i = offset;

    ra = int8(r, i);
    rl = int24(r, i + 1);
    i += 4;
    offset = i + rl;
    eoa = offset;
    if ((ra & 64) === 64) {
        log("sorry, long packets are not supported (yet).");
    }

    log("Type SEXP " + ra);

    if (ra === 32) { // Integer array
        while (i < eoa) {
            res.push(int32(r, i));
            i += 4;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 33) { // double array
        while (i < eoa) {
            res.push(flt64(r, i));
            i += 8;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 34) { // string array
        oi = i;
        while (i < eoa) {
            if (r[i] === 0) {
                res.push(r.toString("utf8", oi, i));
                oi = i + 1;
            }
            i += 1;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 36) { // boolean array
        n = int32(r, i);
        i += 4;
        k = 0;
        while (k < n) {
            v = int8(r, i);
            res.push((v === 1) ? true : ((v === 0) ? false : null));
            i += 1;
            k += 1;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 37) { // raw vector
        len = int32(r, i);
        i += 4;
        res = r.slice(i, i + len);
        return res;
    }

    log("Type " + ra + " is currently not implemented");

    return res;
}

function connect(netOpts, callback, isRecordMode) {
    var client = null, recordStream;

    client = net.createConnection(netOpts);

    client.on("connect", function () {
        log("Connected to Rserve");

        client.setKeepAlive(true);
    });

    client.on("end", function () {
        log("Disconnected from Rserve");

        if (isRecordMode) {
            recordStream.end();
        }
        callback();
    });

    client.on("close", function (had_error) {
        log("Closed from Rserve");

        if (had_error) {
            callback(true);
        }
    });

    client.on("error", function (e) {
        log("Rserve exception - " + e);
        callback(e);
    });

    if (isRecordMode) {
        recordStream = fs.createWriteStream(dumpFile, {
            flags: "a"
        });
        client.pipe(recordStream);
    }

    return client;
}

function close(client) {
    if (!playbackMode) {
        client.end();
    }
}

function sendCommand(conn, cmdType, cmd, len, desc) {
    var n = Buffer.byteLength(cmd) + 1,
        buf;

    cmd += String.fromCharCode(0);
    if (cmdType !== CMD_TYPE.LOGIN) {
        while ((n & 3) !== 0) {
            cmd += String.fromCharCode(1);
            n += 1;
        }
    }

    if (cmdType !== CMD_TYPE.LOGIN) {
        while ((n & 15) !== 0) {
            cmd += String.fromCharCode(1);
            n += 1;
            len += 1;
        }
    }

    buf = new Buffer(len);

    mkint32(cmdType, buf, 0);
    mkint32(n + 4, buf, 4);
    mkint32(0, buf, 8);
    mkint32(0, buf, 12);
    buf[16] = 4;
    mkint24(n, buf, 17);
    buf.write(cmd, 20);

    log(desc);
    if (cmdType !== CMD_TYPE.LOGIN) {
        log(buf);
    }

    conn.write(buf);

    buf = null;
}

function sendAction(cmd, type, msg, options) {
    var opts = options || {},
        netOpts = {},
        cb = opts.callback || function (err, res) {
            if (!err) {
                util.puts(res);
            } else {
                util.puts("Rserve call failed. " + err);
            }
        },
        user = opts.user || "anon",
        password = opts.password || "anon",
        conn,
        len,
        auth,
        errorString,
        callbacked = false;


    function callback(err, res) { // callback wrapper to avoid dups
        if (!callbacked) {
            cb(err, res);
        }
        callbacked = true;
    }

    if (playbackMode) {
        conn = fs.readFileSync(dumpFile);
    } else {
        if (opts.path) {
            if (opts.host || opts.port) {
                throw new Error("You gave me a socket and a host or port.");
            } else {
                netOpts.path = opts.path;
            }
        } else {
            netOpts.host = opts.host || "127.0.0.1";
            netOpts.port = opts.port || "6311";
        }
        conn = connect(netOpts, callback, recordMode);
    }

    binary(conn)
        .buffer("rServeIdSignature", 4) // Rsrv
        .buffer("rServeProtocolVersion", 4) // 0103
        .buffer("rServeCommunicationProtocol", 4) // QAP1
        .skip(4)
        .buffer("rServeCapabilities", 16)
        .tap(function (vars) {
            var cap = vars.rServeCapabilities.toString("ascii"),
                rs = vars.rServeIdSignature.toString("ascii"),
                rv = vars.rServeProtocolVersion.toString("ascii");

            if (rs !== "Rsrv" && rv !== "0103") {
                errorString = "Unsupported protocol " + rs + " " + rv;
                log(errorString);
                callback(errorString);
                close(conn);

            } else {
                log("Supported capabilities " + cap);

                CAPABILITIES.CRYPT = false;
                CAPABILITIES.PLAIN = false;
                if (cap.search("ARpt") !== -1) {
                    CAPABILITIES.PLAIN = true;
                    log("Authentication required and not crypted");
                } else if (cap.search("ARuc") !== -1) {
                    CAPABILITIES.CRYPT = true;
                    log("Authentication required and crypted");
                }

                if (CAPABILITIES.PLAIN) {
                    this.buffer("loginResponse", 16)
                        .tap(function (vars) {
                            var res, sc, rr;

                            log("Login response");
                            log(vars.loginResponse);

                            res = int32(vars.loginResponse);
                            sc = (res >> 24) & 127;
                            rr = res & 255;

                            if (rr !== 1) {
                                errorString = "Response with error code " + sc;
                                log(errorString);
                                callback(errorString);
                                close(conn);
                            }
                        });

                    auth = user + "\n" + password;
                    len = 20 + (auth.length + 1);
                    if (!playbackMode) {
                        sendCommand(conn, CMD_TYPE.LOGIN, auth, len,
                            "Login on Rserve");
                    }
                }

                len = Buffer.byteLength(cmd);
                len = 20 + (len + 1) + (4 - (len + 1) % 4) % 4;
                if (!playbackMode) {
                    sendCommand(conn, type, cmd, len, msg);
                }

            }
        })
        .buffer("dataHeader", 16)
        .tap(function (vars) {
            var cmdResponse = int32(vars.dataHeader);

            log("Data Header");
            log(vars.dataHeader);

            if ((cmdResponse & 255) !== 1) {
                errorString = "Eval failed with error code " +
                    ((cmdResponse >> 24) & 127);
                log(errorString);
                callback(errorString);

                close(conn);
            }
        })
        .buffer("dataPacketType", 1)
        .tap(function (vars) {
            var responseType = int8(vars.dataPacketType);

            if (responseType !== 10) {
                errorString = "Invalid response (expecting SEXP)";
                log(errorString);
                callback(errorString);
                close(conn);
            }
        })
        .buffer("lenDataPacket", 3)
        .tap(function (vars) {
            var rl = int24(vars.lenDataPacket);

            this.buffer("dataPacket", rl)
                .tap(function (vars) {
                    var res;

                    log("Data packet");
                    log(vars.dataPacket);

                    res = parse_SEXP(vars.dataPacket, 0);

                    if (res.length === 0) {
                        callback(true);
                    } else {
                        log("Response value: " + res);
                        callback(false, res);
                    }
                    close(conn);
                });
        });
}

function evaluate(cmd, options) {
    sendAction(cmd, CMD_TYPE.EVAL, "Sending command to Rserve", options);
}
exports.evaluate = evaluate;

function shutdown(options) {
    sendAction("SHUTDOWN", CMD_TYPE.SHUTDOWN,
        "Shutting down Rserve server", options);
}
exports.shutdown = shutdown;

function evaluateWithEntryPoint(cmd, options) {
    options = options || {};

    cmd = cmd || "";

    if (options.entryPoint) {
        cmd += "\n" + options.entryPoint + "(";
        if (options.data) {
            cmd += "'" + JSON.stringify(options.data) + "')";
        } else {
            cmd += ")";
        }
    }

    evaluate(cmd, options);
}

function sourceAndEval(filename, options) {
    fs.readFile(filename, "utf8", function (err, source) {
        if (!err) {
            evaluateWithEntryPoint(source.replace(/(\r\n)/g, "\n"), options);
        } else {
            throw (err);
        }
    });
}
exports.sourceAndEval = sourceAndEval;

function bufferAndEval(buffer, options) {
    evaluateWithEntryPoint(buffer, options);
}
exports.bufferAndEval = bufferAndEval;
