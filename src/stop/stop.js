'use strict';

/**
 * Stop button
 *
 * This feature enables the displaying of a Stop button in the control bar, which basically pauses the media and rewinds
 * it to the initial position.
 */

// Translations (English required)
mejs.i18n.en['mejs.stop'] = 'Stop';

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
			if (typeof media.stop === 'function') {
				media.stop();
			} else if (media.readyState > 0) {
				if (!media.paused) {
					media.pause();
				}

				media.setSrc('');
				media.load();

				const playButton = controls.querySelector(`.${t.options.classPrefix}playpause-button`);
				mejs.Utils.removeClass(playButton, `${t.options.classPrefix}pause`);
				mejs.Utils.addClass(playButton, `${t.options.classPrefix}play`);

				// It will throw an error trying to load an empty source, so remove it since it's expected
				if (t.container.querySelector(`.${t.options.classPrefix}cannotplay`)) {
					t.container.querySelector(`.${t.options.classPrefix}cannotplay`).remove();
					layers.querySelector(`.${t.options.classPrefix}overlay-error`).parentNode.style.display = 'none';
					layers.querySelector(`.${t.options.classPrefix}overlay-error`).remove();
				}
			}

			const event = mejs.Utils.createEvent('timeupdate', media);
			media.dispatchEvent(event);
		});
	}
});