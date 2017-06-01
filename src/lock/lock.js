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
	unlockClicks: 3,
	/**
	 * The amount of time in which to register the unlock clicks in milliseconds
	 * @type {Number}
	 */
	unlockTimeWindow: 2000
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
	buildlock (player, controls, layers, media)  {
		const
			t = this,
			lockText = mejs.Utils.isString(t.options.lockText) ? t.options.lockText : mejs.i18n.t('mejs.lock'),
			unlockText = mejs.Utils.isString(t.options.unlockText) ? t.options.unlockText : mejs.i18n.t('mejs.unlock')
		;
		let
			clicks = 0,
			locked = false,
			timeouts = [];

		// Unlock button
		player.unlockButton = document.createElement('div');
		player.unlockButton.className = `${t.options.classPrefix}layer ${t.options.classPrefix}unlock-button`;
		player.unlockButton.innerHTML = `<button type="button" title="${unlockText}" aria-label="${unlockText}" tabindex="0"></button>`;
		player.unlockButton.style.display = 'none';
		layers.insertBefore(player.unlockButton, layers.firstChild);

		player.unlockButton.addEventListener('click', () => {
			clicks += 1;
			if (clicks >= t.options.unlockClicks) {
				while(timeouts.length > 0) {
					clearTimeout(timeouts.pop());
				}
				t.unlock();
			}
			timeouts.push(setTimeout(() => {
				clicks -= 1;
				if (clicks === 0 && t.options.autohideUnlock) {
					player.unlockButton.style.display = 'none';
				}
			}, t.options.unlockTimeWindow));
		});

		// Lock button
		player.lockButton = document.createElement('div');
		player.lockButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}lock-button`;
		player.lockButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${lockText}" aria-label="${lockText}" tabindex="0"></button>`;
		t.addControlElement(player.lockButton, 'lock');

		// add a click toggle event
		player.lockButton.addEventListener('click', () => {
			t.lock();
		});

		/**
		 * Show unlock button
		 *
		 *@private
		 */
		const showUnlock = () => {
			player.unlockButton.style.display = '';
			setTimeout(() => {
				if (clicks === 0 && t.options.autohideUnlock) {
					player.unlockButton.style.display = 'none'
				}
			}, t.options.unlockTimeWindow);
		}

		Object.defineProperty(t, 'locked', {
			get: function() {
				return locked;
			},

			set: function(value) {
				if (locked === value) {
					return;
				}
				locked = value;
				if (locked) {
					clicks = 0;
					media.addEventListener('click', showUnlock)
					t.options.clickToPlayPause = false;
					t.options.disableControls();
					if (!t.options.autohideUnlock) {
						t.unlockButton.style.display = '';
					}
				} else {
					media.removeEventListener('click', showUnlock)
					t.options.clickToPlayPause = true;
					t.options.enableControls();
					t.unlockButton.style.display = 'none';
				}
			}
		});
	},

	lock() {
		this.locked = true;
	},

	unlock() {
		this.locked = false;
	}
});
