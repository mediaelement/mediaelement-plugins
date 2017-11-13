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
	grunt.loadNpmTasks('grunt-stylelint');

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

		stylelint: {
			all: ['src/**/*.css']
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
					'dist/chromecast/chromecast.js': ['src/chromecast/chromecast.js', 'src/chromecast/player.js'],
					'dist/context-menu/context-menu.js': 'src/context-menu/context-menu.js',
					'dist/facebook-pixel/facebook-pixel.js': 'src/facebook-pixel/facebook-pixel.js',
					'dist/google-analytics/google-analytics.js': 'src/google-analytics/google-analytics.js',
					'dist/jump-forward/jump-forward.js': 'src/jump-forward/jump-forward.js',
					'dist/loop/loop.js': 'src/loop/loop.js',
					'dist/markers/markers.js': 'src/markers/markers.js',
					'dist/postroll/postroll.js': 'src/postroll/postroll.js',
					'dist/playlist/playlist.js': 'src/playlist/playlist.js',
					'dist/preview/preview.js': 'src/preview/preview.js',
					'dist/quality/quality.js': 'src/quality/quality.js',
					'dist/skip-back/skip-back.js': 'src/skip-back/skip-back.js',
					'dist/source-chooser/source-chooser.js': 'src/source-chooser/source-chooser.js',
					'dist/speed/speed.js': 'src/speed/speed.js',
					'dist/stop/stop.js': 'src/stop/stop.js',
					'dist/vrview/vrview.js': 'src/vrview/vrview.js',
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
			uncompressed: {
				options: {
					processors: [
						// Add vendor prefixes.
						require('autoprefixer')({
							browsers: 'last 5 versions, ie > 10, ios > 7, android > 3'
						})
					]
				},
				files: {
					'dist/ads/ads.css': 'src/ads/ads.css',
					'dist/airplay/airplay.css': 'src/airplay/airplay.css',
					'dist/chromecast/chromecast.css': 'src/chromecast/chromecast.css',
					'dist/context-menu/context-menu.css': 'src/context-menu/context-menu.css',
					'dist/jump-forward/jump-forward.css': 'src/jump-forward/jump-forward.css',
					'dist/loop/loop.css': 'src/loop/loop.css',
					'dist/playlist/playlist.css': 'src/playlist/playlist.css',
					'dist/postroll/postroll.css': 'src/postroll/postroll.css',
					'dist/quality/quality.css': 'src/quality/quality.css',
					'dist/skip-back/skip-back.css': 'src/skip-back/skip-back.css',
					'dist/source-chooser/source-chooser.css': 'src/source-chooser/source-chooser.css',
					'dist/speed/speed.css': 'src/speed/speed.css',
					'dist/stop/stop.css': 'src/stop/stop.css',
					'dist/vrview/vrview.css': 'src/vrview/vrview.css'
				}
			},
			compressed: {
				options: {
					processors: [
						// Add vendor prefixes.
						require('autoprefixer')({
							browsers: 'last 5 versions, ie > 10, ios > 7, android > 3'
						}),
						// Minify the result.
						require('cssnano')()
					]
				},
				files: {
					'dist/ads/ads.min.css': 'dist/ads/ads.css',
					'dist/airplay/airplay.min.css': 'dist/airplay/airplay.css',
					'dist/chromecast/chromecast.min.css': 'dist/chromecast/chromecast.css',
					'dist/context-menu/context-menu.min.css': 'dist/context-menu/context-menu.css',
					'dist/jump-forward/jump-forward.min.css': 'dist/jump-forward/jump-forward.css',
					'dist/loop/loop.min.css': 'dist/loop/loop.css',
					'dist/playlist/playlist.min.css': 'dist/playlist/playlist.css',
					'dist/postroll/postroll.min.css': 'dist/postroll/postroll.css',
					'dist/quality/quality.min.css': 'dist/quality/quality.css',
					'dist/skip-back/skip-back.min.css': 'dist/skip-back/skip-back.css',
					'dist/source-chooser/source-chooser.min.css': 'dist/source-chooser/source-chooser.css',
					'dist/speed/speed.min.css': 'dist/speed/speed.css',
					'dist/stop/stop.min.css': 'dist/stop/stop.css',
					'dist/vrview/vrview.min.css': 'dist/vrview/vrview.css'
				}
			},

		},
		copy: {
			main: {
				files: [
					{
						cwd: 'src',
						expand: true,
						src: ['**/*.png', '**/*.svg', '**/*-i18n.js'],
						dest: 'dist/'
					}
				]
			}
		}
	});

	grunt.registerTask('default', ['eslint', 'stylelint', 'browserify', 'concat', 'removelogging', 'uglify', 'postcss', 'copy']);
	grunt.registerTask('debug', ['eslint', 'stylelint', 'browserify', 'concat', 'uglify', 'postcss', 'copy']);
};
