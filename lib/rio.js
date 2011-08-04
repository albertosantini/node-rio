/*jslint node:true */

var sys = require("sys"),
    net = require('net'),
    hexy = require('hexy'),
    jspack = require('./jspack.js').jspack;

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

function mkint32(i) {
    var r = String.fromCharCode(i & 255);

    i >>= 8;
    r += String.fromCharCode(i & 255);
    i >>= 8;
    r += String.fromCharCode(i & 255);
    i >>= 8;
    r += String.fromCharCode(i & 255);

    return r;
}

function mkint24(i) {
    var r = String.fromCharCode(i & 255);

    i >>= 8;
    r += String.fromCharCode(i & 255);
    i >>=8;
    r += String.fromCharCode(i & 255);

    return r;
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

    res = int32(data);
    sc = (res >> 24) & 127;
    rr = res & 255;

    if (rr !== 1) {
        sys.puts("Eval failed with error code " + sc);
    }

    if (int8(data, 16) !== 10) {
        sys.puts("Invalid response (expecting SEXP)");
    }
    sys.puts("Valid response (expecting SEXP)");

    res = parse_SEXP(data, offset);
    sys.puts("Response value: " + res);
    callback(res);
}

function dataHandler(data, callback) {
    var n = data.length,
        rs = data.toString("ascii", 0, 4),
        rv = data.toString("ascii", 4, 8);

    sys.puts("Received data from Rserve");

    if (rs === "Rsrv" && n === 32) {
        if (n === 32) {
            sys.puts("Valid header");
            if (rv !== "0103") {
                sys.puts("Unsupported protocol version " + rv);
            } else {
                sys.puts("Supported protocol version 0103");
            }
        }
    } else if (rs === "Rsrv" && n > 32) { // packet with header
        parsePacket(data, 32 + 20, callback);
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

function mkp_str(cmd, str) {
    var n = str.length + 1, res;

    str += String.fromCharCode(0);

    while ((n & 3) !== 0) {
        str += String.fromCharCode(1);
        n += 1;
    }

    res = mkint32(cmd) + mkint32(n + 4) + mkint32(0) + mkint32(0) +
        String.fromCharCode(4) + mkint24(n) + str;

    return res;
}

function Rserve_eval(command, callback, host, port) {
    var rClient, pkt = mkp_str(3, command);

    host = host || "127.0.0.1";
    port = port || 6311;

    rClient = Rserve_connect(host, port, callback);
    sys.puts("Sending command to Rserve: " + command);
    console.log(hexy.hexy(pkt));

    rClient.write(pkt);
    Rserve_close(rClient);
}
exports.Rserve_eval = Rserve_eval;
