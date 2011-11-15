/*jslint node:true sloppy:true bitwise:true unparam:true nomen:true */

var sys = require("sys"),
    fs = require('fs'),
    net = require('net'),
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
        sys.puts(o);
    }
}

var CMD_TYPE = {
    LOGIN: 1,
    EVAL: 3
}, CAPABILITIES = {
    AUTH: false,
    CRYPT: false
};

var isReadyToSendCommands = false;

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

    // return jspack.Unpack(">d", buf, o); // big endian
    return jspack.Unpack("<d", buf, o); // little endian
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

function isResponseOk(data, offset) {
    var res, sc, rr;

    res = int32(data, offset - 20);
    sc = (res >> 24) & 127;
    rr = res & 255;

    if (rr !== 1) {
        log("Response with error code " + sc);
        return false;
    }

    return true;
}

function parsePacket(data, offset, callback) {
    var res, rt;

    rt = int8(data, offset - 4);
    while (rt === 1) { // skip login or header packet
        offset += 16;
        if (offset >= data.length) {
            return; // no data
        }
        rt = int8(data, offset - 4);
    }
    if (rt === 10) {
        log("Valid response (expecting SEXP)");
        res = parse_SEXP(data, offset);
        log("Response value: " + res);
        callback(res);
    } else {
        log("Invalid response (expecting SEXP)");
        callback(false);
    }
}

function dataHandler(data, callback) {
    var n = data.length, rs = data.toString("ascii", 0, 4), rv, cap;

    log("Received data from Rserve");

    isReadyToSendCommands = true; // whatever packet to exit from waiting loop

    if (rs === "Rsrv" && n === 32) { // protocol packet
        if (n === 32) {
            log("Valid header");

            rv = data.toString("ascii", 4, 8);
            if (rv !== "0103") {
                log("Unsupported protocol version " + rv);
            } else {
                log("Supported protocol version 0103");

                cap = data.toString("ascii", 16, 32);
                log("Supported capabilities " + cap);

                CAPABILITIES.AUTH = false;
                CAPABILITIES.CRYPT = false;
                if (cap.search("ARpt") !== -1) {
                    log("Authentication required and not crypted");
                    CAPABILITIES.AUTH = true;
                }
                if (cap.search("ARuc") !== -1) {
                    log("Authentication required and crypted");
                    CAPABILITIES.AUTH = true;
                    CAPABILITIES.CRYPT = true;
                }
            }
        }
    } else if (rs === "Rsrv" && n > 32) { // packet with header
        parsePacket(data, 32 + 4, callback);
    } else if (n === 16 && int8(data, 0) === 1) { // login or header data packet
        if (!isResponseOk(data, 20)) {
            log("Login response or header data packet");
            callback(false);
        }
    } else { // packet without header
        log("Data packet");
        parsePacket(data, 4, callback);
    }


    log(data);
}

function connect(host, port, callback) {
    var client = null;

    host = host || "127.0.0.1";
    port = port || 6311;

    client = net.createConnection(port, host);

    client.on("connect", function () {
        log("Connected to Rserve");
    });

    client.on("data", function (data) {
        dataHandler(data, callback);
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
        isReadyToSendCommands = true; // to exit from waiting loop
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
    log(buf);

    conn.write(buf);

    buf  = null;
}

function evaluate(cmd, options) {
    var opts = options || {},
        callback = opts.callback || function (res) {
            if (res !== false) {
                sys.puts(res);
            } else {
                sys.puts("Rserve call failed");
            }
        },
        host = opts.host || "127.0.0.1",
        port = opts.port || 6311,
        user = opts.user || "anon",
        password = opts.password || "anon",
        conn,
        len,
        auth,
        timer;

    conn = connect(host, port, callback);

    timer = setInterval(function () {
        log("Waiting loop for sending commands");
        if (isReadyToSendCommands) {
            clearInterval(timer);
            if (CAPABILITIES.AUTH) {
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
    }, 10);

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
