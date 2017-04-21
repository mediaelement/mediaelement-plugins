'use strict';

/**
 * Airplay button
 *
 * This feature creates an AirPlay button that enhances native AirPlay capabilities, if found
 */

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {?String}
	 */
	airPlayText: null
});

Object.assign(MediaElementPlayer.prototype, {
	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 */
	buildairplay ()  {
		const
			t = this,
			airPlayTitle = mejs.Utils.isString(t.options.airPlayText) ? t.options.airPlayText : 'AirPlay',
			button = document.createElement('div')
		;

		button.className = `${t.options.classPrefix}button ${t.options.classPrefix}airplay-button`;
		button.innerHTML = `<button type="button" aria-controls="${t.id}" title="${airPlayTitle}" aria-label="${airPlayTitle}" tabindex="0"></button>`;

		button.addEventListener('click', () => {
			t.media.originaNode.webkitShowPlaybackTargetPicker();

			const event = mejs.Utils.createEvent('airplayStart', t.media);
			t.media.dispatchEvent(event);
		});

		const acceptAirPlay = t.media.originalNode.getAttribute('x-webkit-airplay');
		if (!acceptAirPlay || acceptAirPlay !== 'allow') {
			t.media.originalNode.setAttribute('x-webkit-airplay', 'allow');
		}

		// Detect if AirPlay is available
		// Mac OS Safari 9+ only
		if (window.WebKitPlaybackTargetAvailabilityEvent) {

			t.media.originalNode.addEventListener('webkitplaybacktargetavailabilitychanged', function(e) {
				switch (e.availability) {
					case 'available':
						player.on('loadeddata', () => {
							t.addControlElement(button, 'airplay');
						});
						break;

					case 'not-available':
						break;
				}
			});

		};
	}
});


