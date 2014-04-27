module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            src: [
                "lib/**/*.js",
                "test/**/*.js"
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

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-vows-runner");

    grunt.registerTask("default", [
        "jshint",
        "vows"
    ]);
};
