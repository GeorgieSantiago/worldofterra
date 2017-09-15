module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        watch: {
            scripts: {
              files: ['src/js/*'],
              tasks: ['js'],
              options: {
                spawn: false,
              },
            },
          },
        babel: {
            options: {
                "sourceMap": true
            },
            dist: {
                files: [{
                    "expand": true,
                    "cwd": "src/js",
                    "src": ["**/*.js"],
                    "dest": "src/js-compiled/",
                    "ext": "-compiled.js"
                }]
            }
        },
        uglify: {
            all_src : {
                options : {
                  sourceMap : true,
                  sourceMapName : 'dist/js/sourceMap.map'
                },
                src : ['src/js-compiled/**/*-compiled.js'],
                dest : 'dist/js/main.min.js'
            }
        },
        clean: { // this is causing permissions issues on my computer
            js: ['src/js-compiled/', 'dist/js']
          }
    });

    grunt.registerTask("default", "dev");
    grunt.registerTask("build", ["js"]);
    grunt.registerTask("dev", ["js", "watch"]);
    grunt.registerTask("js", ["babel", "uglify"]);
};