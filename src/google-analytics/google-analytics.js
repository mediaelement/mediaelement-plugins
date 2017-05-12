'use strict';

/**
 * Google Analytics Plugin
 *
 * This feature enables GA to send certain events, such as play, pause, ended, etc. It requires previous configuration
 * on GA to send events properly.
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/events
 */


// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {String}
	 */
	googleAnalyticsTitle: '',
	/**
	 * @type {String}
	 */
	googleAnalyticsCategory: 'Videos',
	/**
	 * @type {String}
	 */
	googleAnalyticsEventPlay: 'Play',
	/**
	 * @type {String}
	 */
	googleAnalyticsEventPause: 'Pause',
	/**
	 * @type {String}
	 */
	googleAnalyticsEventEnded: 'Ended',
	/**
	 * @type {String}
	 */
	googleAnalyticsEventTime: 'Time'
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
	buildgoogleanalytics (player, controls, layers, media)  {

		media.addEventListener('play', () => {
			if (typeof ga !== 'undefined') {
				ga('send', 'event',
					player.options.googleAnalyticsCategory,
					player.options.googleAnalyticsEventPlay,
					(player.options.googleAnalyticsTitle === '') ? player.media.currentSrc : player.options.googleAnalyticsTitle
				);
			}
		}, false);

		media.addEventListener('pause', () => {
			if (typeof ga !== 'undefined') {
				ga('send', 'event',
					player.options.googleAnalyticsCategory,
					player.options.googleAnalyticsEventPause,
					(player.options.googleAnalyticsTitle === '') ? player.media.currentSrc : player.options.googleAnalyticsTitle
				);
			}
		}, false);

		media.addEventListener('ended', () => {
			if (typeof ga !== 'undefined') {
				ga('send', 'event',
					player.options.googleAnalyticsCategory,
					player.options.googleAnalyticsEventEnded,
					(player.options.googleAnalyticsTitle === '') ? player.media.currentSrc : player.options.googleAnalyticsTitle
				);
			}
		}, false);
	}
});