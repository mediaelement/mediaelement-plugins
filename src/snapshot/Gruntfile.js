module.exports = function(grunt) {

	grunt.initConfig({

		/* load package */

		pkg: grunt.file.readJSON('package.json'),

		/**
		 * Add tasks
		 */
		
		watch: {
			js:{
				files: [
					'snapshot.js'
				],
				tasks:['uglify']
			},

			css: {
				files: [
					'snapshot.css'
				],
				tasks:['cssmin']
			}
		},

		/*
		 * compress and mangle the input file using the default options.
		 */
		uglify: {

			js: {
		      files: {
		        'snapshot.min.js': ['snapshot.js']
		      }
		    }

		},


		cssmin: {

        css: {
            src: 'snapshot.css',
            dest: 'snapshot.min.css'
        }

    }

	});


	// Load modules
	 grunt.loadNpmTasks('grunt-contrib-watch');
	 grunt.loadNpmTasks('grunt-contrib-uglify-es');
	 grunt.loadNpmTasks('grunt-css');
  	 

  	 // Register the default tasks.
	grunt.registerTask('default', ['watch']);

};