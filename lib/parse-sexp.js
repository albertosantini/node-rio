"use strict";

var parseUtil = require("./parse-util"),
    trace = require("./trace");

function parseSEXP(buf, offset) {
    var r, i, oi, ra, rl, eoa, len, n, k, v, res = [];

    r = buf;
    i = offset;

    ra = parseUtil.int8(r, i);
    rl = parseUtil.int24(r, i + 1);

    if ((ra & 64) === 64) {
        ra &= ~64;
        rl = parseUtil.int32(r, i + 1);
        i += 4;
    }

    // if (ra > 128) { // Attributes
    //     ra &= ~128;
    //     rl = parseUtil.int24(r, i + 1);
    //     // here parse attribute fragment
    //     i += 4;
    // }

    i += 4;
    offset = i + rl;
    eoa = offset;

    trace.log("Type SEXP " + ra);

    if (ra === 32) { // Integer array
        while (i < eoa) {
            res.push(parseUtil.int32(r, i));
            i += 4;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 33) { // double array
        while (i < eoa) {
            res.push(parseUtil.flt64(r, i));
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
        n = parseUtil.int32(r, i);
        i += 4;
        k = 0;
        while (k < n) {
            v = parseUtil.int8(r, i);
            if (v === 1) {
                res.push(true);
            } else if (v === 0) {
                res.push(false);
            } else {
                res.push(null);
            }
            i += 1;
            k += 1;
        }
        if (res.length === 1) {
            return res[0];
        }
        return res;

    } else if (ra === 37) { // raw vector
        len = parseUtil.int32(r, i);
        i += 4;
        res = r.slice(i, i + len);
        return res;
    }

    trace.log("Type " + ra + " is currently not implemented");

    return res;
}
exports.parseSEXP = parseSEXP;
