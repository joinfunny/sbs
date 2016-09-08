var path = require('path');
/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      basePath: '.',
      srcPath: 'public/'
    },
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      lib: {
        src: [
          'public/node_modules/lodash/index.js',
          'public/js/lib/jquery-amd.js',
          'public/js/lib/EventEmitter.js',
          'public/js/lib/require.js',
          'public/js/lib/base.js'
        ],
        dest: 'public/js/lib.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      lib: {
        src: 'public/js/lib.js',
        dest: 'public/js/lib.js'
      },
    },
    clean: {
      main: {
        src: ['dist']
      },
      compressZip: {
        src: 'bas-release-*.zip'
      },
      compressTgz: {
        src: 'bas-release-*.tar.gz'
      }
    },
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: 'common',
          src: ['**/*'],
          dest: 'dist/common',
          flatten: false,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'models',
          src: ['**/*'],
          dest: 'dist/models',
          flatten: false,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'public',
          src: ['**/*'],
          dest: 'dist/public',
          flatten: false,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'services',
          src: ['**/*'],
          dest: 'dist/services',
          flatten: false,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'routes',
          src: ['**/*'],
          dest: 'dist/routes',
          flatten: false,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'views',
          src: ['**/*'],
          dest: 'dist/views',
          flatten: false,
          filter: 'isFile'
        }, {
          src: 'app.js',
          dest: 'dist/app.js'
        }, {
          src: 'Gruntfile.js',
          dest: 'dist/Gruntfile.js'
        }, {
          src: 'index.js',
          dest: 'dist/index.js'
        }, {
          src: 'package.json',
          dest: 'dist/package.json'
        }, {
          src: 'registRoutes.js',
          dest: 'dist/registRoutes.js'
        }, {
          src: 'registServices.js',
          dest: 'dist/registServices.js'
        }, {
          src: 'serviceHandler.js',
          dest: 'dist/serviceHandler.js'
        }]
      },
      compressZip: {
        files: [{
          src: 'bas-release-*.zip',
          dest: 'zips/'
        }]
      },
      compressTgz: {
        files: [{
          src: 'bas-release-*.tar.gz',
          dest: 'tgzs/'
        }]
      },
      bookImg: {
        files: [{
          src: 'public/mdbook/styles/imgs/apple-touch-icon-precomposed-152.png',
          dest: 'public/doc/gitbook/images/apple-touch-icon-precomposed-152.png'
        }, {
          src: 'public/favicon.ico',
          dest: 'public/doc/gitbook/images/favicon.ico'
        }]
      }
    },
    compress: {
      zip: {
        options: {
          archive: function() {
            return 'bas-release-' + (new Date()).getTime() + '.zip';
          }
        },
        expand: true,
        cwd: 'dist/',
        src: ['**/*'],
        dest: '/'
      },
      tgz: {
        options: {
          archive: function() {
            return 'bas-release-' + (new Date()).getTime() + '.tar.gz';
          }
        },
        mode: 'tgz',
        expand: true,
        cwd: 'dist/',
        src: ['**/*'],
        dest: '/'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      server: [
        '*.js',
        '!config*.js',
        'runtime/**/*.js'
      ]
    },
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    sass: {
      dist: {
        options: {
          //style: 'expanded',
          update: true,
          sourcemap: 'none',
          noCache: true
        },
        //将test1文件夹
        files: [{
          expand: true,
          cwd: '<%= meta.srcPath %>',
          src: ['**/*.scss'],
          //可以将文件路径重新定义
          rename: function(dest, src, config) {
            var newDest = src.split('/');
            /*var scssIndex = newDest.lastIndexOf('scss');
            if (scssIndex > -1) {
              newDest[scssIndex] = 'css';
            }*/
            newDest[0] = 'css';
            var path = config.cwd + newDest.join('/');
            console.log('Retrieving the file \'' + path + '\'...');
            return path;
          },
          ext: '.css'
        }]
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      css_sass: {
        files: [
          '<%= meta.srcPath %>**/*.scss'
        ],
        tasks: ['sass']
      },
      sdk: {
        files: [
          'public/sdk/src/*.js'
        ],
        tasks: ['shell:createSDK']
      },
      jshint: {
        files: ['public/js/**/*.js'],
        tasks: ['jshint:common']
      }
    },
    /*    gitbook: {
          main: {
            output: path.join(__dirname, "public/doc"),
            input: "public/mdbook",
            "language": "zh-hans",
            "generator": "site",
            "title": "RX Stream 文档中心",
            "description": null,
            "extension": null,
            "github": null,
            "githubHost": "https://github.com/",
            "plugins": ["-search", "include-codeblock", "toggle-chapters"],
            "pluginsConfig": {
              "fontSettings": {
                "theme": "sepia",
                "family": "serif",
                "size": 1
              }
            },
            "links": {
              "sidebar": {
                "RX Stream": "http://stream.ruixuesoft.com"
              },
              "sharing": {
                "google": null,
                "facebook": null,
                "twitter": null,
                "weibo": null,
                "all": null
              }
            },
            "styles": {
              "website": "styles/website.css"
            }
          }
        },*/
    shell: {
      createBook: {
        command: [
          'cd public',
          'gitbook build mdbook doc'
        ].join('&&')
      },
      createSDK: {
        command: [
          'cd public/sdk/src',
          'node r.js -o build.js'
        ].join('&&')
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-shell');

  // Default task.
  //grunt.registerTask('default', ['jshint', 'nodeunit', 'concat', 'uglify']);
  grunt.registerTask('default', ['sass']);
  grunt.registerTask('releaseZip', ['clean:main', 'copy:main', 'compress:zip', 'copy:compressZip', 'clean:compressZip']);
  grunt.registerTask('releaseTgz', ['clean:main', 'copy:main', 'compress:tgz', 'copy:compressTgz', 'clean:compressTgz']);
  grunt.registerTask('book', ['shell:createBook', 'copy:bookImg']);
  grunt.registerTask('sdk', ['shell:createSDK']);
  grunt.registerTask('buildLib', ['concat:lib']);
};