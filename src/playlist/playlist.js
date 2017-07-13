'use strict';

/**
 * Playlist plugin
 *
 * This feature allows you to create a video/audio playlist
 */

// Translations (English required)
mejs.i18n.en['mejs.playlist'] = 'Toggle Playlist';
mejs.i18n.en['mejs.playlist-prev'] = 'Previous';
mejs.i18n.en['mejs.playlist-next'] = 'Next';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * List to be played; each object MUST have `src` and `title`; other items: `data-thumbnail`, `type`, `description`
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
	nextText: null,
	/**
	 * @type {?String}
	 */
	playlistTitle: null
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
	buildplaylist (player, controls, layers, media)  {

		const
			defaultPlaylistTitle = mejs.i18n.t('mejs.playlist'),
			playlistTitle = mejs.Utils.isString(player.options.playlistTitle) ? player.options.playlistTitle : defaultPlaylistTitle
		;

		if (player.createPlayList_()) {
			return;
		}

		player.currentPlaylistItem = 0;
		player.originalControlsIndex = controls.style.zIndex;
		controls.style.zIndex = 5;

		player.playlistLayer = document.createElement('div');
		player.playlistLayer.className = `${player.options.classPrefix}playlist-layer  ${player.options.classPrefix}layer ${(player.isVideo ? `${player.options.classPrefix}playlist-hidden` : '')} ${player.options.classPrefix}playlist-selector`;
		player.playlistLayer.innerHTML = `<ul class="${player.options.classPrefix}playlist-selector-list"></ul>`;
		layers.insertBefore(player.playlistLayer, layers.firstChild);

		for (let i = 0, total = player.listItems.length; i < total; i++) {
			player.playlistLayer.querySelector('ul').innerHTML += player.listItems[i];
		}

		if (player.isVideo) {
			player.playlistButton = document.createElement('div');
			player.playlistButton.className = `${player.options.classPrefix}button ${player.options.classPrefix}playlist-button`;
			player.playlistButton.innerHTML = `<button type="button" aria-controls="${player.id}" title="${playlistTitle}" aria-label="${playlistTitle}" tabindex="0"></button>`;
			player.playlistButton.addEventListener('click', function () {
				mejs.Utils.toggleClass(player.playlistLayer, `${player.options.classPrefix}playlist-hidden`);
			});
			player.addControlElement(player.playlistButton, 'playlist');
		} else {
			const items = player.playlistLayer.querySelectorAll('li');

			if (items.length <= 10) {
				let height = 0;
				for (let i = 0, total = items.length; i < total; i++) {
					height += items[i].offsetHeight;
				}
				player.container.style.height = `${height}px`;
			}
		}

		player.endedCallback = () => {
			if (player.currentPlaylistItem < player.totalItems) {
				player.setSrc(player.playlist[++player.currentPlaylistItem]);
				player.load();
				player.play();
			} else {
				mejs.Utils.addClass(nextButton, `${this.options.classPrefix}off`);
			}
		};

		player.keydownCallback = function (e) {
			const event = mejs.Utils.createEvent('click', e.target);
			e.target.dispatchEvent(event);
			return false;
		};

		// Once current element has ended, proceed to play next one
		media.addEventListener('ended', player.endedCallback);

		const
			items = player.playlistLayer.querySelectorAll(`.${player.options.classPrefix}playlist-selector-list-item`),
			inputs = player.playlistLayer.querySelectorAll('input[type=radio]')
		;

		for (let i = 0, total = inputs.length; i < total; i++) {
			inputs[i].addEventListener('click', function () {
				const
					radios = player.playlistLayer.querySelectorAll('input[type="radio"]'),
					selected = player.playlistLayer.querySelectorAll(`.${player.options.classPrefix}playlist-selected`)
				;

				for (let j = 0, total2 = radios.length; j < total2; j++) {
					radios[j].checked = false;
				}
				for (let j = 0, total2 = selected.length; j < total2; j++) {
					mejs.Utils.removeClass(selected[j], `${player.options.classPrefix}playlist-selected`);
				}

				this.checked = true;
				mejs.Utils.addClass(this.parentNode, `${player.options.classPrefix}playlist-selected`);
				player.currentPlaylistItem = this.getAttribute('data-playlist-index');
				player.setSrc(this.value);
				player.load();
				player.play();

				if (player.isVideo) {
					mejs.Utils.toggleClass(player.playlistLayer, `${player.options.classPrefix}playlist-hidden`);
				}
			});
		}

		for (let i = 0, total = items.length; i < total; i++) {
			items[i].addEventListener('click',  function () {
				const
					radio = mejs.Utils.siblings(this.querySelector(`.${player.options.classPrefix}playlist-selector-label`), (el) => el.tagName === 'INPUT')[0],
					event = mejs.Utils.createEvent('click', radio)
				;
				radio.dispatchEvent(event);
			});
		}

		//Allow up/down arrow to change the selected radio without changing the volume.
		player.playlistLayer.addEventListener('keydown', function (e) {
			const keyCode = e.which || e.keyCode || 0;
			if (~[13, 32, 38, 40].indexOf(keyCode)) {
				player.keydownCallback(e);
			}
		});
	},
	cleanplaylist (player, controls, layers, media) {
		media.removeEventListener('ended', player.endedCallback_);
	},
	buildprevtrack (player)  {

		const
			defaultPrevTitle = mejs.i18n.t('mejs.playlist-prev'),
			prevTitle = mejs.Utils.isString(player.options.prevText) ? player.options.prevText : defaultPrevTitle
		;
		player.prevButton = document.createElement('div');
		player.prevButton.className = `${player.options.classPrefix}button ${player.options.classPrefix}prev-button`;
		player.prevButton.innerHTML = `<button type="button" aria-controls="${player.id}" title="${prevTitle}" aria-label="${prevTitle}" tabindex="0"></button>`;

		player.prevPlaylistCallback_= () => {
			if (player.playlist[--player.currentPlaylistItem]) {
				player.setSrc(player.playlist[player.currentPlaylistItem].src);
				player.load();
				player.play();
			} else {
				++player.currentPlaylistItem;
			}
		};

		player.prevButton.addEventListener('click', player.prevPlaylistCallback_);
		player.addControlElement(player.prevButton, 'prevtrack');
	},
	cleanprevtrack (player) {
		player.prevButton.removeEventListener('click', player.prevPlaylistCallback_);
	},
	buildnexttrack (player)  {
		const
			defaultNextTitle = mejs.i18n.t('mejs.playlist-next'),
			nextTitle = mejs.Utils.isString(player.options.nextText) ? player.options.nextText : defaultNextTitle
		;
		player.nextButton = document.createElement('div');
		player.nextButton.className = `${player.options.classPrefix}button ${player.options.classPrefix}next-button`;
		player.nextButton.innerHTML = `<button type="button" aria-controls="${player.id}" title="${nextTitle}" aria-label="${nextTitle}" tabindex="0"></button>`;

		player.nextPlaylistCallback_= () => {
			if (player.playlist[++player.currentPlaylistItem]) {
				player.setSrc(player.playlist[player.currentPlaylistItem].src);
				player.load();
				player.play();
			} else {
				--player.currentPlaylistItem;
			}
		};

		player.nextButton.addEventListener('click', player.nextPlaylistCallback_);
		player.addControlElement(player.nextButton, 'nexttrack');
	},
	cleannexttrack (player) {
		player.nextButton.removeEventListener('click', player.nextPlaylistCallback_);
	},
	createPlayList_ () {
		const t = this;

		t.playlist = t.options.playlist.length ? t.options.playlist : [];

		if (!t.playlist.length) {
			const children = t.mediaFiles || t.media.originalNode.children;

			for (let i = 0, total = children.length; i < total; i++) {
				const childNode = children[i];

				if (childNode.tagName.toLowerCase() === 'source') {
					const elements = {};
					Array.prototype.slice.call(childNode.attributes).forEach((item) => {
						elements[item.name] = item.value;
					});

					// Make sure src, type and title are available
					if (elements.src && elements.type && elements.title) {
						elements.type = mejs.Utils.formatType(elements.src, elements.type);
						t.playlist.push(elements);
					}
				}
			}
		}

		if (t.playlist.length < 2) {
			return;
		}

		t.listItems = [];
		for (let i = 0, total = t.playlist.length; i < total; i++) {
			const
				element = t.playlist[i],
				item = document.createElement('li'),
				id = `${t.id}_playlist_item_${i}`,
				thumbnail = element['data-playlist-thumbnail'] ? `<div class="${t.options.classPrefix}playlist-item-thumbnail"><img tabindex="-1" src="${element['data-playlist-thumbnail']}"></div>` : '',
				description = element['data-playlist-description'] ? `<div class="${t.options.classPrefix}playlist-item-description">${element['data-playlist-description']}</div>` : ''
			;
			item.tabIndex = 0;
			item.classList = `${t.options.classPrefix}playlist-selector-list-item`;
			item.innerHTML = `<div class="${t.options.classPrefix}playlist-item-inner">` +
				`${thumbnail}` +
				`<div class="${t.options.classPrefix}playlist-item-content">` +
				`<div><input type="radio" class="${t.options.classPrefix}playlist-selector-input" ` +
				`name="${t.id}_playlist" id="${id}" data-index="${i}" value="${element.src}" disabled>` +
				`<label class="${t.options.classPrefix}playlist-selector-label" ` +
				`for="${id}">${(element.title || i)}</label></div>${description}</div></div>`;

			t.listItems.push(item.outerHTML);
		}
	}
});