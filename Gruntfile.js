"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        eslint: {
            src: [
                "Gruntfile.js",
                "index.js",
                "lib/**/*.js",
                "test/**/*-test.js",
                "examples/**/*.js"
            ]
        },

        vows: {
            all: {
                src: "test/*.js",
                options: {
                    reporter: "spec",
                    error: false
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-vows-runner");

    grunt.registerTask("default", [
        "eslint",
        "vows"
    ]);
};
