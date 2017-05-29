'use strict';

/**
 * Lock button
 *
 * This feature creates a lock button in the control bar that will block access
 * to the controls while active. It can be deactivated by clicking multiple
 * times on the unlock icon.
 */

// Translations (English required)
mejs.i18n.en["mejs.lock"] =  "Lock";
mejs.i18n.en["mejs.unlock"] =  "Unlock";

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {?String}
	 */
	lockText: null,
	/**
	 * @type {?String}
	 */
	unlockText: null,
	/**
	 * @type {Boolean}
	 */
	autohideUnlock: true,
	/**
	 * Number of clicks to unlock
	 * @type {Number}
	 */
	unlockClicks: 3
});

Object.assign(MediaElementPlayer.prototype, {
	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {$} controls
	 * @param {$} layers
	 */
	buildlock (player, controls, layers)  {
		const
			t = this,
			lockText = mejs.Utils.isString(t.options.lockText) ? t.options.lockText : mejs.i18n.t('mejs.lock'),
			unlockText = mejs.Utils.isString(t.options.unlockText) ? t.options.unlockText : mejs.i18n.t('mejs.unlock')
		;
		let locked = false;

		Object.defineProperty(t, 'locked', {
			get: function() {
				return locked;
			},

			set: function(value) {
				locked = value;
				if (locked) {
					t.options.clickToPlayPause = false;
					t.options.disableControls = true;
					t.controls.style.display = 'none';
					t.unlockButton.style.display = '';
				} else {
					t.options.clickToPlayPause = true;
					t.options.disableControls = false;
					t.controls.style.display = '';
					t.unlockButton.style.display = 'none';
				}
			}
		});

		window.player = t;
		window.layers = layers;

		// Unlock button
		player.unlockButton = document.createElement('div');
		player.unlockButton.className = `${t.options.classPrefix}layer ${t.options.classPrefix}unlock-button`;
		player.unlockButton.innerHTML = `<button type="button" title="${unlockText}" aria-label="${unlockText}" tabindex="0"></button>`;
		player.unlockButton.style.display = 'none';
		layers.insertBefore(player.unlockButton, layers.firstChild);

		player.unlockButton.addEventListener('click', () => {
			console.log(unlockText);
		});

		// Lock button
		player.lockButton = document.createElement('div');
		player.lockButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}lock-button`;
		player.lockButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${lockText}" aria-label="${lockText}" tabindex="0"></button>`;
		t.addControlElement(player.lockButton, 'lock');

		// add a click toggle event
		player.lockButton.addEventListener('click', () => {
			t.lock();
			console.log(lockText);
		});
	},

	lock() {
		this.locked = true;
	},

	unlock() {
		this.locked = false;
	}
});
