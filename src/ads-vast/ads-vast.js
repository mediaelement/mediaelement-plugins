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
	buildvast (player, controls, layers, media)  {

		const t = this;

		if (!t.isVideo) {
			return;
		}

		// begin loading
		if (t.options.vastAdTagUrl !== '') {
			t.vastLoadAdTagInfo();
		}

		// make sure the preroll ad system is ready (it will ensure it can't be called twice)
		t.buildads(player, controls, layers, media);

		t.vastSetupEvents();
	},

	vastSetupEvents ()  {
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
		t.container.addEventListener('mejsprerollended', () => {

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
	vastSetAdTagUrl (url)  {

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
	vastLoadAdTagInfo ()  {
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
	loadAdTagInfoDirect ()  {
		const t = this;

		mejs.Utils.ajax(t.options.vastAdTagUrl, 'xml', (data)  => {
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
	loadAdTagInfoProxy ()  {
		const
			t = this,
			protocol = location.protocol,
			query = `select * from xml where url="${encodeURI(t.options.vastAdTagUrl)}"`,
			yahooUrl = `http${(/^https/.test(protocol) ? 's' : '')}://query.yahooapis.com/v1/public/yql?format=xml&q=${query}`
		;

		mejs.Utils.ajax(yahooUrl, 'xml', (data) => {
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
	vastParseVastData (data)  {

		const t = this;

		// clear out data
		t.vastAdTags = [];
		t.options.indexPreroll = 0;

		const
			parser = new DOMParser(),
			xmlDoc = parser.parseFromString(data, 'text/xml'),
			ads = xmlDoc.getElementsByTagName('Ad')
		;

		for (let i = 0, total = ads.length; i < total; i++) {
			const
				adNode = ads[i],
				adTag = {
					id: adNode.getAttribute('id'),
					title: adNode.getElementsByTagName('AdTitle')[0].textContent.trim(),
					description: adNode.getElementsByTagName('Description')[0].textContent.trim(),
					impressions: [],
					clickThrough: adNode.getElementsByTagName('ClickThrough')[0].textContent.trim(),
					mediaFiles: [],
					trackingEvents: {},
					// internal tracking if it's been used
					shown: false
				},
				impressions = adNode.getElementsByTagName('Impression'),
				mediaFiles = adNode.getElementsByTagName('MediaFile'),
				trackFiles = adNode.getElementsByTagName('Tracking')
			;

			t.vastAdTags.push(adTag);

			for (let j = 0, impressionsTotal = impressions.length; j < impressionsTotal; j++) {
				adTag.impressions.push(impressions[j].textContent.trim());
			}

			for (let j = 0, tracksTotal = trackFiles.length; j < tracksTotal; j++) {
				const trackingEvent = trackFiles[j];
				adTag.trackingEvents[trackingEvent.getAttribute('event')] = trackingEvent.textContent.trim();
			}

			for (let j = 0, mediaFilesTotal = mediaFiles.length; j < mediaFilesTotal; j++) {
				const
					mediaFile = mediaFiles[j],
					type = mediaFile.getAttribute('type')
				;

				if (t.media.canPlayType(type) !== '' || t.media.canPlayType(type).match(/(no|false)/) === null) {

					adTag.mediaFiles.push({
						id: mediaFile.getAttribute('id'),
						delivery: mediaFile.getAttribute('delivery'),
						type: mediaFile.getAttribute('type'),
						bitrate: mediaFile.getAttribute('bitrate'),
						width: mediaFile.getAttribute('width'),
						height: mediaFile.getAttribute('height'),
						url: mediaFile.textContent.trim()
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
	vastLoaded ()  {
		const t = this;

		t.vastAdTagIsLoaded = true;
		t.vastAdTagIsLoading = false;
		t.adsDataIsLoading = false;
		t.vastStartPreroll();
	},

	/**
	 *
	 */
	vastStartPreroll ()  {
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