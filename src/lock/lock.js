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
	 */
	buildlock ()  {
		const
			t = this,
			lockText = mejs.Utils.isString(t.options.lockText) ? t.options.lockText : mejs.i18n.t('mejs.lock'),
			unlockText = mejs.Utils.isString(t.options.unlockText) ? t.options.unlockText : mejs.i18n.t('mejs.unlock'),
			lock = document.createElement('div')
		;
		let locked = false;

		lock.className = `${t.options.classPrefix}button ${t.options.classPrefix}lock-button`;
		lock.innerHTML = `<button type="button" aria-controls="${t.id}" title="${lockText}" aria-label="${lockText}" tabindex="0"></button>`;

		t.addControlElement(lock, 'lock');
		window.player = t;

		Object.defineProperty(t, 'locked', {
			get: function() {
				return locked;
			},

			set: function(value) {
				locked = value;
				if (locked) {
					t.options.clickToPlayPause = false;
					t.controls.style.display = 'none';
				} else {
					t.options.clickToPlayPause = true;
					t.controls.style.display = '';
				}
			}
		});

		// add a click toggle event
		lock.addEventListener('click', () => {
			t.lock();
			console.log(unlockText )
		});
	},

	lock() {
		this.locked = true;
	},

	unlock() {
		this.locked = false;
	}
});
