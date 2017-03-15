'use strict';

/**
 * VAST Ads Plugin
 *
 * Sponsored by Minoto Video
 */


// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * URL to vast data (http://minotovideo.com/sites/minotovideo.com/files/upload/eday_vast_tag.xml)
	 * @type {String}
	 */
	vastAdTagUrl: ''
});

Object.assign(MediaElementPlayer.prototype, {

	/**
	 * @type {Boolean}
	 */
	vastAdTagIsLoading: false,
	/**
	 * @type {Boolean}
	 */
	vastAdTagIsLoaded: false,
	/**
	 * @type {Boolean}
	 */
	vastStartedPlaying: false,
	/**
	 * @type {Array}
	 */
	vastAdTags: [],

	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {$} controls
	 * @param {$} layers
	 * @param {HTMLElement} media
	 */
	buildvast: function (player, controls, layers, media)  {

		let t = this;

		// begin loading
		if (t.options.vastAdTagUrl !== '') {
			t.vastLoadAdTagInfo();
		}

		// make sure the preroll ad system is ready (it will ensure it can't be called twice)
		t.buildads(player, controls, layers, media);

		t.vastSetupEvents();
	},

	vastSetupEvents: function ()  {
		const t = this;


		// START: preroll
		t.container.addEventListener('mejsprerollstarted', () => {

			if (t.vastAdTags.length > 0) {

				const adTag = t.vastAdTags[0];

				// always fire this event
				if (adTag.trackingEvents.start) {
					t.adsLoadUrl(adTag.trackingEvents.start);
				}

				// only do impressions once
				if (!adTag.shown && adTag.impressions.length > 0) {

					for (let i = 0, total = adTag.impressions.length; i < total; i++) {
						t.adsLoadUrl(adTag.impressions[i]);
					}
				}

				adTag.shown = true;
			}

		});

		// END: preroll
		t.container.on('mejsprerollended', () => {

			if (t.vastAdTags.length > 0 && t.options.indexPreroll < t.vastAdTags.length &&
				t.vastAdTags[t.options.indexPreroll].trackingEvents.complete) {
				t.adsLoadUrl(t.vastAdTags[t.options.indexPreroll].trackingEvents.complete);
			}

		});

	},

	/**
	 *
	 * @param {String} url
	 */
	vastSetAdTagUrl: function (url)  {

		const t = this;

		// set and reset
		t.options.vastAdTagUrl = url;
		t.options.indexPreroll = 0;
		t.vastAdTagIsLoaded = false;
		t.vastAdTags = [];
	},

	/**
	 *
	 */
	vastLoadAdTagInfo: function ()  {
		const t = this;

		// set this to stop playback
		t.adsDataIsLoading = true;
		t.vastAdTagIsLoading = true;

		// try straight load first
		t.loadAdTagInfoDirect();
	},

	/**
	 *
	 */
	loadAdTagInfoDirect: function ()  {
		const t = this;

		mejs.Utils.ajax(t.options.vastAdTagUrl, (data)  => {
				t.vastParseVastData(data);
			}, (err)  => {
				console.error('vast3:direct:error', err);

				// fallback to Yahoo proxy
				t.loadAdTagInfoProxy();
			}
		);
	},

	/**
	 *
	 */
	loadAdTagInfoProxy: function ()  {
		const
			t = this,
			protocol = location.protocol,
			query = `select * from xml where url="${encodeURI(t.options.vastAdTagUrl)}"`,
			yahooUrl = `http${(/^https/.test(protocol) ? 's' : '')}://query.yahooapis.com/v1/public/yql?format=xml&q=${query}`
		;

		mejs.Utils.ajax(yahooUrl, (data) => {
				t.vastParseVastData(data);
			}, (err)  => {
				console.error('vast:proxy:yahoo:error', err);
			}
		);
	},

	/**
	 *
	 * @param {jQuery} data
	 */
	vastParseVastData: function (data)  {

		const t = this;

		// clear out data
		t.vastAdTags = [];
		t.options.indexPreroll = 0;

		const ads = data.querySelectorAll('Ad');

		for (let i = 0, total = ads.length; i < total; i++) {
			const
				adNode = ads[i],
				adTag = {
					id: adNode.getAttribute('id'),
					title: adNode.querySelector('AdTitle').innerText.trim(),
					description: adNode.querySelector('Description').innerText.trim(),
					impressions: [],
					clickThrough: adNode.querySelector('ClickThrough').innerText.trim(),
					mediaFiles: [],
					trackingEvents: {},
					// internal tracking if it's been used
					shown: false
				},
				impressions = adNode.querySelectorAll('Impression'),
				mediaFiles = adNode.querySelectorAll('MediaFile'),
				trackFiles = adNode.querySelectorAll('Tracking')
			;

			t.vastAdTags.push(adTag);

			for (let j = 0, impressionsTotal = impressions.length; i < impressionsTotal; i++) {
				adTag.impressions.push(impressions[j].innerText.trim());
			}

			for (let j = 0, tracksTotal = trackFiles.length; i < tracksTotal; i++) {
				const trackingEvent = trackFiles[j];
				adTag.trackingEvents[trackingEvent.getAttribute('event')] = trackingEvent.innerText.trim();
			}

			for (let j = 0, mediaFilesTotal = mediaFiles.length; i < mediaFilesTotal; i++) {
				const
					mediaFile = mediaFiles[j],
					type = mediaFile.attr('type')
				;

				if (t.media.canPlayType(type).toString().replace(/no/, '').replace(/false/, '') !== '') {

					adTag.mediaFiles.push({
						id: mediaFile.getAttribute('id'),
						delivery: mediaFile.getAttribute('delivery'),
						type: mediaFile.getAttribute('type'),
						bitrate: mediaFile.getAttribute('bitrate'),
						width: mediaFile.getAttribute('width'),
						height: mediaFile.getAttribute('height'),
						url: mediaFile.innerText.trim()
					});
				}
			}
		}

		// DONE
		t.vastLoaded();
	},

	/**
	 *
	 */
	vastLoaded: function ()  {
		const t = this;

		t.vastAdTagIsLoaded = true;
		t.vastAdTagIsLoading = false;
		t.adsDataIsLoading = false;
		t.vastStartPreroll();
	},

	/**
	 *
	 */
	vastStartPreroll: function ()  {
		const t = this;

		// if we have a media URL, then send it up to the ads plugin as a preroll
		// load up the vast ads to be played before the selected media.
		// Note: multiple preroll ads are supported.
		let i = 0;
		while (i < t.vastAdTags.length) {
			t.options.adsPrerollMediaUrl[i] = t.vastAdTags[i].mediaFiles[0].url;
			t.options.adsPrerollAdUrl[i] = t.vastAdTags[i].clickThrough;
			i++;
		}
		t.adsStartPreroll();

	}

});