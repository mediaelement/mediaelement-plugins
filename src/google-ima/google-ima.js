'use strict';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * Path of VAST/VMAP/VPAID URL
	 * @type {String}
	 */
	adsUrl: ''
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
	buildgoogleima (player, controls, layers, media) {

		if (!player.options.adsUrl) {
			return;
		}

		player.imaLayer = document.createElement('div');
		player.imaLayer.id = `${player.options.classPrefix}ads`;
		player.imaLayer.className = `${player.options.classPrefix}overlay ${player.options.classPrefix}layer ${player.options.classPrefix}ima-layer`;

		player.playingAds = false;
		player.adsActive = false;
		player.preloadListener = false;
		player.contentCompleteCalled = false;

		layers.insertBefore(player.imaLayer, layers.firstChild);

		mejs.Utils.loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js').then(() => {
			// Activate VPAID by default
			google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);

			player.adsManager = null;
			player.adsDone = false;
			player.adDisplayContainer = new google.ima.AdDisplayContainer(player.imaLayer, media);
			player.adsLoader = new google.ima.AdsLoader(player.adDisplayContainer);
			player.adsLoader.addEventListener(
				google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
				player.onAdsManagerLoaded_.bind(player));

			player.adsLoader.addEventListener(
				google.ima.AdErrorEvent.Type.AD_ERROR,
				player.onAdError_.bind(player));

			player.resizeAdsCallback = () => {
				if (player.adsManager) {
					player.adsManager.resize(player.container.offsetWidth, player.container.offsetHeight, google.ima.ViewMode.FULLSCREEN);
				}
			};

			// An event listener to tell the SDK that our content video
			// is completed so the SDK can play any post-roll ads.
			media.addEventListener('ended', player.contentEndedListener_.bind(player));

			player.globalBind('resize', player.resizeAdsCallback);
			const playPauseBtn = controls.querySelector(`.${player.options.classPrefix}playpause-button`);
			if (playPauseBtn) {
				playPauseBtn.addEventListener('click', player.playAds_.bind(player));
			}
			const bigPlay = layers.querySelector(`.${player.options.classPrefix}overlay-play`);
			if (bigPlay) {
				bigPlay.addEventListener('click', player.playAds_.bind(player));
			}
		});
	},
	cleangoogleima (player, controls, layers, media) {
		media.removeEventListener('ended', player.contentEndedListener_.bind(player));
		player.globalUnbind('resize', player.resizeAdsCallback);
		player.imaLayer.remove();

		const playPauseBtn = player.controls.querySelector(`.${player.options.classPrefix}playpause-button`);
		if (playPauseBtn) {
			playPauseBtn.removeEventListener('click', player.playAds_.bind(player));
		}
		const bigPlay = player.layers.querySelector(`.${player.options.classPrefix}overlay-play`);
		if (bigPlay) {
			bigPlay.removeEventListener('click', player.playAds_.bind(player));
		}
	},
	loadAds_ () {
		const t = this;
		if (t.preloadListener) {
			t.media.removeEventListener('loadedmetadata', t.loadAds_.bind(t));
			t.preloadListener = false;
		}
		t.requestAds_(t.options.adsUrl);
	},
	contentEndedListener_ () {
		this.contentCompleteCalled = true;
		this.adsLoader.contentComplete();
		this.imaLayer.style.display = 'none';

		const playPauseBtn = this.controls.querySelector(`.${this.options.classPrefix}playpause-button`);
		if (playPauseBtn) {
			playPauseBtn.removeEventListener('click', this.playAds_.bind(this));
		}
		const bigPlay = this.layers.querySelector(`.${this.options.classPrefix}overlay-play`);
		if (bigPlay) {
			bigPlay.removeEventListener('click', this.playAds_.bind(this));
		}
	},
	playAds_ (e) {
		const t = this;
		// Initialize the container. Must be done via a user action on mobile devices.
		if (!t.adsDone) {
			t.adDisplayContainer.initialize();
			t.load();

			// If this is the initial user action on iOS or Android device,
			// simulate playback to enable the video element for later program-triggered
			// playback.
			if (t.paused && (mejs.Features.isAndroid || mejs.Features.isIOS)) {
				t.preloadListener = true;
				t.media.addEventListener('loadedmetadata', t.loadAds_.bind(t));
				t.media.load();
			} else {
				t.loadAds_();
			}
			t.adsDone = true;
			return;
		}

		if (t.adsActive) {
			let event;
			if (t.playingAds && t.adsManager) {
				t.adsManager.pause();
				t.playingAds = false;
				event = mejs.Utils.createEvent('pause', t.media);
			} else if (t.adsManager) {
				t.adsManager.resume();
				t.playingAds = true;
				event = mejs.Utils.createEvent('play', t.media);
			}
			t.media.dispatchEvent(event);
		} else if (t.paused) {
			t.play();
		} else {
			t.pause();
		}

		e.preventDefault();
		e.stopPropagation();
	},
	requestAds_ (adTagUrl) {
		const t = this;
		t.adsRequest = new google.ima.AdsRequest();

		t.adsRequest.adTagUrl = adTagUrl;
		t.adsRequest.linearAdSlotWidth = t.container.offsetWidth;
		t.adsRequest.linearAdSlotHeight = t.container.offsetHeight;
		t.adsRequest.nonLinearAdSlotWidth = t.container.offsetWidth;
		t.adsRequest.nonLinearAdSlotHeight = t.container.offsetHeight;
		t.adsLoader.requestAds(t.adsRequest);
	},
	onAdsManagerLoaded_ (adsManagerLoadedEvent) {
		// Get the ads manager.
		const t = this, adsRenderingSettings = new google.ima.AdsRenderingSettings();
		adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
		t.adsManager = adsManagerLoadedEvent.getAdsManager(t.media, adsRenderingSettings);

		// Add listeners to the required events.
		t.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, t.onAdError_.bind(t));
		t.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, t.onContentPauseRequested_.bind(t));
		t.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, t.onContentResumeRequested_.bind(t));
		t.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, t.onAdEvent_.bind(t));

		var events = [
			google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
			google.ima.AdEvent.Type.CLICK,
			google.ima.AdEvent.Type.COMPLETE,
			google.ima.AdEvent.Type.FIRST_QUARTILE,
			google.ima.AdEvent.Type.LOADED,
			google.ima.AdEvent.Type.MIDPOINT,
			google.ima.AdEvent.Type.PAUSED,
			google.ima.AdEvent.Type.STARTED,
			google.ima.AdEvent.Type.THIRD_QUARTILE
		];
		for (let i = 0, total = events.length; i< total; i++) {
			t.adsManager.addEventListener(events[i], t.onAdEvent_.bind(t));
		}

		t.adsManager.init(t.width, t.height, google.ima.ViewMode.NORMAL);
		t.adsManager.start();
	},
	onAdEvent_ (adEvent) {
		const t = this, ad = adEvent.getAd();
		if (adEvent.type === google.ima.AdEvent.Type.LOADED) {
			// This is the first event sent for an ad - it is possible to
			// determine whether the ad is a video ad or an overlay.
			if (!ad.isLinear()) {
				// Position AdDisplayContainer correctly for overlay.
				// Use ad.width and ad.height.
				t.onContentResumeRequested_();
			}
		}
	},

	onAdError_ (adErrorEvent) {
		// Handle the error logging.
		console.error(adErrorEvent.getError());
		this.adsManager.destroy();
		this.cleangoogleima(this, this.controls, this.layers, this.media);
	},

	onContentPauseRequested_ () {
		this.media.removeEventListener('ended', this.contentEndedListener_.bind(this));
		this.adsActive = true;
		this.playingAds = true;
		this.pause();
	},

	onContentResumeRequested_ () {
		this.media.addEventListener('ended', this.contentEndedListener_.bind(this));
		this.contentEndedListener_();
		if (!this.contentCompleteCalled) {
			this.adsActive = false;
			this.play();
		}
	}
});