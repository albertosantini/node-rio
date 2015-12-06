"use strict";

var fs = require("fs"),
    net = require("net"),
    binary = require("binary"),
    config = require("./config"),
    trace = require("./trace"),
    parseSEXP = require("./parse-sexp"),
    parseUtil = require("./parse-util"),
    crypt = require("./crypt");

function connect(netOpts, callback, isRecordMode) {
    var client = null, recordStream;

    client = net.createConnection(netOpts);

    client.on("connect", function () {
        trace.log("Connected to Rserve");

        client.setKeepAlive(true);
    });

    client.on("end", function () {
        trace.log("Disconnected from Rserve");

        if (isRecordMode) {
            recordStream.end();
        }
        callback();
    });

    client.on("close", function (hadError) {
        trace.log("Closed from Rserve");

        if (hadError) {
            callback(true);
        }
    });

    client.on("error", function (e) {
        trace.log("Rserve exception - " + e);
        callback(e);
    });

    if (isRecordMode) {
        recordStream = fs.createWriteStream(config.dumpFile, {
            flags: "a"
        });
        client.pipe(recordStream);
    }

    return client;
}

function close(client) {
    if (!config.playbackMode) {
        client.end();
    }
}

function sendCommand(conn, cmdType, cmd, len, desc) {
    var n = Buffer.byteLength(cmd) + 1,
        buf;

    cmd += String.fromCharCode(0);
    if (cmdType !== config.CMD_TYPE.LOGIN) {
        while ((n & 3) !== 0) {
            cmd += String.fromCharCode(1);
            n += 1;
        }
    }

    if (cmdType !== config.CMD_TYPE.LOGIN) {
        while ((n & 15) !== 0) {
            cmd += String.fromCharCode(1);
            n += 1;
            len += 1;
        }
    }

    buf = new Buffer(len);

    parseUtil.mkint32(cmdType, buf, 0);
    parseUtil.mkint32(n + 4, buf, 4);
    parseUtil.mkint32(0, buf, 8);
    parseUtil.mkint32(0, buf, 12);
    buf[16] = 4;
    parseUtil.mkint24(n, buf, 17);
    buf.write(cmd, 20);

    trace.log(desc);
    if (cmdType !== config.CMD_TYPE.LOGIN) {
        trace.log(buf);
    }

    conn.write(buf);

    buf = null;
}

function sendAction(cmd, type, msg, options) {
    var opts = options || {},
        netOpts = {},
        cb = opts.callback || function (err, res) {
            if (!err) {
                console.log(res);
            } else {
                console.log("Rserve call failed. " + err);
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

    if (config.playbackMode) {
        conn = fs.readFileSync(config.dumpFile);
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
        conn = connect(netOpts, callback, config.recordMode);
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
                trace.log(errorString);
                callback(errorString);
                close(conn);

            } else {
                trace.log("Supported capabilities " + cap);

                config.CAPABILITIES.PLAIN = false;
                config.CAPABILITIES.CRYPT = false;
                if (cap.search("ARpt") !== -1) {
                    config.CAPABILITIES.PLAIN = true;
                    trace.log("Authentication required and not crypted");
                } else if (cap.search("ARuc") !== -1) {
                    config.CAPABILITIES.CRYPT = true;
                    password = crypt(password,
                        cap.substr(cap.search("K") + 1, 3));
                    trace.log("Authentication required and crypted: " +
                        password);
                }

                if (config.CAPABILITIES.PLAIN || config.CAPABILITIES.CRYPT ) {
                    this.buffer("loginResponse", 16)
                        .tap(function (login) {
                            var res, sc, rr;

                            trace.log("Login response");
                            trace.log(login.loginResponse);

                            res = parseUtil.int32(login.loginResponse);
                            sc = (res >> 24) & 127;
                            rr = res & 255;

                            if (rr !== 1) {
                                errorString = "Response with error code " + sc;
                                trace.log(errorString);
                                callback(errorString);
                                close(conn);
                            }
                        });

                    auth = user + "\n" + password;
                    len = 20 + (auth.length + 1);
                    if (!config.playbackMode) {
                        sendCommand(conn, config.CMD_TYPE.LOGIN, auth, len,
                            "Login on Rserve");
                    }
                }

                len = Buffer.byteLength(cmd);
                len = 20 + (len + 1) + (4 - (len + 1) % 4) % 4;
                if (!config.playbackMode) {
                    sendCommand(conn, type, cmd, len, msg);
                }

            }
        })
        .buffer("dataHeader", 16)
        .tap(function (vars) {
            var cmdResponse = parseUtil.int32(vars.dataHeader);

            trace.log("Data Header");
            trace.log(vars.dataHeader);

            if ((cmdResponse & 255) !== 1) {
                errorString = "Eval failed with error code " +
                    ((cmdResponse >> 24) & 127);
                trace.log(errorString);
                callback(errorString);

                close(conn);
            }
        })
        .buffer("dataPacketType", 1)
        .tap(function (vars) {
            var responseType = parseUtil.int8(vars.dataPacketType),
                lenHeaderDataPacket,
                isLarge = false;

            lenHeaderDataPacket = 3;

            if ((responseType & 64) === 64) {
                isLarge = true;
                lenHeaderDataPacket = 7;
                responseType &= ~64;
            }

            if (responseType !== 10) {
                errorString = "Invalid response (expecting SEXP)";
                trace.log(errorString);
                callback(errorString);
                close(conn);
            }

            this.buffer("lenDataPacket", lenHeaderDataPacket)
                .tap(function (header) {
                    var rl;

                    if (isLarge) {
                        rl = parseUtil.int32(header.lenDataPacket);
                    } else {
                        rl = parseUtil.int24(header.lenDataPacket);
                    }

                    this.buffer("dataPacket", rl)
                        .tap(function (data) {
                            var res;

                            trace.log("Data packet");
                            trace.log(data.dataPacket);

                            res = parseSEXP.parseSEXP(data.dataPacket, 0);

                            if (res.length === 0) {
                                callback(true);
                            } else {
                                trace.log("Response value: " + res);
                                callback(false, res);
                            }
                            close(conn);
                        });
                });
        });
}
exports.sendAction = sendAction;
