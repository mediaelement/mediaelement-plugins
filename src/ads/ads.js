'use strict';

/**
 * Ads plugin.
 * Sponsored by Minoto Video; updated to support VPAID and VAST3.0
 */

// Translations (English required)
mejs.i18n.en['mejs.ad-skip'] = 'Skip ad';
mejs.i18n.en['mejs.ad-skip-info'] = ['Skip in 1 second', 'Skip in %1 seconds'];

Object.assign(mejs.MepDefaults, {
	/**
	 * URL(s) to a media file
	 * @type {String[]}
	 */
	adsPrerollMediaUrl: [],

	/**
	 * URL(s) to clicking Ad
	 * @type {String[]}
	 */
	adsPrerollAdUrl: [],

	/**
	 * Allow user to skip the pre-roll Ad
	 * @type {Boolean}
	 */
	adsPrerollAdEnableSkip: false,

	/**
	 * If `adsPrerollAdEnableSkip` is `true`, allow skipping after the time specified has elasped
	 * @type {Number}
	 */
	adsPrerollAdSkipSeconds: -1,

	/**
	 * Keep track of the index for the preroll ads to be able to show more than one preroll.
	 * Used for VAST3.0
	 * @type {Number}
	 */
	indexPreroll: 0
});

Object.assign(MediaElementPlayer.prototype, {

	// allows other plugins to all this one
	adsLoaded: false,

	// prevents playback in until async ad data is ready (e.g. VAST)
	adsDataIsLoading: false,

	// stores the main media URL when an ad is playing
	adsCurrentMediaUrl: '',
	adsCurrentMediaDuration: 0,

	// true when the user clicks play for the first time, or if autoplay is set
	adsPlayerHasStarted: false,

	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 */
	buildads (player, controls, layers)  {

		const t = this;

		if (t.adsLoaded) {
			return;
		} else {
			t.adsLoaded = true;
		}

		// add layer for ad links and skipping
		player.adsLayer = document.createElement('div');
		player.adsLayer.className = `${t.options.classPrefix}layer ${t.options.classPrefix}overlay ${t.options.classPrefix}ads`;
		player.adsLayer.innerHTML = `<a href="#" target="_blank"></a>` +
			`<div class="${t.options.classPrefix}ads-skip-block">` +
			`<span class="${t.options.classPrefix}ads-skip-message"></span>` +
			`<span class="${t.options.classPrefix}ads-skip-button">${mejs.i18n.t('mejs.ad-skip')}</span>` +
			`</div>`;
		player.adsLayer.style.display = 'none';

		layers.insertBefore(player.adsLayer, layers.querySelector(`.${t.options.classPrefix}overlay-play`));

		player.adsLayer.querySelector('a').addEventListener('click', t.adsAdClick.bind(t));

		player.adsSkipBlock = player.adsLayer.querySelector(`.${t.options.classPrefix}ads-skip-block`);
		player.adsSkipBlock.style.display = 'none';
		player.adsSkipMessage = player.adsLayer.querySelector(`.${t.options.classPrefix}ads-skip-message`);
		player.adsSkipMessage.style.display = 'none';
		player.adsSkipButton = player.adsLayer.querySelector(`.${t.options.classPrefix}ads-skip-button`);
		player.adsSkipButton.addEventListener('click', t.adsSkipClick.bind(t));

		// create proxies (only needed for events we want to remove later)
		t.adsMediaTryingToStartProxy = t.adsMediaTryingToStart.bind(t);
		t.adsPrerollStartedProxy = t.adsPrerollStarted.bind(t);
		t.adsPrerollMetaProxy = t.adsPrerollMeta.bind(t);
		t.adsPrerollUpdateProxy = t.adsPrerollUpdate.bind(t);
		t.adsPrerollVolumeProxy = t.adsPrerollVolume.bind(t);
		t.adsPrerollEndedProxy = t.adsPrerollEnded.bind(t);

		// If an iframe is the main source, hide it to give priority to video tag
		t.media.addEventListener('rendererready', () => {
			var iframe = t.media.querySelector('iframe');
			if (iframe) {
				iframe.style.display = 'none';
			}
		});
		// check for start
		t.media.addEventListener('play', t.adsMediaTryingToStartProxy);
		t.media.addEventListener('playing', t.adsMediaTryingToStartProxy);
		t.media.addEventListener('canplay', t.adsMediaTryingToStartProxy);
		t.media.addEventListener('loadedmetadata', t.adsMediaTryingToStartProxy);

		if (t.options.indexPreroll < t.options.adsPrerollMediaUrl.length) {
			t.adsStartPreroll();
		}
	},

	adsMediaTryingToStart ()  {

		const t = this;

		// make sure to pause until the ad data is loaded
		if (t.adsDataIsLoading && !t.paused && t.options.indexPreroll < t.options.adsPrerollMediaUrl.length) {
			t.pause();
		}

		t.adsPlayerHasStarted = true;
	},

	adsStartPreroll ()  {

		const t = this;

		t.media.addEventListener('loadedmetadata', t.adsPrerollMetaProxy);
		t.media.addEventListener('playing', t.adsPrerollStartedProxy);
		t.media.addEventListener('ended', t.adsPrerollEndedProxy);
		t.media.addEventListener('timeupdate', t.adsPrerollUpdateProxy);
		t.media.addEventListener('volumechange', t.adsPrerollVolumeProxy);

		// change URLs to the preroll ad. Only save the video to be shown on first
		// ad showing.
		if (t.options.indexPreroll === 0) {
			t.adsCurrentMediaUrl = t.media.originalNode.src;
			t.adsCurrentMediaDuration = t.duration;
		}

		t.setSrc(t.options.adsPrerollMediaUrl[t.options.indexPreroll]);
		t.load();

		// turn off controls until the preroll is done
		const controlElements = t.container.querySelector(`.${t.options.classPrefix}controls`).children;
		for (let i = 0, total = controlElements.length; i < total; i++) {
			const
				target = controlElements[i],
				button = target.querySelector('button')
			;
			if (button && (!mejs.Utils.hasClass(target, `${t.options.classPrefix}playpause-button`) &&
				!mejs.Utils.hasClass(target, `${t.options.classPrefix}chromecast-button`))) {
				button.disabled = true;
				target.style.pointerEvents = 'none';
			} else if (target.querySelector(`.${t.options.classPrefix}time-slider`)) {
				target.querySelector(`.${t.options.classPrefix}time-slider`).style.pointerEvents = 'none';
			}
		}

		// if autoplay was on, or if the user pressed play
		// while the ad data was still loading, then start the ad right away
		if (t.adsPlayerHasStarted) {
			setTimeout(() => {
				t.play();
			}, 100);
		}
	},

	adsPrerollMeta ()  {

		const t = this;

		let newDuration = 0;

		// if duration has been set, show that
		if (t.options.duration > 0) {
			newDuration = t.options.duration;
		} else if (!isNaN(t.adsCurrentMediaDuration)) {
			newDuration = t.adsCurrentMediaDuration;
		}

		if (t.controls.querySelector(`.${t.options.classPrefix}duration`)) {
			setTimeout(() => {
				t.controls.querySelector(`.${t.options.classPrefix}duration`).innerHTML =
					mejs.Utils.secondsToTimeCode(newDuration, t.options.alwaysShowHours,
						t.options.showTimecodeFrameCount, t.options.framesPerSecond, t.options.secondsDecimalLength);
			}, 250);
		}

		// send initialization events
		const event = mejs.Utils.createEvent('mejsprerollinitialized', t.container);
		t.container.dispatchEvent(event);
	},

	adsPrerollStarted ()  {
		const t = this;

		t.media.removeEventListener('playing', t.adsPrerollStartedProxy);

		// enable clicking through
		t.adsLayer.style.display = 'block';
		if (t.options.adsPrerollAdUrl[t.options.indexPreroll]) {
			t.adsLayer.querySelector('a').href = t.options.adsPrerollAdUrl[t.options.indexPreroll];
		} else {
			t.adsLayer.querySelector('a').href = '#';
			t.adsLayer.querySelector('a').setAttribute('target', '');
		}

		// possibly allow the skip button to work
		if (t.options.adsPrerollAdEnableSkip) {
			t.adsSkipBlock.style.display = 'block';

			if (t.options.adsPrerollAdSkipSeconds > 0) {
				t.adsSkipMessage.innerHTML = mejs.i18n.t('mejs.ad-skip-info', t.options.adsPrerollAdSkipSeconds);
				t.adsSkipMessage.style.display = 'block';
				t.adsSkipButton.style.display = 'none';
			} else {
				t.adsSkipMessage.style.display = 'none';
				t.adsSkipButton.style.display = 'block';
			}
		} else {
			t.adsSkipBlock.style.display = 'none';
		}

		// send click events
		const event = mejs.Utils.createEvent('mejsprerollstarted', t.container);
		t.container.dispatchEvent(event);
	},

	adsPrerollUpdate ()  {
		const t = this;

		if (t.options.adsPrerollAdEnableSkip && t.options.adsPrerollAdSkipSeconds > 0) {
			// update message
			if (t.currentTime > t.options.adsPrerollAdSkipSeconds) {
				t.adsSkipButton.style.display = 'block';
				t.adsSkipMessage.style.display = 'none';
			} else {
				t.adsSkipMessage.innerHTML = mejs.i18n.t('mejs.ad-skip-info', Math.round(t.options.adsPrerollAdSkipSeconds - t.currentTime));
			}

		}

		const event = mejs.Utils.createEvent('mejsprerolltimeupdate', t.container);
		event.detail.duration = t.duration;
		event.detail.currentTime = t.currentTime;
		t.container.dispatchEvent(event);
	},

	adsPrerollVolume () {
		const t = this;

		const event = mejs.Utils.createEvent('mejsprerollvolumechanged', t.container);
		t.container.dispatchEvent(event);

	},

	adsPrerollEnded ()  {
		const t = this;

		t.media.removeEventListener('ended', t.adsPrerollEndedProxy);

		// wrap in timeout to make sure it truly has ended
		setTimeout(() => {
			t.options.indexPreroll++;
			if (t.options.indexPreroll < t.options.adsPrerollMediaUrl.length) {
				t.adsStartPreroll();
			} else {
				const event = mejs.Utils.createEvent('mejsprerollfinished', t.container);
				t.container.dispatchEvent(event);
				t.adRestoreMainMedia();
			}

			const event = mejs.Utils.createEvent('mejsprerollended', t.container);
			t.container.dispatchEvent(event);
		}, 0);
	},

	adRestoreMainMedia ()  {
		const
			t = this,
			iframe = t.media.querySelector('iframe')
		;

		if (iframe) {
			iframe.style.display = '';
		}

		t.setSrc(t.adsCurrentMediaUrl);
		setTimeout(() => {
			t.load();
			t.play();
		}, 10);

		// turn on controls to restore original media
		const controlElements = t.container.querySelector(`.${t.options.classPrefix}controls`).children;
		for (let i = 0, total = controlElements.length; i < total; i++) {
			const
				target = controlElements[i],
				button = target.querySelector('button')
			;
			if (button && !mejs.Utils.hasClass(target, `${t.options.classPrefix}playpause-button`)) {
				target.style.pointerEvents = 'auto';
				button.disabled = false;
			} else if (target.querySelector(`.${t.options.classPrefix}time-slider`)) {
				target.querySelector(`.${t.options.classPrefix}time-slider`).style.pointerEvents = 'auto';
			}
		}

		if (t.adsSkipBlock) {
			t.adsSkipBlock.remove();
		}

		t.adsLayer.style.display = 'none';

		t.media.removeEventListener('ended', t.adsPrerollEndedProxy);
		t.media.removeEventListener('loadedmetadata', t.adsPrerollMetaProxy);
		t.media.removeEventListener('timeupdate', t.adsPrerollUpdateProxy);

		const event = mejs.Utils.createEvent('mejsprerollmainstarted', t.container);
		t.container.dispatchEvent(event);
	},

	adsAdClick ()  {
		const t = this;

		if (t.paused) {
			t.play();
		} else {
			t.pause();
		}

		const event = mejs.Utils.createEvent('mejsprerolladsclicked', t.container);
		t.container.dispatchEvent(event);
	},

	adsSkipClick (e)  {
		const t = this;

		t.media.removeEventListener('ended', t.adsPrerollEndedProxy);

		let event = mejs.Utils.createEvent('mejsprerollskipclicked', t.container);
		t.container.dispatchEvent(event);

		event = mejs.Utils.createEvent('mejsprerollended', t.container);
		t.container.dispatchEvent(event);

		t.options.indexPreroll++;
		if (t.options.indexPreroll < t.options.adsPrerollMediaUrl.length) {
			t.adsStartPreroll();
		} else {
			
			event = mejs.Utils.createEvent('mejsprerollfinished', t.container);
			t.container.dispatchEvent(event);
			
			t.adRestoreMainMedia();
		}

		e.preventDefault();
		e.stopPropagation();
	},

	// tells calling function if ads have finished running
	prerollAdsFinished ()  {
		const t = this;
		return t.options.indexPreroll === t.options.adsPrerollMediaUrl.length;
	},

	// fires off fake XHR requests
	adsLoadUrl (url)  {
		let
			img = new Image(),
			rnd = Math.round(Math.random() * 100000)
		;

		img.src = `${url}${(~url.indexOf('?') ? '&' : '?')}random${rnd}=${rnd}`;
		img.loaded = () => {
			img = null;
		};
	}
});