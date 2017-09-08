'use strict';

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

		player.imaLayer = document.createElement('div');
		player.imaLayer.id = `${player.options.classPrefix}ads`;
		player.imaLayer.className = `${player.options.classPrefix}overlay ${player.options.classPrefix}layer ${player.options.classPrefix}ima-layer`;

		layers.insertBefore(player.imaLayer, layers.firstChild);

		mejs.Utils.loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js').then(() => {
			player.adDisplayContainer = new google.ima.AdDisplayContainer(player.imaLayer, media.originalNode);

			// Create ads loader.
			player.adsLoader = new google.ima.AdsLoader(player.adDisplayContainer);
			// Listen and respond to ads loaded and error events.
			player.adsLoader.addEventListener(
				google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
				player.onAdsManagerLoaded.bind(player));
			player.adsLoader.addEventListener(
				google.ima.AdErrorEvent.Type.AD_ERROR,
				player.onAdError.bind(player));

			// An event listener to tell the SDK that our content video
			// is completed so the SDK can play any post-roll ads.
			media.addEventListener('ended', player.contentEndedListener_.bind(player));
			player.globalBind('resize', () => {
				player.adsRequest.linearAdSlotWidth = player.width;
				player.adsRequest.linearAdSlotHeight = player.height;
				player.adsRequest.nonLinearAdSlotWidth = player.width;
			});

			const playPauseBtn = controls.querySelector(`.${player.options.classPrefix}playpause-button`);
			if (playPauseBtn) {
				playPauseBtn.addEventListener('click', player.playAds_.bind(player));
			}
			const bigPlay = layers.querySelector(`.${player.options.classPrefix}overlay-play`);
			if (bigPlay) {
				bigPlay.addEventListener('click', player.playAds_.bind(player));
			}

			// Request video ads.
			player.adsRequest = new google.ima.AdsRequest();
			player.adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
				'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
				'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
				'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

			// Specify the linear and nonlinear slot sizes. This helps the SDK to
			// select the correct creative if multiple are returned.
			player.adsRequest.linearAdSlotWidth = player.width;
			player.adsRequest.linearAdSlotHeight = player.height;

			player.adsRequest.nonLinearAdSlotWidth = player.width;
			player.adsRequest.nonLinearAdSlotHeight = 150;

			player.adsLoader.requestAds(player.adsRequest);
		});
	},
	contentEndedListener_ () {
		this.adsLoader.contentComplete();
	},
	playAds_ (e) {
		const t = this;
		// Initialize the container. Must be done via a user action on mobile devices.
		t.load();
		t.adDisplayContainer.initialize();

		try {
			// Initialize the ads manager. Ad rules playlist will start at this time.
			t.adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
			// Call play to start showing the ad. Single video and overlay ads will
			// start at this time; the call will be ignored for ad rules.
			t.adsManager.start();
		} catch (adError) {
			// An error may be thrown if there was a problem with the VAST response.
			t.play();
		}

		e.preventDefault();
		e.stopPropagation();

	},
	onAdsManagerLoaded (adsManagerLoadedEvent) {
		console.log(adsManagerLoadedEvent);

		// Get the ads manager.
		const t = this, adsRenderingSettings = new google.ima.AdsRenderingSettings();
		adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
		// videoContent should be set to the content video element.
		t.adsManager = adsManagerLoadedEvent.getAdsManager(t.media.originalNode, adsRenderingSettings);

		// Add listeners to the required events.
		t.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, t.onAdError.bind(t));
		t.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, t.onContentPauseRequested.bind(t));
		t.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, t.onContentResumeRequested.bind(t));
		t.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, t.onAdEvent.bind(t));

		// Listen to any additional events, if necessary.
		t.adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, t.onAdEvent.bind(t));
		t.adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, t.onAdEvent.bind(t));
		t.adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, t.onAdEvent.bind(t));
	},
	onAdEvent (adEvent) {
		// Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
		// don't have ad object associated.
		const t = this, ad = adEvent.getAd();
		let intervalTimer;
		switch (adEvent.type) {
			case google.ima.AdEvent.Type.LOADED:
				// This is the first event sent for an ad - it is possible to
				// determine whether the ad is a video ad or an overlay.
				if (!ad.isLinear()) {
					// Position AdDisplayContainer correctly for overlay.
					// Use ad.width and ad.height.
					t.play();
				}
				break;
			case google.ima.AdEvent.Type.STARTED:
				// This event indicates the ad has started - the video player
				// can adjust the UI, for example display a pause button and
				// remaining time.
				if (ad.isLinear()) {
					// For a linear ad, a timer can be started to poll for
					// the remaining time.
					intervalTimer = setInterval(
						() => {
							// let remainingTime = adsManager.getRemainingTime();
						},
						300); // every 300ms
				}
				break;
			case google.ima.AdEvent.Type.COMPLETE:
				// This event indicates the ad has finished - the video player
				// can perform appropriate UI actions, such as removing the timer for
				// remaining time detection.
				if (ad.isLinear()) {
					clearInterval(intervalTimer);
				}
				break;
		}
	},

	onAdError (adErrorEvent) {
		// Handle the error logging.
		console.log(adErrorEvent.getError());
		t.adsManager.destroy();
	},

	onContentPauseRequested () {
		this.pause();
		// This function is where you should setup UI for showing ads (e.g.
		// display ad timer countdown, disable seeking etc.)
		// setupUIForAds();
	},

	onContentResumeRequested () {
		this.play();
		// This function is where you should ensure that your UI is ready
		// to play content. It is the responsibility of the Publisher to
		// implement this function when necessary.
		// setupUIForContent();
	}
});