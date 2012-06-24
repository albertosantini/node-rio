/*jslint node:true sloppy:true bitwise:true  */

var util = require('util'),
    fs = require('fs'),
    net = require('net'),
    binary = require('binary'),
    hexy = require('hexy'),
    jspack = require('./jspack.js').jspack;

var debug = false;

function enableDebug(isDebug) {
    debug = isDebug;
}
exports.enableDebug = enableDebug;

function log(o) {
    if (debug && typeof (o) === "object") {
        console.log(hexy.hexy(o));
    } else if (debug && typeof (o) === "string") {
        util.puts(o);
    }
}

var CMD_TYPE = {
    LOGIN: 1,
    EVAL: 3
}, CAPABILITIES = {
    PLAIN: false,
    CRYPT: false
};

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

    return jspack.Unpack("<d", buf, o);
}

function parse_SEXP(buf, offset) {
    var r, i, oi, ra, rl, eoa, res = [];

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

    if (ra === 33) { // double array
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
                res.push(r.toString("ascii", oi, i));
                oi = i + 1;
            }
            i += 1;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;
    } else {
        log("Type " + ra + " is currently not implemented");
    }

    return false;
}

function connect(host, port, callback) {
    var client = null;

    host = host || "127.0.0.1";
    port = port || 6311;

    client = net.createConnection(port, host);

    client.on("connect", function () {
        log("Connected to Rserve");
    });

    client.on("end", function () {
        log("Disconnected from Rserve");
    });

    client.on("close", function (had_error) {
        log("Closed from Rserve");

        if (had_error) {
            callback(false);
        }
    });

    client.on("error", function (e) {
        log("Rserve exception - " + e);
    });

    return client;
}

function close(client) {
    client.end();
}

function sendCommand(conn, cmdType, cmd, len, desc) {
    var buf = new Buffer(len),
        n = cmd.length + 1;

    cmd += String.fromCharCode(0);
    if (cmdType !== CMD_TYPE.LOGIN) {
        while ((n & 3) !== 0) {
            cmd += String.fromCharCode(1);
            n += 1;
        }
    }

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

    buf  = null;
}

function evaluate(cmd, options) {
    var opts = options || {},
        callback = opts.callback || function (res) {
            if (res !== false) {
                util.puts(res);
            } else {
                util.puts("Rserve call failed");
            }
        },
        host = opts.host || "127.0.0.1",
        port = opts.port || 6311,
        user = opts.user || "anon",
        password = opts.password || "anon",
        conn,
        len,
        auth;

    conn = connect(host, port, callback);

    binary(conn)
        .buffer("rServeIdSignature", 4) // Rsrv
        .buffer("rServeProtocolVersion", 4) // 0103
        .buffer("rServeCommunicationProtocol", 4) // QAP1
        .skip(4)
        .buffer("rServeCapabilities", 16)
        .tap(function (vars) {
            var cap = vars.rServeCapabilities.toString('ascii'),
                rs = vars.rServeIdSignature.toString('ascii'),
                rv = vars.rServeProtocolVersion.toString('ascii');

            if (rs !== "Rsrv" && rv !== "0103") {
                log("Unsupported protocol " + rs + " " + rv);
                callback(false);
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
                                log("Response with error code " + sc);
                                callback(false);
                            }
                        });

                    auth = user + "\n" + password;
                    len = 20 + (auth.length + 1);
                    sendCommand(conn, CMD_TYPE.LOGIN, auth, len,
                        "Login on Rserve");
                }

                len = 20 + (cmd.length + 1) + (4 - (cmd.length + 1) % 4) % 4;
                sendCommand(conn, CMD_TYPE.EVAL, cmd, len,
                    "Sending command to Rserve");

                close(conn);
            }
        })
        .buffer("dataHeader", 16)
        .buffer("dataPacketType", 1) // 0x10
        .buffer("lenDataPacket", 3)
        .tap(function (vars) {
            var rl = int24(vars.lenDataPacket);

            this.buffer("dataPacket", rl)
                .tap(function (vars) {
                    var res;

                    log("Data packet");
                    log(vars.dataPacket);

                    res = parse_SEXP(vars.dataPacket, 0);
                    log("Response value: " + res);

                    callback(res);
                });
        });
}
exports.evaluate = evaluate;

function sourceAndEval(filename, options) {
    options = options || {};

    fs.readFile(filename, "ascii", function (err, source) {
        var cmd;

        if (!err) {
            cmd = source.replace(/(\r\n)/g, "\n");
            if (options.entryPoint) {
                cmd += "\n" + options.entryPoint + '(';
                if (options.data) {
                    cmd += "'" + JSON.stringify(options.data) + "')";
                } else {
                    cmd += ')';
                }
            }

            evaluate(cmd, options);
        }
    });
}
exports.sourceAndEval = sourceAndEval;
