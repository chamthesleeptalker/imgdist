module.exports = function(grunt) {

  //plugins
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  //tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          port: 3000,
          hostname: '0.0.0.0'
        }
      }
    },

    uglify:{
      build:{
        src:'public/javascripts/main.js',
        dest:'public/javascripts/main.min.js'
      }
    },

    less:{
      development: {
        options: {
            paths: ["public/stylesheets"],
            sourceMap:true,
            sourceMapFilename: "public/stylesheets/style.css.map",
            sourceMapURL: "style.css.map",
            sourceMapBasepath: "public/stylesheets",
                outputSourceFiles: true
          },
          files: {
            "public/stylesheets/style.css": "public/stylesheets/less/style.less"
          },
      }
    },

    // watch: {
    //     css: {
    //         files: ['assets/static/css/less/*.less'],
    //         tasks: ['less'],
    //     },
    //     configFiles: {
    //       files: [ 'Gruntfile.js' ],
    //     },
    //     src: {
    //       files: ['*.html','assets/static/js/*.js','assets/static/css/*.map'],
    //     },
    //     options:{
    //       livereload: true,
    //     }
    // }

  });
  grunt.registerTask('server', 'Start a custom web server', function() {
    grunt.log.writeln('Started web server on port 3000');
    require('./app.js').listen(3000);
  });

  //runner
  // grunt.registerTask('default', ['uglify','less','wiredep','connect','watch']);
  // grunt.registerTask('default', ['uglify','less','connect']);
  grunt.registerTask('default', ['uglify', 'less', 'connect'])
}