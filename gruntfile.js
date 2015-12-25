module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		//Read the package.json (optional)
		pkg: grunt.file.readJSON('package.json'),

		// Metadata.
		meta: {
			basePath: '.',
			srcPath: 'assets/sass/',
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
					style: 'expanded',
					sourcemap: 'none',
					noCache: true
				},
				files: [{
					expand: true,
					cwd: '<%= meta.srcPath %>',
					src: ['*.scss'],
					dest: '<%= meta.deployPath %>',
					ext: '.css'
				}]
			}
		},
		watch: {
			scripts: {
				files: [
					'<%= meta.srcPath %>/**/*.scss'
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