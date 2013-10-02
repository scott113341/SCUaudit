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
          'public/js/src/lib/jquery-2.0.3.min.js',
          'public/js/src/lib/bootstrap-3.0.0.min.js',
          'public/js/src/lib/**/*.js',

          'public/js/src/app/app.js',
          'public/js/src/app/**/*.js'
        ],
        dest: 'public/js/application.min.js'
      }
    },

    // compile scss
    sass: {
      build: {
        files: {
          'public/css/application.min.css': 'public/css/src/application.scss'
        }
      }
    },

    // run tasks when files change
    watch: {
      options: {
        spawn: false
      },
      js: {
        files: ['public/js/src/**/*'],
        tasks: ['uglify']
      },
      css: {
        files: ['public/css/src/**/*'],
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
