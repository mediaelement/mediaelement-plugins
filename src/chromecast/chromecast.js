'use strict';

/**
 * VAST Ads Plugin
 *
 * Sponsored by Minoto Video
 */


// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * Chromecast App ID
	 * @type {String}
	 */
	castAppID: '',

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
	buildchromecast: function (player, controls, layers, media)  {

		const
			t = this,
			button = $(`<div class="${t.options.classPrefix}button ${t.options.classPrefix}chromecast-button">` +
					`<button type="button" aria-controls="${t.id}" title="" aria-label="" tabindex="0"></button>` +
				`</div>`)
				// append it to the toolbar
				.appendTo(controls);
	},

});