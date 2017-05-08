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

		// bail early if not available
		if (!window.WebKitPlaybackTargetAvailabilityEvent) {
			return;
		}

		const
			t = this,
			airPlayTitle = mejs.Utils.isString(t.options.airPlayText) ? t.options.airPlayText : 'AirPlay',
			button = document.createElement('div')
		;

		button.className = `${t.options.classPrefix}button ${t.options.classPrefix}airplay-button`;
		button.innerHTML = `<button type="button" aria-controls="${t.id}" title="${airPlayTitle}" aria-label="${airPlayTitle}" tabindex="0"></button>`;

		button.addEventListener('click', () => {
			t.media.originalNode.webkitShowPlaybackTargetPicker();
		});

		const acceptAirPlay = t.media.originalNode.getAttribute('x-webkit-airplay');
		if (!acceptAirPlay || acceptAirPlay !== 'allow') {
			t.media.originalNode.setAttribute('x-webkit-airplay', 'allow');
		}

		t.media.originalNode.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', () => {
			const
				name = t.media.originalNode.webkitCurrentPlaybackTargetIsWireless ? 'Started' : 'Stopped',
				status = t.media.originalNode.webkitCurrentPlaybackTargetIsWireless ? 'active' : '',
				icon = button.querySelector('button'),
				event = mejs.Utils.createEvent(`airplay${name}`, t.media)
			;
			t.media.dispatchEvent(event);

			if (status === 'active') {
				mejs.Utils.addClass(icon, 'active');
			} else {
				mejs.Utils.removeClass(icon, 'active');
			}
		});

		t.media.originalNode.addEventListener('webkitplaybacktargetavailabilitychanged', (e) => {
			if (e.availability === 'available') {
				t.addControlElement(button, 'airplay');
			}
		});
	}
});


