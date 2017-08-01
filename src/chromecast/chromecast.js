'use strict';

import ChromecastPlayer from './player';

/**
 * Chromecast plugin
 *
 * Uses version 3.0 to take advantage of Google Cast Framework, and creates a button to turn on/off Chromecast streaming
 * @see https://developers.google.com/cast/docs/developers
 */

// Translations (English required)
mejs.i18n.en['mejs.chromecast-legend'] = 'Casting to:';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * Title display
	 * @type {String}
	 */
	castTitle: null,

	/**
	 * Chromecast App ID
	 * @type {String}
	 */
	castAppID: null,

	/**
	 * Chromecast type of policy
	 * `origin`: Auto connect from same appId and page origin (default)
	 * `tab`: Auto connect from same appId, page origin, and tab
	 * `page`: No auto connect
	 *
	 * @type {String}
	 */
	castPolicy: 'origin',

	/**
	 * Whether to load tracks or not through Chromecast
	 *
	 * In order to process tracks correctly, `tracks` feature must be enable on the player configuration
	 * and user MUST set a custom receiver application.
	 * @see https://github.com/googlecast/CastReferencePlayer
	 * @see https://developers.google.com/cast/docs/receiver_apps
	 * @type {Boolean}
	 */
	castEnableTracks: false,

	castIsLive: false,

});

