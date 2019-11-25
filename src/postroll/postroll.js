'use strict';

/**
 * Postroll plugin
 *
 * This feature allows the injection of any HTML content in an independent layer once the media finished.
 * To activate it, one of the nodes contained in the `<video>` tag must be
 * `<link href="/path/to/action_to_display_content" rel="postroll">`
 */

// Translations (English required)
mejs.i18n.en['mejs.close'] = 'Close';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {?String}
	 */
	postrollCloseText: null
});

Object.assign(MediaElementPlayer.prototype, {

	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 */
	buildpostroll (player, controls, layers)  {
		const
			t = this,
			postrollTitle = mejs.Utils.isString(t.options.postrollCloseText) ? t.options.postrollCloseText : mejs.i18n.t('mejs.close'),
			postrollLink = t.container.querySelector('link[rel="postroll"]')
		;

		if (postrollLink) {
			player.postroll = document.createElement('div');
			player.postroll.className = `${t.options.classPrefix}postroll-layer ${t.options.classPrefix}layer`;
			player.postroll.innerHTML = `<a class="${t.options.classPrefix}postroll-close" href="#">${postrollTitle}</a>` +
				`<div class="${t.options.classPrefix}postroll-layer-content"></div>`;
			player.postroll.style.display = 'none';

			layers.insertBefore(player.postroll, layers.firstChild);

			player.postroll.querySelector(`.${t.options.classPrefix}postroll-close`).addEventListener('click', function (e) {
				this.parentNode.style.display = 'none';
				e.preventDefault();
				e.stopPropagation();
			});

			t.media.addEventListener('ended', () => {
				mejs.Utils.ajax(postrollLink.getAttribute('href'), 'html', (data) => {
					layers.querySelector(`.${t.options.classPrefix}postroll-layer-content`).innerHTML = data;
				});
				player.postroll.style.display = 'block';
			}, false);

			t.media.addEventListener('seeked', () => {
				player.postroll.style.display = 'none';
			}, false);

			t.media.addEventListener('playing', () => {
				player.postroll.style.display = 'none';
			}, false);
		}
	}
});