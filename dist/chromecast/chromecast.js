(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Chrome Cast Plugin
 * It uses the Cast Framework v3.0 to connect to Chromecast devices
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
	castTitle: null

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
	buildchromecast: function buildchromecast(player, controls, layers, media) {

		var t = this,
		    button = document.createElement('div'),
		    castTitle = mejs.Utils.isString(t.options.castTitle) ? t.options.castTitle : mejs.i18n.t('mejs.chromecast-title')
		//castSubtitle = mejs.Utils.isString(t.options.castSubtitle) ? t.options.castSubtitle : mejs.i18n.t('mejs.chromecast-subtitle'),
		;

		if (!t.isVideo) {
			return;
		}

		var initiatedCastFramework = false;

		button.className = t.options.classPrefix + "button " + t.options.classPrefix + "chromecast-button";
		button.innerHTML = "<button type=\"button\" is=\"google-cast-button\" aria-controls=\"" + t.id + "\" title=\"" + castTitle + "\" aria-label=\"" + castTitle + "\" tabindex=\"0\"></button>";

		t.addControlElement(button, 'chromecast');
		t.castButton = button;

		// Load Cast sender library
		if (!initiatedCastFramework) {

			// Start SDK
			window.__onGCastApiAvailable = function (isAvailable) {
				if (isAvailable) {
					t.initializeCastApi();
				}
			};

			var script = document.createElement('script');
			script.src = '//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
			document.head.appendChild(script);
			initiatedCastFramework = true;
		}
	},
	initializeCastApi: function initializeCastApi() {
		var t = this;

		var origin = void 0;

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
		t.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, t.loadPlayer.bind(t));
	},
	loadPlayer: function loadPlayer() {
		var t = this;

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
	setupPlayer: function setupPlayer() {

		var t = this,
		    url = t.media.getSrc(),
		    castSession = cast.framework.CastContext.getInstance().getCurrentSession(),
		    mediaInfo = new chrome.cast.media.MediaInfo(url, mejs.Utils.getTypeFromFile(url)),
		    request = new chrome.cast.media.LoadRequest(mediaInfo);

		// Add event listeners for player changes which may occur outside sender app
		t.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, function () {
			if (t.castPlayer.isPaused) {
				t.media.pause();
			} else {
				t.media.play();
			}
		});

		t.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED, function () {
			t.media.setMute(t.castPlayer.isMuted);
		});

		t.castPlayerController.addEventListener(cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED, function () {});

		mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
		mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;

		t.media.addEventListener('loadeddata', function () {

			castSession.loadMedia(request).then(function () {
				console.log('Load succeed');
			}, function (errorCode) {

				var description = errorCode.description ? " : " + errorCode.description : '.';

				var message = void 0;

				switch (errorCode.code) {
					case chrome.cast.ErrorCode.API_NOT_INITIALIZED:
						message = "The API is not initialized" + description;
						break;
					case chrome.cast.ErrorCode.CANCEL:
						message = "The operation was canceled by the user" + description;
						break;
					case chrome.cast.ErrorCode.CHANNEL_ERROR:
						message = "A channel to the receiver is not available" + description;
						break;
					case chrome.cast.ErrorCode.EXTENSION_MISSING:
						message = "The Cast extension is not available" + description;
						break;
					case chrome.cast.ErrorCode.INVALID_PARAMETER:
						message = "The parameters to the operation were not valid" + description;
						break;
					case chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE:
						message = "No receiver was compatible with the session request" + description;
						break;
					case chrome.cast.ErrorCode.SESSION_ERROR:
						message = "A session could not be created, or a session was invalid" + description;
						break;
					case chrome.cast.ErrorCode.TIMEOUT:
						message = "The operation timed out" + description;
						break;
					default:
						message = "Unknown error: " + errorCode.code;
						break;
				}

				console.error(message);
			});
		});

		var events = ['play', 'pause'];

		for (var i = 0, total = events.lenght; i < total; i++) {
			t.media.addEventListener(events[i], function () {
				if (t.castPlayer.isPaused) {
					t.castPlayerController.playOrPause();
				}
			});
		}

		t.media.addEventListener('volumechange', function () {
			t.castPlayer.volumeLevel = t.media.getVolume();
			t.castPlayerController.setVolumeLevel();

			if (t.media.getVolume() && t.media.muted || !t.media.getVolume()) {
				t.castPlayerController.muteOrUnmute();
			}
		});

		t.media.addEventListener('seeked', function () {
			t.castPlayer.currentTime = t.media.getCurrentTime();
			t.castPlayerController.seek();
		});
	}
});

},{}]},{},[1]);
