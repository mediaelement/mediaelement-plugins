'use strict';

/**
 * Stop button
 *
 * This feature enables the displaying of a Stop button in the control bar, which basically pauses the media and rewinds
 * it to the initial position.
 */

// Translations (English required)
mejs.i18n.en["mejs.stop"] = "Stop";

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {?String}
	 */
	stopText: null
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
	buildstop: function (player, controls, layers, media)  {
		const
			t = this,
			stopTitle = mejs.Utils.isString(t.options.stopText) ? t.options.stopText : mejs.i18n.t('mejs.stop'),
			button = $(`<div class="${t.options.classPrefix}button ${t.options.classPrefix}stop-button ${t.options.classPrefix}stop">` +
				`<button type="button" aria-controls="${t.id}" title="${stopTitle}" aria-label="${stopTitle}" tabindex="0"></button>` +
			`</div>`)
		;

		t.addControlElement(button, 'stop');

		button.click(() => {
			if (!media.paused) {
				media.pause();
			}
			if (media.currentTime > 0) {
				media.setCurrentTime(0);
				media.pause();
				controls.find(`.${t.options.classPrefix}time-current`).width('0px');
				controls.find(`.${t.options.classPrefix}time-handle`).css('left', '0px');
				controls.find(`.${t.options.classPrefix}time-float-current`).html(mejs.Utils.secondsToTimeCode(0, player.options.alwaysShowHours));
				controls.find(`.${t.options.classPrefix}currenttime`).html(mejs.Utils.secondsToTimeCode(0, player.options.alwaysShowHours));
				layers.find(`.${t.options.classPrefix}poster`)
				.show();
			}
		});
	}
});