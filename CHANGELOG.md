2.4.1 / 2016-03-31
==================

* Added matrix example using JSON serialization.
* Added check params test.
* Updated deps.

2.4.0 / 2015-12-30
==================

* Added chaining support.
* Changed from vows tests to tape ones.

2.3.0 / 2015-12-27
==================

* Added evaluate defer API: $e.

2.2.0 / 2015-12-07
==================

* Added support for crypted authentication.

2.1.0 / 2015-11-23
==================

* Added support for large packet.

2.0.1 / 2015-11-22
==================

*  Fixed getting started examples in README.

2.0.0 / 2015-11-22
==================

* Interface changes and implementation refactoring, no new features.

1.4.0 / 2014-11-26
==================

* Added option to call functions already loaded in R session.
* Used eslint (vs. jshint).

1.3.2 / 2014-11-14
==================

* Added support for integer and integer array.
* Added info to record a Rserve session for the tests.
* Updated hexy 0.2.7, vows 0.8.0.

1.3.1 / 2014-09-08
==================

* Fixed #16 - End-of-message padding seems wrong at least on Mac OS X.

1.3.0 / 2014-04-27
==================

* Fixed #13 - Error strings/network errors propagation.

1.2.1 / 2014-04-10
==================

* Fix #12 - SIGPIPE signal on remote Rserve.

1.2.0 / 2013-11-12
==================

* Added bufferAndEval.
* Added login tests.

1.1.0 / 2013-11-06
==================

* Added boolean support.
* Added eval response and data type check.
* Added eval errors tests.

1.0.0 / 2013-10-27
==================

* After a few cosmetic updates, `rio` is ready for 1.0.0.

0.10.0 / 2013-08-18
===================

* Added transfer file support.
* Fixed callback err value if sexp type is not implemented.
* Added contributing doc.
* Added npm stats, dependencies and version badges.

0.9.0 / 2013-06-18
==================

* Added Rserve connection on socket as well as tcp/ip port.
* Added shutdown command.

0.8.1 / 2013-05-23
==================

* Fixed utf8 support in the response.
* Added keepalive for long running processes.

0.8.0 / 2013-04-23
==================

* Added utf8 support.

0.7.0 / 2013-03-13
==================

* Added tests without needing Rserve.
* Added the err argument in the callback.

0.6.2 / 2013-03-08
==================

* Removed jspack dependency.

0.6.1 / 2012-06-25
==================

* Fixed History doc for unintentional deletion.
* Changed sys to util require for compatibility with 0.6.x and higher.

0.6.0 / 2011-11-20
==================

* Refactored the data handler using node-binary.

0.5.6 / 2011-11-17
==================

* Fixed the copy in splitted packet.

0.5.5 / 2011-11-17
==================

* Fixed mangling a byte in the splitted packet.
* 0.5.4 tag was 0.5.3 one.

0.5.3 / 2011-11-17
==================

* Fixed data packet splitted.

0.5.2 / 2011-11-15
==================

* Fixed data packet with length 16 bytes.

0.5.1 / 2011-09-26
==================

* Fixed a bug in sending commands loop.

0.5.0 / 2011-09-25
==================

* Fixed bugs for testing with unix Rserve instance.

0.4.0 / 2011-09-15
==================

* Added enableDebug sourceAndEval methods.
* Fixed bugs.

0.3.1 / 2011-08-11
==================

* Fixed a typo in the README.

0.3.0 / 2011-08-10
==================

* Implemented plaintext authentication.

0.2.0 / 2011-08-08
==================

* Fixed an issue with the length of the packet because string and buffer were
mixed.

0.1.0 / 2011-08-04
==================

* Initial release.
