"use strict";

function int8(buf, o) {
    o = o || 0;

    return buf[o];
}
exports.int8 = int8;

function int24(buf, o) {
    o = o || 0;

    return buf[o] | buf[o + 1] << 8 | buf[o + 2] << 16;
}
exports.int24 = int24;

function int32(buf, o) {
    o = o || 0;

    return buf[o] | buf[o + 1] << 8 | buf[o + 2] << 16 | buf[o + 3] << 24;
}
exports.int32 = int32;

function mkint32(v, buf, o) {
    buf[o] = v & 0xff;
    buf[o + 1] = (v & 0xff00) >> 8;
    buf[o + 2] = (v & 0xff0000) >> 16;
    buf[o + 3] = (v & 0xff000000) >> 24;
}
exports.mkint32 = mkint32;

function mkint24(v, buf, o) {
    buf[o] = v & 0xff;
    buf[o + 1] = (v & 0xff00) >> 8;
    buf[o + 2] = (v & 0xff0000) >> 16;
}
exports.mkint24 = mkint24;

function flt64(buf, o) {
    o = o || 0;

    return buf.readDoubleLE(o);
}
exports.flt64 = flt64;
