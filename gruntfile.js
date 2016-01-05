module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		//Read the package.json (optional)
		pkg: grunt.file.readJSON('package.json'),

		// Metadata.
		meta: {
			basePath: '.',
			srcPath: 'assets/scss/',
			deployPath: 'assets/css/'
		},

		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> ',
		uglify: {
			// options: {
			// 	banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
			// 		'<%= grunt.template.today("yyyy-mm-dd") %> */'
			// },
			/*my_target: {
				files: {
					'dest/output.min.js': ['src/input1.js', 'src/input2.js']
				}
			}*/
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/*.js',
				dest: 'dest/build/<%= pkg.name %>.min.js'
			}
		},
		// Task configuration.
		sass: {
			dist: {
				options: {
					//style: 'expanded',
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
						var reg = /\/scss\//i;
						var dest = config.cwd.replace(reg, '/css/');
						console.log(dest + src);
						return dest + src;
					},
					ext: '.css'
				}]
			}
		},
		watch: {
			scripts: {
				files: [
					'./**/*.scss'
				],
				tasks: ['sass']
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task.
	grunt.registerTask('test', ['uglify']);
	grunt.registerTask('default', ['sass']);
};