Object.assign(MediaElementPlayer.prototype, {

	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 * @param {HTMLElement} media
	 */
	buildchromecast (player, controls, layers, media)  {

		const
			t = this,
			button = document.createElement('div'),
			castTitle = mejs.Utils.isString(t.options.castTitle) ? t.options.castTitle : 'Chromecast'
		;

		player.chromecastLayer = document.createElement('div');
		player.chromecastLayer.className = `${t.options.classPrefix}chromecast-layer ${t.options.classPrefix}layer`;
		player.chromecastLayer.innerHTML = `<div class="${t.options.classPrefix}chromecast-info"></div>`;
		player.chromecastLayer.style.display = 'none';

		layers.insertBefore(player.chromecastLayer, layers.firstChild);

		button.className = `${t.options.classPrefix}button ${t.options.classPrefix}chromecast-button`;
		button.innerHTML = `<button type="button" is="google-cast-button" aria-controls="${t.id}" title="${castTitle}" aria-label="${castTitle}" tabindex="0"></button>`;
		button.style.display = 'none';

		t.addControlElement(button, 'chromecast');
		t.castButton = button;

		// Activate poster layer
		player.chromecastLayer.innerHTML = `<div class="${t.options.classPrefix}chromecast-container">` +
			`<span class="${t.options.classPrefix}chromecast-icon"></span>` +
			`<span class="${t.options.classPrefix}chromecast-info">${mejs.i18n.t('mejs.chromecast-legend')} <span class="device"></span></span>` +
			`</div>`;

		if (media.originalNode.getAttribute('poster')) {
			player.chromecastLayer.innerHTML += `<img src="${media.originalNode.getAttribute('poster')}" width="100%" height="100%">`;
			player.chromecastLayer.querySelector('img').addEventListener('click', () => {
				if (player.options.clickToPlayPause) {
					const
						button = t.container.querySelector('.' + t.options.classPrefix + 'overlay-button'),
						pressed = button.getAttribute('aria-pressed')
					;

					if (player.paused) {
						player.play();
					} else {
						player.pause();
					}

					button.setAttribute('aria-pressed', !!pressed);
					player.container.focus();
				}
			});
		}

		// Start SDK
		window.__onGCastApiAvailable = (isAvailable) => {
			const
				mediaType = mejs.Utils.getTypeFromFile(media.originalNode.src).toLowerCase(),
				canPlay = mediaType &&
					['application/x-mpegurl', 'application/vnd.apple.mpegurl', 'application/dash+xml', 'video/mp4', 'audio/mp3', 'audio/mp4'].indexOf(mediaType) > -1
			;

			if (isAvailable && canPlay) {
				t._initializeCastPlayer();
			}
		};

		// Load once per page request
		if (window.cast) {
			const button = t.controls.querySelector('.' + t.options.classPrefix + 'chromecast-button>button');
			if (button && button.style.display !== 'none') {
				t.controls.querySelector('.' + t.options.classPrefix + 'chromecast-button').style.display = '';
			}
			t._initializeCastPlayer();
			return;
		}
		mejs.Utils.loadScript('https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1');
	},

	cleanchromecast (player) {
		if (window.cast) {
			const session = cast.framework.CastContext.getInstance().getCurrentSession();
			if (session) {
				session.endSession(true);
			}
		}

		if (player.castButton) {
			player.castButton.remove();
		}

		if (player.chromecastLayer) {
			player.chromecastLayer.remove();
		}
	},

	/**
	 *
	 * @private
	 */
	_initializeCastPlayer () {
		const t = this;

		let origin;

		switch (this.options.castPolicy) {
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

		const
			context = cast.framework.CastContext.getInstance(),
			session = context.getCurrentSession()
		;
		context.setOptions({
			receiverApplicationId: t.options.castAppID || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
			autoJoinPolicy: chrome.cast.AutoJoinPolicy[origin]
		});
		context.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, t._checkCastButtonStatus.bind(t));

		t.remotePlayer = new cast.framework.RemotePlayer();
		t.remotePlayerController = new cast.framework.RemotePlayerController(t.remotePlayer);
		t.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, t._switchToCastPlayer.bind(this));

		if (session) {
			const
				state = context.getCastState(),
				button = t.controls.querySelector(`.${t.options.classPrefix}chromecast-button`)
			;

			if (button && state === cast.framework.CastState.NO_DEVICES_AVAILABLE) {
				button.style.display = 'none';
			} else if (button) {
				if (t.chromecastLayer) {
					t.chromecastLayer.style.display = state === cast.framework.CastState.CONNECTED ? '' : 'none';
				}
				button.style.display = '';
			}
			t._switchToCastPlayer();
		}
	},

	/**
	 *
	 * @param e
	 * @private
	 */
	_checkCastButtonStatus (e) {
		const
			t = this,
			button = t.controls.querySelector(`.${t.options.classPrefix}chromecast-button`)
		;

		if (button && e.castState === cast.framework.CastState.NO_DEVICES_AVAILABLE) {
			button.style.display = 'none';
		} else if (button) {
			if (t.chromecastLayer) {
				t.chromecastLayer.style.display = e.castState === cast.framework.CastState.CONNECTED ? '' : 'none';
			}
			button.style.display = '';
		}

		setTimeout(() => {
			t.setPlayerSize(t.width, t.height);
			t.setControlsSize();
		}, 0);
	},

	/**
	 *
	 * @private
	 */
	_switchToCastPlayer () {
		const t = this;

		if (t.proxy) {
			t.proxy.pause();
		}
		if (cast && cast.framework) {
			const context = cast.framework.CastContext.getInstance();
			context.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, t._checkCastButtonStatus.bind(t));
			if (t.remotePlayer.isConnected) {
				t._setupCastPlayer();
				return;
			}
		}
		t._setDefaultPlayer();
	},
	/**
	 *
	 * @private
	 */
	_setupCastPlayer () {
		const
			t = this,
			context = cast.framework.CastContext.getInstance(),
			castSession = context.getCurrentSession(),
			deviceInfo = t.layers.querySelector(`.${t.options.classPrefix}chromecast-info`)
		;

		if (t.loadedChromecast === true) {
			return;
		}

		t.loadedChromecast = true;

		t.proxy = new ChromecastPlayer(t.remotePlayer, t.remotePlayerController, t.media, t.options);

		if (deviceInfo)
			deviceInfo.querySelector('.device').innerText = castSession.getCastDevice().friendlyName;
		if (t.chromecastLayer) {
			t.chromecastLayer.style.display = '';
		}

		if (t.options.castEnableTracks === true) {
			const captions = t.captionsButton !== undefined ?
				t.captionsButton.querySelectorAll('input[type=radio]') : null;

			if (captions !== null) {
				for (let i = 0, total = captions.length; i < total; i++) {
					captions[i].addEventListener('click', function () {
						const
							trackId = parseInt(captions[i].id.replace(/^.*?track_(\d+)_.*$/, "$1")),
							setTracks = captions[i].value === 'none' ? [] : [trackId],
							tracksInfo = new chrome.cast.media.EditTracksInfoRequest(setTracks)
						;

						castSession.getMediaSession().editTracksInfo(tracksInfo, () => {
						}, (e) => {
							console.error(e);
						});
					});
				}
			}
		}

		// If no Cast was setup correctly, make sure it is
		t.media.addEventListener('loadedmetadata', () => {
			if (['SESSION_ENDING', 'SESSION_ENDED', 'NO_SESSION'].indexOf(castSession.getSessionState()) === -1 &&
				t.proxy instanceof DefaultPlayer) {
				t.proxy.pause();
				t.proxy = new ChromecastPlayer(t.remotePlayer, t.remotePlayerController, t.media, t.options);
			}
		});

		t.media.addEventListener('timeupdate', () => {
			t.currentMediaTime = t.getCurrentTime();
		});
	}
});

