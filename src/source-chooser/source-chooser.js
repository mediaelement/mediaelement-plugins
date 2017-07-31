'use strict';

/**
 * Source chooser button
 *
 * This feature creates a button to speed media in different levels.
 */

// Translations (English required)
mejs.i18n.en['mejs.source-chooser'] = 'Source Chooser';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {?String}
	 */
	sourcechooserText: null
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
	buildsourcechooser (player, controls, layers, media)  {

		const
			t = this,
			sourceTitle = mejs.Utils.isString(t.options.sourcechooserText) ? t.options.sourcechooserText : mejs.i18n.t('mejs.source-chooser'),
			sources = [],
			children = t.mediaFiles ? t.mediaFiles : t.node.children
		;

		// add to list
		let hoverTimeout;

		for (let i = 0, total = children.length; i < total; i++) {
			const s = children[i];

			if (t.mediaFiles) {
				sources.push(s);
			} else if (s.nodeName === 'SOURCE') {
				sources.push(s);
			}
		}

		if (sources.length <= 1) {
			return;
		}

		player.sourcechooserButton = document.createElement('div');
		player.sourcechooserButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}sourcechooser-button`;
		player.sourcechooserButton.innerHTML =
			`<button type="button" role="button" aria-haspopup="true" aria-owns="${t.id}" title="${sourceTitle}" aria-label="${sourceTitle}" tabindex="0"></button>` +
			`<div class="${t.options.classPrefix}sourcechooser-selector ${t.options.classPrefix}offscreen" role="menu" aria-expanded="false" aria-hidden="true"><ul></ul></div>`;

		t.addControlElement(player.sourcechooserButton, 'sourcechooser');

		for (let i = 0, total = sources.length; i < total; i++) {
			const src = sources[i];
			if (src.type !== undefined && typeof media.canPlayType === 'function') {
				player.addSourceButton(src.src, src.title, src.type, media.src === src.src);
			}
		}

		// hover
		player.sourcechooserButton.addEventListener('mouseover', () => {
			clearTimeout(hoverTimeout);
			player.showSourcechooserSelector();
		});
		player.sourcechooserButton.addEventListener('mouseout', () => {
			hoverTimeout = setTimeout(() => {
				player.hideSourcechooserSelector();
			}, 0);
		});

			// keyboard menu activation
		player.sourcechooserButton.addEventListener('keydown', (e) => {

			if (t.options.keyActions.length) {
				const keyCode = e.which || e.keyCode || 0;

				switch (keyCode) {
					case 32: // space
						if (!mejs.MediaFeatures.isFirefox) { // space sends the click event in Firefox
							player.showSourcechooserSelector();
						}
						player.sourcechooserButton.querySelector('input[type=radio]:checked').focus();
						break;
					case 13: // enter
						player.showSourcechooserSelector();
						player.sourcechooserButton.querySelector('input[type=radio]:checked').focus();
						break;
					case 27: // esc
						player.hideSourcechooserSelector();
						player.sourcechooserButton.querySelector('button').focus();
						break;
					default:
						return true;
				}

				e.preventDefault();
				e.stopPropagation();
			}
		});

		// close menu when tabbing away
		player.sourcechooserButton.addEventListener('focusout', mejs.Utils.debounce(() => {
			// Safari triggers focusout multiple times
			// Firefox does NOT support e.relatedTarget to see which element
			// just lost focus, so wait to find the next focused element
			setTimeout(() => {
				const parent = document.activeElement.closest(`.${t.options.classPrefix}sourcechooser-selector`);
				if (!parent) {
					// focus is outside the control; close menu
					player.hideSourcechooserSelector();
				}
			}, 0);
		}, 100));

		const radios = player.sourcechooserButton.querySelectorAll('input[type=radio]');

		for (let i = 0, total = radios.length; i < total; i++) {
			// handle clicks to the source radio buttons
			radios[i].addEventListener('click', function() {
				// set aria states
				this.setAttribute('aria-selected', true);
				this.checked = true;

				const otherRadios = this.closest(`.${t.options.classPrefix}sourcechooser-selector`).querySelectorAll('input[type=radio]');

				for (let j = 0, radioTotal = otherRadios.length; j < radioTotal; j++) {
					if (otherRadios[j] !== this) {
						otherRadios[j].setAttribute('aria-selected', 'false');
						otherRadios[j].removeAttribute('checked');
					}
				}

				const src = this.value;

				if (media.getSrc() !== src) {
					let currentTime = media.currentTime;

					const
						paused = media.paused,
						canPlayAfterSourceSwitchHandler = () => {
							if (!paused) {
								media.setCurrentTime(currentTime);
								media.play();
							}
							media.removeEventListener('canplay', canPlayAfterSourceSwitchHandler);
						}
					;

					media.pause();
					media.setSrc(src);
					media.load();
					media.addEventListener('canplay', canPlayAfterSourceSwitchHandler);
				}
			});
		}

		// Handle click so that screen readers can toggle the menu
		player.sourcechooserButton.querySelector('button').addEventListener('click', function() {
			if (mejs.Utils.hasClass(mejs.Utils.siblings(this, `.${t.options.classPrefix}sourcechooser-selector`), `${t.options.classPrefix}offscreen`)) {
				player.showSourcechooserSelector();
				player.sourcechooserButton.querySelector('input[type=radio]:checked').focus();
			} else {
				player.hideSourcechooserSelector();
			}
		});

	},

	/**
	 *
	 * @param {String} src
	 * @param {String} label
	 * @param {String} type
	 * @param {Boolean} isCurrent
	 */
	addSourceButton (src, label, type, isCurrent)  {
		const t = this;
		if (label === '' || label === undefined) {
			label = src;
		}
		type = type.split('/')[1];

		t.sourcechooserButton.querySelector('ul').innerHTML += `<li>` +
			`<input type="radio" name="${t.id}_sourcechooser" id="${t.id}_sourcechooser_${label}${type}" ` +
				`role="menuitemradio" value="${src}" ${(isCurrent ? 'checked="checked"' : '')} aria-selected="${isCurrent}"/>` +
			`<label for="${t.id}_sourcechooser_${label}${type}" aria-hidden="true">${label} (${type})</label>` +
		`</li>`;

		t.adjustSourcechooserBox();
	},

	/**
	 *
	 */
	adjustSourcechooserBox ()  {
		const t = this;
		// adjust the size of the outer box
		t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector`).style.height =
			`${parseFloat(t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector ul`).offsetHeight)}px`;
	},

	/**
	 *
	 */
	hideSourcechooserSelector ()  {

		const t = this;

		if (t.sourcechooserButton === undefined || !t.sourcechooserButton.querySelector('input[type=radio]')) {
			return;
		}

		const
			selector = t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector`),
			radios = selector.querySelectorAll('input[type=radio]')
		;
		selector.setAttribute('aria-expanded', 'false');
		selector.setAttribute('aria-hidden', 'true');
		mejs.Utils.addClass(selector, `${t.options.classPrefix}offscreen`);

		// make radios not focusable
		for (let i = 0, total = radios.length; i < total; i++) {
			radios[i].setAttribute('tabindex', '-1');
		}
	},

	/**
	 *
	 */
	showSourcechooserSelector ()  {

		const t = this;

		if (t.sourcechooserButton === undefined || !t.sourcechooserButton.querySelector('input[type=radio]')) {
			return;
		}

		const
			selector = t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector`),
			radios = selector.querySelectorAll('input[type=radio]')
		;
		selector.setAttribute('aria-expanded', 'true');
		selector.setAttribute('aria-hidden', 'false');
		mejs.Utils.removeClass(selector, `${t.options.classPrefix}offscreen`);

		// make radios not focusable
		for (let i = 0, total = radios.length; i < total; i++) {
			radios[i].setAttribute('tabindex', '0');
		}
	}
});