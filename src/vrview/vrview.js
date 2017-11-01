'use strict';

/**
 * Google VRView renderer
 *
 * It uses Google's VR View and creates an <iframe> that allows the user to see 360 videos
 * @see https://developers.google.com/vr/concepts/vrview-web
 */
const VrAPI = {
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
	prepareSettings: (settings) => {
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
	loadScript: (settings) => {
		if (!VrAPI.isMediaStarted) {

			if (typeof VRView !== 'undefined') {
				VrAPI.createInstance(settings);
			} else {
				const
					script = document.createElement('script'),
					firstScriptTag = document.getElementsByTagName('script')[0]
				;

				let done = false;

				settings.options.path = typeof settings.options.path === 'string' ?
					settings.options.path : 'https://googlevr.github.io/vrview/build/vrview.min.js';

				script.src = settings.options.path;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function() {
					if (!done && (!this.readyState || this.readyState === undefined ||
						this.readyState === 'loaded' || this.readyState === 'complete')) {
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
	mediaReady: () => {
		VrAPI.isLoaded = true;
		VrAPI.isMediaLoaded = true;

		while (VrAPI.creationQueue.length > 0) {
			const settings = VrAPI.creationQueue.pop();
			VrAPI.createInstance(settings);
		}
	},

	/**
	 * Create a new instance of VrView player and trigger a custom event to initialize it
	 *
	 * @param {Object} settings - an object with settings needed to instantiate VR View Player object
	 */
	createInstance: (settings) => {
		const player = new VRView.Player(`#${settings.id}`, settings.options);
		window[`__ready__${settings.id}`](player);
	}
};

const VrRenderer = {
	name: 'vrview',

	options: {
		prefix: 'vrview'
	},

	/**
	 * Determine if a specific element type can be played with this render
	 *
	 * @param {String} type
	 * @return {Boolean}
	 */
	canPlayType: (type) => ~['video/mp4', 'application/x-mpegurl', 'vnd.apple.mpegurl', 'application/dash+xml'].indexOf(type.toLowerCase()),

	/**
	 * Create the player instance and add all native events/methods/properties as possible
	 *
	 * @param {MediaElement} mediaElement Instance of mejs.MediaElement already created
	 * @param {Object} options All the player configuration options passed through constructor
	 * @param {Object[]} mediaFiles List of sources with format: {src: url, type: x/y-z}
	 * @return {Object}
	 */
	create: (mediaElement, options, mediaFiles) => {

		// exposed object
		const
			stack = [],
			vr = {},
			readyState = 4
		;

		let
			vrPlayer = null,
			paused = true,
			volume = 1,
			oldVolume = volume,
			bufferedTime = 0,
			ended = false,
			duration = 0,
			url = ''
		;


		vr.options = options;
		vr.id = mediaElement.id + '_' + options.prefix;
		vr.mediaElement = mediaElement;

		// wrappers for get/set
		const
			props = mejs.html5media.properties,
			assignGettersSetters = (propName) => {

				const capName = propName.substring(0, 1).toUpperCase() + propName.substring(1);

				vr['get' + capName] = () => {
					if (vrPlayer !== null) {
						const value = null;

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
									start: () => {
										return 0;
									},
									end: () => {
										return bufferedTime * duration;
									},
									length: 1
								};
							case 'readyState':
								return readyState;
						}

						return value;
					} else {
						return null;
					}
				};

				vr['set' + capName] = (value) => {

					if (vrPlayer !== null) {

						// do something
						switch (propName) {

							case 'src':
								const url = typeof value === 'string' ? value : value[0].src;
								vrPlayer.setContentInfo({video: url});
								break;

							case 'currentTime':
								vrPlayer.setCurrentTime(value);
								setTimeout(() => {
									const event = mejs.Utils.createEvent('timeupdate', vr);
									mediaElement.dispatchEvent(event);
								}, 50);
								break;

							case 'volume':
								vrPlayer.setVolume(value);
								setTimeout(() => {
									const event = mejs.Utils.createEvent('volumechange', vr);
									mediaElement.dispatchEvent(event);
								}, 50);
								break;
							case 'muted':
								volume = value ? 0 : oldVolume;
								vrPlayer.setVolume(volume);
								setTimeout(() => {
									const event = mejs.Utils.createEvent('volumechange', vr);
									mediaElement.dispatchEvent(event);
								}, 50);
								break;
							case 'readyState':
								const event = mejs.Utils.createEvent('canplay', vr);
								mediaElement.dispatchEvent(event);
								break;
							default:
								console.log(`VRView ${vr.id}`, propName, 'UNSUPPORTED property');
								break;
						}

					} else {
						// store for after "READY" event fires
						stack.push({type: 'set', propName: propName, value: value});
					}
				};

			}
		;
		for (let i = 0, il = props.length; i < il; i++) {
			assignGettersSetters(props[i]);
		}

		// add wrappers for native methods
		const
			methods = mejs.html5media.methods,
			assignMethods = (methodName) => {
				vr[methodName] = () => {

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
						stack.push({type: 'call', methodName: methodName});
					}
				};

			}
		;
		for (let i = 0, il = methods.length; i < il; i++) {
			assignMethods(methods[i]);
		}

		// Create <iframe> markup
		const vrContainer = document.createElement('div');
		vrContainer.setAttribute('id', vr.id);
		vrContainer.style.width = '100%';
		vrContainer.style.height = '100%';

		// Initial method to register all VRView events when initializing <iframe>
		window['__ready__' + vr.id] = (_vrPlayer) => {

			mediaElement.vrPlayer = vrPlayer = _vrPlayer;

			const iframe = vrContainer.querySelector('iframe');
			iframe.style.width = '100%';
			iframe.style.height = '100%';

			// do call stack
			if (stack.length) {
				for (let i = 0, il = stack.length; i < il; i++) {

					const stackItem = stack[i];

					if (stackItem.type === 'set') {
						const
							propName = stackItem.propName,
							capName = `${propName.substring(0, 1).toUpperCase()}${propName.substring(1)}`
						;

						vr[`set${capName}`](stackItem.value);
					} else if (stackItem.type === 'call') {
						vr[stackItem.methodName]();
					}
				}
			}

			vrPlayer.on('ready', () => {

				const events = mejs.html5media.events.concat(['mouseover', 'mouseout']);

				for (let i = 0, il = events.length; i < il; i++) {
					vrPlayer.on(events[i], () => {
						const event = mejs.Utils.createEvent(events[i], vr);
						mediaElement.dispatchEvent(event);
					});
				}
			});
		};

		mediaElement.originalNode.parentNode.insertBefore(vrContainer, mediaElement.originalNode);
		mediaElement.originalNode.style.display = 'none';

		const vrSettings = {
			path: options.vrPath,
			is_stereo: options.vrIsStereo,
			is_autopan_off: options.vrIsAutopanOff,
			is_debug: options.vrDebug,
			default_yaw: options.vrDefaultYaw,
			is_yaw_only: options.vrIsYawOnly,
			loop: options.loop
		};

		if (mediaFiles && mediaFiles.length > 0) {
			for (let i = 0, il = mediaFiles.length; i < il; i++) {
				if (mejs.Renderers.renderers[options.prefix].canPlayType(mediaFiles[i].type)) {
					vrSettings.video = mediaFiles[i].src;
					vrSettings.width = '100%';
					vrSettings.height = '100%';
					break;
				}
			}
		}

		VrAPI.prepareSettings({
			options: vrSettings,
			id: vr.id
		});

		vr.hide = () => {
			vr.pause();
			if (vrPlayer) {
				vrContainer.style.display = 'none';
			}
		};

		vr.setSize = () => {};

		vr.show = () => {
			if (vrPlayer) {
				vrContainer.style.display = '';
			}
		};

		return vr;
	}
};

mejs.Renderers.add(VrRenderer);

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * Path to load Google VRView library
	 * @type {?String}
	 */
	vrPath: null,
	/**
	 * Is media a stereo
	 * @type {Boolean}
	 */
	vrIsStereo: true,
	/**
	 *
	 * @type {Boolean}
	 */
	vrIsAutopanOff: true,
	/**
	 * Debug interaction with VRView
	 * @type {Boolean}
	 */
	vrDebug: false,
	/**
	 *
	 * @type {Number}
	 */
	vrDefaultYaw: 0,
	/**
	 *
	 * @type {Boolean}
	 */
	vrIsYawOnly: false
});

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
	buildvrview (player, controls, layers, media) {

		const t = this;

		// Currently it only accepts MP4, DASH and HLS
		if (!t.isVideo || (t.isVideo && t.media.rendererName !== null &&
			!t.media.rendererName.match(/(native\_(dash|hls)|html5)/))) {
			return;
		}

		const button = document.createElement('div');

		// Ensures that the proper fullscreen mode will be detected initially
		player.detectFullscreenMode();

		button.className = `${t.options.classPrefix}button ${t.options.classPrefix}vrview-button`;
		button.innerHTML = `<button type="button" aria-controls="${t.id}" title="VR" aria-label="VR" tabindex="0"></button>`;
		button.addEventListener('click', () => {
			// toggle fullscreen
			const isFullScreen = (mejs.Features.HAS_TRUE_NATIVE_FULLSCREEN && mejs.Features.IS_FULLSCREEN) || player.isFullScreen;

			if (isFullScreen) {
				player.exitFullScreen();
			} else {
				player.enterFullScreen();
			}
		});

		t.globalBind('keydown', (e) => {
			const key = e.which || e.keyCode || 0;
			if (key === 27 && ((mejs.Features.HAS_TRUE_NATIVE_FULLSCREEN && mejs.Features.IS_FULLSCREEN) || player.isFullScreen)) {
				player.exitFullScreen();
			}
		});

		t.addControlElement(button, 'vrview');

		const
			url = media.getSrc(),
			mediaFiles = [{ src: url, type: mejs.Utils.getTypeFromFile(url) }],
			renderInfo = mejs.Renderers.select(mediaFiles, ['vrview'])
		;

		media.changeRenderer(renderInfo.rendererName, mediaFiles);
	}
});