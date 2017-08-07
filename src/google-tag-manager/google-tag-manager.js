/**
 * Google Tag Manager Plugin
 *
 * This feature enables Google Tag Manager to send certain events, such as play, pause, ended, etc. It requires previous configuration
 * on Google Tag Manager configuration to send events properly. For more information, check
 * https://support.google.com/tagmanager/answer/6102821?hl=en
 *
 * @see https://developers.google.com/tag-manager/
 */

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {Array}
	 */
	dataLayer: []
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
	buildgoogletagmanager (player, controls, layers, media) {
		player.tagManagerPlay = () => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({'event': 'clickPlay'});
			}
		};
		player.tagManagerPause = () => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({'event': 'clickPause'});
			}
		};
		player.tagManagerEnded = () => {
			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({'event': 'clickEnded'});
			}
		};

		media.addEventListener('play', player.tagManagerPlay);
		media.addEventListener('pause', player.tagManagerPause);
		media.addEventListener('ended', player.tagManagerEnded);
	},
	cleangoogletagmanager (player, controls, layers, media) {
		media.removeEventListener('play', player.tagManagerPlay);
		media.removeEventListener('pause', player.tagManagerPause);
		media.removeEventListener('ended', player.tagManagerEnded);
	}
});
