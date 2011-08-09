/*jslint node:true */

var sys = require("sys"),
    net = require('net'),
    hexy = require('hexy'),
    jspack = require('./jspack.js').jspack;

var CMD_TYPE = {
    LOGIN: 1,
    EVAL: 3
}, CAPABILITIES = {
    AUTH: false,
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
        sys.puts("sorry, long packets are not supported (yet).");
    }

    sys.puts("Type SEXP " + ra);

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
       sys.puts("Type " + ra + " is currently not implemented");
    }

    return false;
}

function parsePacket(data, offset, callback) {
    var res, sc, rr;

    res = int32(data, offset - 20);
    sc = (res >> 24) & 127;
    rr = res & 255;

    if (rr !== 1) {
        sys.puts("Eval failed with error code " + sc);
    }

    if (int8(data, offset - 4) === 10) {
        sys.puts("Valid response (expecting SEXP)");
        res = parse_SEXP(data, offset);
        sys.puts("Response value: " + res);
        callback(res);
    } else {
        sys.puts("Invalid response (expecting SEXP)");
    }
}

function dataHandler(data, callback) {
    var n = data.length,
        rs = data.toString("ascii", 0, 4),
        rv = data.toString("ascii", 4, 8),
        cap = data.toString("ascii", 16, 32);

    sys.puts("Received data from Rserve");

    if (rs === "Rsrv" && n === 32) {
        if (n === 32) {
            sys.puts("Valid header");
            if (rv !== "0103") {
                sys.puts("Unsupported protocol version " + rv);
            } else {
                sys.puts("Supported protocol version 0103");
                sys.puts("Supported capabilities: " + cap);

                if (cap.search("ARpt") !== -1) {
                    sys.puts("Authentication required and not crypted");
                    CAPABILITIES.AUTH = true;
                    CAPABILITIES.CRYPT = false;
                }
                if (cap.search("ARuc") !== -1) {
                    sys.puts("Authentication required and crypted");
                    CAPABILITIES.AUTH = true;
                    CAPABILITIES.CRYPT = true;
                }
            }
        }
    } else if (rs === "Rsrv" && n > 32) { // packet with header
        parsePacket(data, 32 + 20, callback);
    } else if (n === 16) { // packet login
        sys.puts("Login response");
    } else { // packet without header
        parsePacket(data, 20, callback);
    }

    console.log(hexy.hexy(data));
}

function Rserve_connect(host, port, callback) {
    var client = null;

    host = host || "127.0.0.1";
    port = port || 6311;

    client = net.createConnection(port, host);

    client.on("connect", function () {
        sys.puts("Connected to Rserve");
    });

    client.on("data", function (data) {
        dataHandler(data, callback);
    });

    client.on("end", function () {
        sys.puts("Disconnected from Rserve");
    });

    client.on("error", function (e) {
        sys.puts("Rserve exception - " + e);
    });

    return client;
}

function Rserve_close(client) {
    client.end();
}

function mkp_str(cmdType, cmd, buf) {
    var n = cmd.length + 1;

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
}

function sendCommand(conn, cmdType, cmd, len, desc) {
    var pkt = new Buffer(len);

    mkp_str(cmdType, cmd, pkt);
    sys.puts(desc);
    console.log(hexy.hexy(pkt));
    conn.write(pkt);
    pkt = null;
}

function Rserve_eval(cmd, options) {
    var opts = options || {},
        callback = opts.callback || function (res) { sys.puts(res); },
        host = opts.host || "127.0.0.1",
        port = opts.port || 6311,
        user = opts.user || "anon",
        password = opts.password || "anon",
        conn, len, auth;

    conn = Rserve_connect(host, port, callback);

    // if (CAPABILITIES.AUTH) {
        auth = user + "\n" + password;
        len = 20 + (auth.length + 1);
        sendCommand(conn, CMD_TYPE.LOGIN, auth, len, "Login on Rserve");
    // }

    len = 20 + (cmd.length + 1) + (4 - (cmd.length + 1) % 4) % 4;
    sendCommand(conn, CMD_TYPE.EVAL, cmd, len, "Sending command to Rserve");

    Rserve_close(conn);
}
exports.Rserve_eval = Rserve_eval;
