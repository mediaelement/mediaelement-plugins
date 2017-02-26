'use strict';

/**
 * Loop button
 *
 * This feature creates a loop button in the control bar to toggle its behavior. It will restart media once finished
 * if activated
 */


// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {?String}
	 */
	loopText: null
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
	buildloop: function (player, controls)  {
		let
			t = this,
			loopTitle = mejs.Utils.isString(t.options.loopText) ? t.options.loopText : mejs.i18n.t('mejs.loop');

		const loop = $(`<div class="${t.options.classPrefix}button ${t.options.classPrefix}loop-button ` +
			`${((player.options.loop) ? `${t.options.classPrefix}loop-on` : `${t.options.classPrefix}loop-off`)}">` +
			`<button type="button" aria-controls="${t.id}" title="${loopTitle}" aria-label="${loopTitle}" tabindex="0"></button>` +
		`</div>`)
		// append it to the toolbar
		.appendTo(controls)
		// add a click toggle event
		.click(() => {
			player.options.loop = !player.options.loop;
			if (player.options.loop) {
				loop.removeClass(`${t.options.classPrefix}loop-off`)
				.addClass(`${t.options.classPrefix}loop-on`);
			} else {
				loop.removeClass(`${t.options.classPrefix}loop-on`)
				.addClass(`${t.options.classPrefix}loop-off`);
			}
		});
	}
});


