'use strict';

/**
 * Jump forward button
 *
 * This feature creates a button to forward media a specific number of seconds.
 */

// Translations (English required)
mejs.i18n.en['mejs.time-jump-forward'] = ['Jump forward 1 second', 'Jump forward %1 seconds'];

Object.assign(mejs.MepDefaults, {
	/**
	 * @type {Number}
	 */
	jumpForwardInterval: 30,
	/**
	 * @type {?String}
	 */
	jumpForwardText: null
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
	buildjumpforward (player, controls, layers, media)  {

		const
			t = this,
			defaultTitle = mejs.i18n.t('mejs.time-jump-forward', t.options.jumpForwardInterval),
			forwardTitle = mejs.Utils.isString(t.options.jumpForwardText) ? t.options.jumpForwardText.replace('%1', t.options.jumpForwardInterval) : defaultTitle,
			button = document.createElement('div')
		;

		button.className = `${t.options.classPrefix}button ${t.options.classPrefix}jump-forward-button`;
		button.innerHTML = `<button type="button" aria-controls="${t.id}" title="${forwardTitle}" aria-label="${forwardTitle}" tabindex="0">${t.options.jumpForwardInterval}</button>`;

		t.addControlElement(button, 'jumpforward');

		// add a click toggle event
		button.addEventListener('click', function() {
			const duration = !isNaN(media.duration) ? media.duration : t.options.jumpForwardInterval;
			if (duration) {
				const current = media.currentTime === Infinity ? 0 : media.currentTime;
				media.setCurrentTime(Math.min(current + t.options.jumpForwardInterval, duration));
				this.querySelector('button').blur();
			}
		});
	}
});