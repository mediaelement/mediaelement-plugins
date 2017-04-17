'use strict';

/**
 * Chrome Cast Plugin
 * @see https://developers.google.com/cast/docs/developers
 */

// Translations (English required)
mejs.i18n.en["mejs.chromecast-title"] = "Chromecast";
mejs.i18n.en["mejs.chromecast-subtitle"] = "Chromecast Subtitle";

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * Chromecast App ID
	 * @type {String}
	 */
	castAppID: '4F8B3483',

	/**
	 * Chromecast type of policy
	 * `origin`: Auto connect from same appId and page origin (default)
	 * `tab`: Auto connect from same appId, page origin, and tab
	 * `page`: No auto connect
	 *
	 * @type {String}
	 */
	policy: 'origin',

	/**
	 * Title display
	 * @type {String}
	 */
	castTitle: null,

	/**
	 * Synopsis display
	 * @type {String}
	 */
	castSubtitle: null

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
	buildchromecast (player, controls, layers, media)  {

		const
			t = this,
			button = document.createElement('div'),
			castTitle = mejs.Utils.isString(t.options.castTitle) ? t.options.castTitle : mejs.i18n.t('mejs.chromecast-title')
			//castSubtitle = mejs.Utils.isString(t.options.castSubtitle) ? t.options.castSubtitle : mejs.i18n.t('mejs.chromecast-subtitle'),
		;

		if (!t.isVideo) {
			return;
		}

		let loaded = false;

		button.className = `${t.options.classPrefix}button ${t.options.classPrefix}chromecast-button`;
		button.innerHTML = `<button type="button" is="google-cast-button" aria-controls="${t.id}" title="${castTitle}" aria-label="${castTitle}" tabindex="0"></button>`;
		button.addEventListener('click', function () {
			if (mejs.Utils.hasClass(button, t.options.classPrefix + "chromecast-connected")) {
				mejs.Utils.removeClass(button, t.options.classPrefix + "chromecast-connected");
			} else {
				mejs.Utils.addClass(button, t.options.classPrefix + "chromecast-connecting");

				setTimeout(function () {
					mejs.Utils.removeClass(button, t.options.classPrefix + "chromecast-connecting");
					mejs.Utils.addClass(button, t.options.classPrefix + "chromecast-connected");
				}, 2000);
			}
		});

		t.addControlElement(button, 'chromecast');
		t.castButton = button;

		// Load Cast sender library
		if (!loaded) {

			// Start SDK
			window.__onGCastApiAvailable = (isAvailable) => {
				if (isAvailable) {
					t.initializeCastApi();
				}
			};

			const
				script = document.createElement('script'),
				firstScriptTag = document.getElementsByTagName('script')[0]
			;

			let done = false;

			script.src = '//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';

			// Attach handlers for all browsers
			script.onload = script.onreadystatechange = function () {
				if (!done && (!this.readyState || this.readyState === undefined ||
					this.readyState === 'loaded' || this.readyState === 'complete')) {
					done = true;
					script.onload = script.onreadystatechange = null;
				}
			};

			firstScriptTag.parentNode.appendChild(script);
			loaded = true;
		}
	},

	initializeCastApi() {
		const t = this;

		let origin;

		switch (t.options.policy) {
			case 'tab':
				origin = 'TAB_AND_ORIGIN_SCOPED';
				break;
			case 'page':
				origin = 'PAGE_SCOPED';
				break;
			default:
				origin = 'ORIGIN_SCOPED';
				break;
		}


		cast.framework.CastContext.getInstance().setOptions({
			receiverApplicationId: t.options.castAppID,
			autoJoinPolicy: chrome.cast.AutoJoinPolicy[origin]
		});

		t.castPlayer = new cast.framework.RemotePlayer();
		t.castPlayerController = new cast.framework.RemotePlayerController(t.castPlayer);
		t.castPlayerController.addEventListener(
			cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
			t.loadPlayer
		);
	},

	loadPlayer () {
		const t = this;

		if (!t.media.paused) {
			t.media.pause();
		}

		if (cast && cast.framework) {
			if (t.castPlayer.isConnected) {
				t.setupPlayer();
			}
		} else {
			t.castButton.style.display = 'none';
		}
	},

	setupPlayer() {

		const
			t = this,
			url = t.media.getSrc(),
			castSession = cast.framework.CastContext.getInstance().getCurrentSession(),
			mediaInfo = new chrome.cast.media.MediaInfo(url, mejs.Utils.getTypeFromFile(url)),
			request = new chrome.cast.media.LoadRequest(mediaInfo)
		;

		// Add event listeners for player changes which may occur outside sender app
		t.castPlayerController.addEventListener(cast.framework.castPlayerEventType.IS_PAUSED_CHANGED, () => {
			if (t.castPlayer.isPaused) {
				t.media.pause();
			} else {
				t.media.play();
			}
		});

		t.castPlayerController.addEventListener(cast.framework.castPlayerEventType.IS_MUTED_CHANGED, () => {
			t.media.setMute(t.castPlayer.isMuted);
		});

		t.castPlayerController.addEventListener(cast.framework.castPlayerEventType.VOLUME_LEVEL_CHANGED, () => {
		});

		mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
		mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;

		t.media.addEventListener('loadeddata', () => {

			castSession.loadMedia(request).then(() => {
				console.log('Load succeed');
			}, (errorCode) => {

				const description = errorCode.description ? ` : ${errorCode.description}` : '.';

				let message;

				switch (errorCode.code) {
					case chrome.cast.ErrorCode.API_NOT_INITIALIZED:
						message = `The API is not initialized${description}`;
						break;
					case chrome.cast.ErrorCode.CANCEL:
						message = `The operation was canceled by the user${description}`;
						break;
					case chrome.cast.ErrorCode.CHANNEL_ERROR:
						message = `A channel to the receiver is not available${description}`;
						break;
					case chrome.cast.ErrorCode.EXTENSION_MISSING:
						message = `The Cast extension is not available${description}`;
						break;
					case chrome.cast.ErrorCode.INVALID_PARAMETER:
						message = `The parameters to the operation were not valid${description}`;
						break;
					case chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE:
						message = `No receiver was compatible with the session request${description}`;
						break;
					case chrome.cast.ErrorCode.SESSION_ERROR:
						message = `A session could not be created, or a session was invalid${description}`;
						break;
					case chrome.cast.ErrorCode.TIMEOUT:
						message = `The operation timed out${description}`;
						break;
					default:
						message = `Unknown error: ${errorCode.code}`;
						break;
				}

				console.error(message);
			});
		});

		const events = ['play', 'pause'];

		for (let i = 0, total = events.lenght; i < total; i++) {
			t.media.addEventListener(events[i], () => {
				if (t.castPlayer.isPaused) {
					t.castPlayerController.playOrPause();
				}
			});
		}

		t.media.addEventListener('volumechange', () => {
			t.castPlayer.volumeLevel = t.media.getVolume();
			t.castPlayerController.setVolumeLevel();

			if ((t.media.getVolume && t.media.muted) || !t.media.getVolume()) {
				t.castPlayerController.muteOrUnmute();
			}
		});

		t.media.addEventListener('seeked', () => {
			t.castPlayer.currentTime = t.media.getCurrentTime();
			t.castPlayerController.seek();
		});


	}
});