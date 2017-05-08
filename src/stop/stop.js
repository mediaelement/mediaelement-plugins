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
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 * @param {HTMLElement} media
	 */
	buildstop (player, controls, layers, media)  {
		const
			t = this,
			stopTitle = mejs.Utils.isString(t.options.stopText) ? t.options.stopText : mejs.i18n.t('mejs.stop'),
			button = document.createElement('div')
		;

		button.className = `${t.options.classPrefix}button ${t.options.classPrefix}stop-button ${t.options.classPrefix}stop`;
		button.innerHTML = `<button type="button" aria-controls="${t.id}" title="${stopTitle}" aria-label="${stopTitle}" tabindex="0"></button>`;

		t.addControlElement(button, 'stop');

		button.addEventListener('click', () => {
			if (!media.paused) {
				media.pause();
			}
			if (media.currentTime > 0) {
				media.setCurrentTime(0);
				media.pause();
				controls.querySelector(`.${t.options.classPrefix}time-current`).style.width = '0px';
				controls.querySelector(`.${t.options.classPrefix}time-handle`).style.left = '0px';
				controls.querySelector(`.${t.options.classPrefix}time-float-current`).innerHTML =
					(mejs.Utils.secondsToTimeCode(0, player.options.alwaysShowHours, player.options.showTimecodeFrameCount, player.options.framesPerSecond));
				controls.querySelector(`.${t.options.classPrefix}currenttime`).innerHTML =
					(mejs.Utils.secondsToTimeCode(0, player.options.alwaysShowHours, player.options.showTimecodeFrameCount, player.options.framesPerSecond));
				layers.querySelector(`.${t.options.classPrefix}poster`).style.display = 'block';
			}
		});
	}
});