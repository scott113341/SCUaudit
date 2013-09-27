module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // concatenate and minify javascript
    uglify: {
      options: {
        mangle: false
      },
      build: {
        src: [
          'app/js/src/lib/jquery-2.0.3.min.js',
          'app/js/src/lib/bootstrap-3.0.0.min.js',
          'app/js/src/lib/**/*.js'
        ],
        dest: 'app/js/application.min.js'
      }
    },

    // compile scss
    sass: {
      build: {
        files: {
          'app/css/application.min.css': 'app/css/src/application.scss'
        }
      }
    },

    // run tasks when files change
    watch: {
      options: {
        spawn: false
      },
      js: {
        files: ['app/js/src/**/*'],
        tasks: ['uglify']
      },
      css: {
        files: ['app/css/src/**/*'],
        tasks: ['sass']
      }
    }
  });

  // normal tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');

  // special tasks
  grunt.loadNpmTasks('grunt-contrib-watch');

  // custom tasks
  grunt.registerTask('default', ['uglify', 'sass']);
};
