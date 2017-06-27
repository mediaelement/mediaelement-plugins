'use strict';

/**
 * Playlist plugin
 *
 * This feature allows you to create a video/audio playlist
 */

// Translations (English required)
mejs.i18n.en['mejs.playlist-prev'] = 'Previous';
mejs.i18n.en['mejs.playlist-next'] = 'Next';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * List to be played; each object MUST have `src` and `title`; other items: `thumbnail`, `type`, `description`
	 * @type {Object[]}
	 */
	playlist: [],
	/**
	 * @type {?String}
	 */
	prevText: null,
	/**
	 * @type {?String}
	 */
	nextText: null
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
	buildprevious ()  {

		const
			t = this,
			defaultPrevTitle = mejs.i18n.t('mejs.playlist-prev'),
			prevTitle = mejs.Utils.isString(t.options.prevText) ? t.options.prevText : defaultPrevTitle,
			prevButton = document.createElement('div')
		;

		prevButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}prev-button`;
		prevButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${prevTitle}" aria-label="${prevTitle}" tabindex="0"></button>`;

		t.addControlElement(prevButton, 'previous');
	},
	buildnext ()  {
		const
			t = this,
			defaultNextTitle = mejs.i18n.t('mejs.playlist-next'),
			nextTitle = mejs.Utils.isString(t.options.nextText) ? t.options.nextText : defaultNextTitle,
			nextButton = document.createElement('div')
		;

		nextButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}next-button`;
		nextButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${nextTitle}" aria-label="${nextTitle}" tabindex="0"></button>`;

		t.addControlElement(nextButton, 'next');
	},
	buildplaylist ()  {

	}
});