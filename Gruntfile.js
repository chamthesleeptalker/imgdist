module.exports = function(grunt) {

  //plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');


  //tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify:{
      build:{
        src:[
          'static/js/loading.js',
          'static/js/dateselect.js',
          'static/js/filters.js',
          'static/js/pagination.js',
          'static/js/main.js'
        ],
        dest:'static/dist/js/diwata.min.js'
      }
    },

    less:{
      development: {
        options: {
          paths: ["static/css"],
          sourceMap:true,
          sourceMapFilename: "static/css/style.css.map",
          sourceMapURL: "style.css.map",
          sourceMapBasepath: "static/css",
              outputSourceFiles: true
        },
        files: {
          "static/css/style.css": "static/css/less/style.less"
        },
      }
    },

    postcss:{
      options:{
        map:{
          inline:false,
          annotation:'static/css/'
        },
        processors:[
          require('pixrem')(), // add fallbacks for rem units
          require('autoprefixer')({browsers: ['last 2 versions','> 2%','Firefox ESR','Opera 12.1']}), // add vendor prefixes
          require('cssnano')() // minify the result
        ]
      },
      dist:{
        expand:true,
        flatten:true,
        src:'static/css/style.css',
        dest:'static/dist/css/'
      }
    },

    express: {
      dev: {
        'options': {
          'script': 'bin/www'
        }
      }
    },

    watch: {
      css: {
          files: ['static/css/less/*.less'],
          tasks: ['less','postcss']
      },
      configFiles: {
        files: [ 'Gruntfile.js' ],
      },
      scripts: {
        files: ["static/js/*.js"],
        tasks: ['uglify']
      },

      htmlFiles: {
        files: ['views/*.html', 'views/*.jade'],
        options: {
          reload: true
        }
      },

      options:{
        livereload: true,
      }
    }
  });

  //runner
  grunt.registerTask('rebuild', ['uglify', 'less'])
  grunt.registerTask('serve', ['rebuild', 'express', 'watch'])
}