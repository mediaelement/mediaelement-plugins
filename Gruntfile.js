module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-remove-logging');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		watch: {
			scripts: {
				files: ['src/**/*.js', 'test/core/*.js'],
				tasks: ['eslint', 'browserify', 'concat', 'uglify', 'copy:translation']
			},
			stylesheet: {
				files: ['src/**/*.css', 'src/css/**/*.png', 'src/css/**/*.svg'],
				tasks: ['postcss', 'copy:build']
			}
		},

		eslint: {
			target: [
				'Gruntfile.js',
				'src/**/*.js'
			]
		},
		browserify: {
			dist: {
				files: {
					'dist/ads/ads.js': 'src/ads/ads.js',
					'dist/ads-vast-vpaid/ads-vast-vpaid.js': 'src/ads-vast-vpaid/ads-vast-vpaid.js',
					'dist/airplay/airplay.js': 'src/airplay/airplay.js',
					'dist/chromecast/chromecast.js': 'src/chromecast/chromecast.js',
					'dist/context-menu/context-menu.js': 'src/context-menu/context-menu.js',
					'dist/facebook-pixel/facebook-pixel.js': 'src/facebook-pixel/facebook-pixel.js',
					'dist/google-analytics/google-analytics.js': 'src/google-analytics/google-analytics.js',
					'dist/jump-forward/jump-forward.js': 'src/jump-forward/jump-forward.js',
					'dist/loop/loop.js': 'src/loop/loop.js',
					'dist/markers/markers.js': 'src/markers/markers.js',
					'dist/postroll/postroll.js': 'src/postroll/postroll.js',
					'dist/preview/preview.js': 'src/preview/preview.js',
					'dist/quality/quality.js': 'src/quality/quality.js',
					'dist/skip-back/skip-back.js': 'src/skip-back/skip-back.js',
					'dist/source-chooser/source-chooser.js': 'src/source-chooser/source-chooser.js',
					'dist/speed/speed.js': 'src/speed/speed.js',
					'dist/stop/stop.js': 'src/stop/stop.js'
				},
				options: {
					plugin: [
						'browserify-derequire', 'bundle-collapser/plugin'
					]
				}
			}
		},
		concat: {
			dist: {
				options: {
					banner: grunt.file.read('src/header.js')
				},
				expand: true,
				src: ['dist/**/*.js', '!dist/**/*-i18n.js', '!dist/**/*.min.js'],
				ext: '.js'
			}
		},
		removelogging: {
			dist: {
				src: ['build/**/*.js', '!build/lang/*.js', '!build/jquery.js', '!build/**/*.min.js'],
			},
			options: {
				// Keep `warn` and other methods from the console API
				methods: ['log']
			}
		},
		uglify: {
			build: {
				files: [{
					expand: true,
					src: ['dist/**/*.js', '!dist/**/*-i18n.js', '!dist/**/*.min.js'],
					ext: '.min.js'
				}]
			},
			options: {
				output: {comments: false},
				banner: grunt.file.read('src/header.js')
			}
		},
		postcss: {
			options: {
				processors: [
					// Add vendor prefixes.
					require('autoprefixer')({browsers: 'last 5 versions, ie > 8, ios > 7, android > 3'}),
					// Minify the result.
					require('cssnano')()
				]
			},
			files: {
				'dist/airplay/airplay.min.css': 'src/airplay/airplay.css',
				'dist/chromecast/chromecast.min.css': 'src/chromecast/chromecast.css',
				'dist/jump-forward/jump-forward.min.css': 'src/jump-forward/jump-forward.css',
				'dist/loop/loop.min.css': 'src/loop/loop.css',
				'dist/skip-back/skip-back.min.css': 'src/skip-back/skip-back.css',
				'dist/source-chooser/source-chooser.min.css': 'src/source-chooser/source-chooser.css',
				'dist/stop/stop.min.css': 'src/stop/stop.css'
			}
		},
		copy: {
			main: {
				files: [
					{
						cwd: 'src',
						expand: true,
						src: ['**/*.png', '**/*.svg', '**/*.css', '**/*-i18n.js'],
						dest: 'dist/'
					}
				]
			}
		}
	});

	grunt.registerTask('default', ['eslint', 'browserify', 'concat', 'removelogging', 'uglify', 'postcss', 'copy']);
	grunt.registerTask('debug', ['eslint', 'browserify', 'concat', 'uglify', 'postcss', 'copy']);
};
