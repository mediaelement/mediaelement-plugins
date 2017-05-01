(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * VR renderer
 *
 * It uses Google's VR View and creates an <iframe> that allows the user to see 360 videos
 * @see https://developers.google.com/vr/concepts/vrview-web
 */

var VrAPI = {
	/**
  * @type {Boolean}
  */
	isMediaStarted: false,
	/**
  * @type {Boolean}
  */
	isMediaLoaded: false,
	/**
  * @type {Array}
  */
	creationQueue: [],

	/**
  * Create a queue to prepare the loading of the VR View Player
  * @param {Object} settings - an object with settings needed to load an VR View Player instance
  */
	prepareSettings: function prepareSettings(settings) {
		if (VrAPI.isLoaded) {
			VrAPI.createInstance(settings);
		} else {
			VrAPI.loadScript(settings);
			VrAPI.creationQueue.push(settings);
		}
	},

	/**
  * Load vrview.min.js script on the header of the document
  *
  * @param {Object} settings - an object with settings needed to load an HLS player instance
  */
	loadScript: function loadScript(settings) {
		if (!VrAPI.isMediaStarted) {

			if (typeof VRView !== 'undefined') {
				VrAPI.createInstance(settings);
			} else {
				var script = document.createElement('script'),
				    firstScriptTag = document.getElementsByTagName('script')[0];

				var done = false;

				settings.options.path = typeof settings.options.path === 'string' ? settings.options.path : '//storage.googleapis.com/vrview/2.0/build/vrview.min.js';

				script.src = settings.options.path;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function () {
					if (!done && (!this.readyState || this.readyState === undefined || this.readyState === 'loaded' || this.readyState === 'complete')) {
						done = true;
						VrAPI.mediaReady();
						script.onload = script.onreadystatechange = null;
					}
				};

				firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
			}
			VrAPI.isMediaStarted = true;
		}
	},

	/**
  * Process queue of VR View Player creation
  *
  */
	mediaReady: function mediaReady() {
		VrAPI.isLoaded = true;
		VrAPI.isMediaLoaded = true;

		while (VrAPI.creationQueue.length > 0) {
			var settings = VrAPI.creationQueue.pop();
			VrAPI.createInstance(settings);
		}
	},

	/**
  * Create a new instance of VrView player and trigger a custom event to initialize it
  *
  * @param {Object} settings - an object with settings needed to instantiate VR View Player object
  */
	createInstance: function createInstance(settings) {
		var player = new VRView.Player('#' + settings.id, settings.options);
		window['__ready__' + settings.id](player);
	}
};

var VrRenderer = {
	name: 'vr',

	options: {
		prefix: 'vr',
		/**
   * https://developers.google.com/vr/concepts/vrview-web#vr_view
   */
		vr: {
			path: '//storage.googleapis.com/vrview/2.0/build/vrview.min.js',
			image: '',
			is_stereo: true,
			is_autopan_off: true,
			is_debug: false,
			is_vr_off: false,
			default_yaw: 0,
			is_yaw_only: false
		}
	},

	/**
  * Determine if a specific element type can be played with this render
  *
  * @param {String} type
  * @return {Boolean}
  */
	canPlayType: function canPlayType(type) {
		return ['video/mp4', 'application/x-mpegurl', 'vnd.apple.mpegurl', 'application/dash+xml'].includes(type.toLowerCase());
	},

	/**
  * Create the player instance and add all native events/methods/properties as possible
  *
  * @param {MediaElement} mediaElement Instance of mejs.MediaElement already created
  * @param {Object} options All the player configuration options passed through constructor
  * @param {Object[]} mediaFiles List of sources with format: {src: url, type: x/y-z}
  * @return {Object}
  */
	create: function create(mediaElement, options, mediaFiles) {

		// exposed object
		var stack = [],
		    vr = {};

		var vrPlayer = null,
		    paused = true,
		    volume = 1,
		    oldVolume = volume,
		    bufferedTime = 0,
		    ended = false,
		    duration = 0,
		    url = '';

		vr.options = options;
		vr.id = mediaElement.id + '_' + options.prefix;
		vr.mediaElement = mediaElement;

		// wrappers for get/set
		var props = mejs.html5media.properties,
		    assignGettersSetters = function assignGettersSetters(propName) {

			var capName = propName.substring(0, 1).toUpperCase() + propName.substring(1);

			vr['get' + capName] = function () {
				if (vrPlayer !== null) {
					var value = null;

					switch (propName) {
						case 'currentTime':
							return vrPlayer.getCurrentTime();
						case 'duration':
							return vrPlayer.getDuration();
						case 'volume':
							volume = vrPlayer.getVolume();
							return volume;
						case 'muted':
							return volume === 0;
						case 'paused':
							paused = vrPlayer.isPaused;
							return paused;
						case 'ended':
							return ended;
						case 'src':
							return url;
						case 'buffered':
							return {
								start: function start() {
									return 0;
								},
								end: function end() {
									return bufferedTime * duration;
								},
								length: 1
							};
					}

					return value;
				} else {
					return null;
				}
			};

			vr['set' + capName] = function (value) {

				if (vrPlayer !== null) {

					// do something
					switch (propName) {

						case 'src':
							var _url = typeof value === 'string' ? value : value[0].src;
							vrPlayer.setContentInfo({ video: _url });
							break;

						case 'currentTime':
							vrPlayer.setCurrentTime(value);
							break;

						case 'volume':
							vrPlayer.setVolume(value);
							break;
						case 'muted':
							volume = value ? 0 : oldVolume;
							vrPlayer.setVolume(volume);
							break;
						case 'readyState':
							var event = mejs.Utils.createEvent('canplay', vr);
							mediaElement.dispatchEvent(event);
							break;
						default:
							console.log('VRView ' + vr.id, propName, 'UNSUPPORTED property');
							break;
					}
				} else {
					// store for after "READY" event fires
					stack.push({ type: 'set', propName: propName, value: value });
				}
			};
		};
		for (var i = 0, il = props.length; i < il; i++) {
			assignGettersSetters(props[i]);
		}

		// add wrappers for native methods
		var methods = mejs.html5media.methods,
		    assignMethods = function assignMethods(methodName) {
			vr[methodName] = function () {

				if (vrPlayer !== null) {

					// DO method
					switch (methodName) {
						case 'play':
							return vrPlayer.play();
						case 'pause':
							return vrPlayer.pause();
						case 'load':
							return null;

					}
				} else {
					stack.push({ type: 'call', methodName: methodName });
				}
			};
		};
		for (var _i = 0, _il = methods.length; _i < _il; _i++) {
			assignMethods(methods[_i]);
		}

		// Initial method to register all VRView events when initializing <iframe>
		window['__ready__' + vr.id] = function (_vrPlayer) {

			mediaElement.vrPlayer = vrPlayer = _vrPlayer;

			// do call stack
			if (stack.length) {
				for (var _i2 = 0, _il2 = stack.length; _i2 < _il2; _i2++) {

					var stackItem = stack[_i2];

					if (stackItem.type === 'set') {
						var propName = stackItem.propName,
						    capName = '' + propName.substring(0, 1).toUpperCase() + propName.substring(1);

						vr['set' + capName](stackItem.value);
					} else if (stackItem.type === 'call') {
						vr[stackItem.methodName]();
					}
				}
			}

			vrPlayer.on('ready', function () {

				var events = mejs.html5media.events.concat(['mouseover', 'mouseout']);

				for (var _i3 = 0, _il3 = events.length; _i3 < _il3; _i3++) {
					vrPlayer.addEventListener(events[_i3], function (e) {
						var event = createEvent(e.type, vr);
						mediaElement.dispatchEvent(event);
					});
				}
			});
		};

		var vrContainer = document.createElement('div');

		// Create <iframe> markup
		vrContainer.setAttribute('id', vr.id);
		vrContainer.style.width = '100%';
		vrContainer.style.height = '100%';

		mediaElement.originalNode.parentNode.insertBefore(vrContainer, mediaElement.originalNode);
		mediaElement.originalNode.style.display = 'none';

		if (mediaFiles && mediaFiles.length > 0) {
			for (var _i4 = 0, _il4 = mediaFiles.length; _i4 < _il4; _i4++) {
				if (renderer.renderers[options.prefix].canPlayType(mediaFiles[_i4].type)) {
					options.vr.video = mediaFiles[_i4].src;
					options.vr.width = '100%';
					options.vr.height = '100%';
					break;
				}
			}
		}

		VrAPI.prepareSettings({
			options: options.vr,
			id: vr.id
		});

		vr.hide = function () {
			vr.pause();
			if (vrPlayer) {
				vrContainer.style.display = 'none';
			}
		};

		vr.setSize = function () {};

		vr.show = function () {
			if (vrPlayer) {
				vrContainer.style.display = '';
			}
		};

		return vr;
	}
};

mejs.Renderers.add(VrRenderer);

Object.assign(MediaElementPlayer.prototype, {

	/**
  * Feature constructor.
  *
  * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
  * @param {MediaElementPlayer} player
  * @param {$} controls
  * @param {$} layers
  * @param {HTMLElement} media
  */
	buildvr: function buildvr(player, controls, layers, media) {

		var t = this;

		// Currently it only accepts MP4, DASH and HLS
		if (!t.isVideo || t.isVideo && t.media.rendererName !== null && !t.media.rendererName.match(/(native\_(dash|hls)|html5)/)) {
			return;
		}

		var url = media.getSrc(),
		    mediaFiles = [{ src: url, type: getTypeFromFile(url) }],
		    renderInfo = mejs.Renderers.select(mediaFiles, ['vr']);

		media.changeRenderer(renderInfo.rendererName, mediaFiles);
	}
});

},{}]},{},[1]);
