module.exports = function(grunt) {
	var root = 'www/';

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			options: {
				sourceMap: true,
				outputStyle: 'compressed',
				precision: 3,
				quiet: true
			},
			dist: {
                files: [
                    {
                        expand: true,
                        cwd: root + 'css/scss/',
                        src: ['*.scss'],
                        dest: root + 'css/',
                        ext: '.css'
                    }
                ]
            }
		},

        execute: {
            target: {
                src: ['server.js']

            }
        },

        watch: {
            scss: {
                files: [root + 'css/scss/**/*.scss'],
                tasks: ['sass']
            }
        },

        concurrent: {
            target: {
                tasks: ['watch:scss', 'execute'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }

	});

	grunt.registerTask('start', ['concurrent']);
	grunt.option('force', true);

};