module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // insert html partials
    includes: {
      options: {
        includeRegexp: /^(\s*)<!--\s*include\s+"(\S+)"\s*-->\s*$/,
        silent: true
      },
      build: {
        src: 'index.src.html',
        dest: 'index.min.html'
      }
    },

    // concatenate and minify javascript
    uglify: {
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
      html: {
        files: ['index.src.html', 'public/js/src/app/templates/**/*.html'],
        tasks: ['includes']
      },
      js: {
        files: ['public/js/src/**/*.js'],
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
  grunt.loadNpmTasks('grunt-includes');

  // special tasks
  grunt.loadNpmTasks('grunt-contrib-watch');

  // custom tasks
  grunt.registerTask('default', ['includes', 'uglify', 'sass']);
  grunt.registerTask('watcher', ['default', 'watch']);
};
