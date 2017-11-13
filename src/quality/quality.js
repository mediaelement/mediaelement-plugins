'use strict';

/**
 * Qualities feature
 *
 * This feature allows the generation of a menu with different video/audio qualities, depending of the elements set
 * in the <source> tags, such as `title` and `data-quality`
 */

// Translations (English required)
mejs.i18n.en['mejs.quality-chooser'] = 'Quality Chooser';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {String}
	 */
	defaultQuality: 'auto',
	/**
	 * @type {String}
	 */
	qualityText: null
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
	buildquality (player, controls, layers, media) {
		const
			t = this,
			children = t.mediaFiles ? t.mediaFiles : t.node.children,
			qualityMap = new Map()
		;

		for (let i = 0, total = children.length; i < total; i++) {
			const mediaNode = children[i];
			const quality = mediaNode instanceof HTMLElement ? mediaNode.getAttribute('data-quality') : mediaNode['data-quality'];

			if (t.mediaFiles) {
				const source = document.createElement('source');
				source.src = mediaNode['src'];
				source.type = mediaNode['type'];

				t.addValueToKey(qualityMap, quality, source);
			} else if (mediaNode.nodeName === 'SOURCE') {
				t.addValueToKey(qualityMap, quality, mediaNode);
			}
		}

		if (qualityMap.size <= 1) {
			return;
		}

		t.cleanquality(player);

		const
			qualityTitle = mejs.Utils.isString(t.options.qualityText) ? t.options.qualityText : mejs.i18n.t('mejs.quality-quality'),
			getQualityNameFromValue = (value) => {
				let label;
				if (value === 'auto') {
					const keyExist = t.keyExist(qualityMap, value);
					if (keyExist) {
						label = value;
					} else {
						let keyValue = t.getMapIndex(qualityMap, 0);
						label = keyValue.key;
					}
				} else {
					label = value;
				}
				return label;
			},
			defaultValue = getQualityNameFromValue(t.options.defaultQuality)
		;

		// Get initial quality

		player.qualitiesButton = document.createElement('div');
		player.qualitiesButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}qualities-button`;
		player.qualitiesButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${qualityTitle}" ` +
			`aria-label="${qualityTitle}" tabindex="0">${defaultValue}</button>` +
			`<div class="${t.options.classPrefix}qualities-selector ${t.options.classPrefix}offscreen">` +
			`<ul class="${t.options.classPrefix}qualities-selector-list"></ul>` +
			`</div>`;

		t.addControlElement(player.qualitiesButton, 'qualities');

		media.setSrc(qualityMap.get(defaultValue)[0].src); // ensure the default sources to set to play 
		media.load();

		qualityMap.forEach(function (value, key) {
			if (key !== 'map_keys_1') {
				const
					src = value[0],
					quality = key,
					inputId = `${t.id}-qualities-${quality}`
				;
				player.qualitiesButton.querySelector('ul').innerHTML += `<li class="${t.options.classPrefix}qualities-selector-list-item">` +
					`<input class="${t.options.classPrefix}qualities-selector-input" type="radio" name="${t.id}_qualities"` +
					`disabled="disabled" value="${quality}" id="${inputId}"  ` +
					`${(quality === defaultValue ? ' checked="checked"' : '')}/>` +
					`<label for="${inputId}" class="${t.options.classPrefix}qualities-selector-label` +
					`${(quality === defaultValue ? ` ${t.options.classPrefix}qualities-selected` : '')}">` +
					`${src.title || quality}</label>` +
					`</li>`;
			}
		});
		const
			inEvents = ['mouseenter', 'focusin'],
			outEvents = ['mouseleave', 'focusout'],
			// Enable inputs after they have been appended to controls to avoid tab and up/down arrow focus issues
			radios = player.qualitiesButton.querySelectorAll('input[type="radio"]'),
			labels = player.qualitiesButton.querySelectorAll(`.${t.options.classPrefix}qualities-selector-label`),
			selector = player.qualitiesButton.querySelector(`.${t.options.classPrefix}qualities-selector`)
		;

		// hover or keyboard focus
		for (let i = 0, total = inEvents.length; i < total; i++) {
			player.qualitiesButton.addEventListener(inEvents[i], () => {
				mejs.Utils.removeClass(selector, `${t.options.classPrefix}offscreen`);
				selector.style.height = `${selector.querySelector('ul').offsetHeight}px`;
				selector.style.top = `${(-1 * parseFloat(selector.offsetHeight))}px`;
			});
		}

		for (let i = 0, total = outEvents.length; i < total; i++) {
			player.qualitiesButton.addEventListener(outEvents[i], () => {
				mejs.Utils.addClass(selector, `${t.options.classPrefix}offscreen`);
			});
		}

		for (let i = 0, total = radios.length; i < total; i++) {
			const radio = radios[i];
			radio.disabled = false;
			radio.addEventListener('change', function () {
				const
					self = this,
					newQuality = self.value
				;

				const selected = player.qualitiesButton.querySelectorAll(`.${t.options.classPrefix}qualities-selected`);
				for (let i = 0, total = selected.length; i < total; i++) {
					mejs.Utils.removeClass(selected[i], `${t.options.classPrefix}qualities-selected`);
				}

				self.checked = true;
				const siblings = mejs.Utils.siblings(self, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}qualities-selector-label`));
				for (let j = 0, total = siblings.length; j < total; j++) {
					mejs.Utils.addClass(siblings[j], `${t.options.classPrefix}qualities-selected`);
				}

				let currentTime = media.currentTime;

				const paused = media.paused;

				player.qualitiesButton.querySelector('button').innerHTML = newQuality;
				if (!paused) {
					media.pause();
				}
				t.updateVideoSource(media, qualityMap, newQuality);
				media.setSrc(qualityMap.get(newQuality)[0].src);
				media.load();
				media.dispatchEvent(mejs.Utils.createEvent('seeking', media));
				if (!paused) {
					media.play();
				}
				media.addEventListener('canplay', function canPlayAfterSourceSwitchHandler () {
					media.setCurrentTime(currentTime);
					media.removeEventListener('canplay', canPlayAfterSourceSwitchHandler);
				});
			});
		}
		for (let i = 0, total = labels.length; i < total; i++) {
			labels[i].addEventListener('click', function () {
				const
					radio = mejs.Utils.siblings(this, (el) => el.tagName === 'INPUT')[0],
					event = mejs.Utils.createEvent('click', radio)
				;
				radio.dispatchEvent(event);
			});
		}

		//Allow up/down arrow to change the selected radio without changing the volume.
		selector.addEventListener('keydown', (e) => {
			e.stopPropagation();
		});
		media.setSrc(qualityMap.get(defaultValue)[0].src);
	},

	/**
	 * Feature destructor.
	 *
	 * Always has to be prefixed with `clean` and the name that was used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 */
	cleanquality (player) {
		if (player) {
			if (player.qualitiesButton) {
				player.qualitiesButton.remove();
			}
		}
	},

	/**
	 * Populate the source map
	 * @param {Map} map the map the quality source is being added
	 * @param {String} key the key to the quality source (value stored in data-quality)
	 * @param {String} value the the video.source tag
	 */
	addValueToKey (map, key, value) {
		if (map.has('map_keys_1')) {
			map.get('map_keys_1').push(key.toLowerCase());
		} else {
			map.set('map_keys_1', []);
		}
		if (map.has(key)) {
			map.get(key).push(value);
		} else {
			map.set(key, []);
			map.get(key).push(value);
		}
	},

	/**
	 * Set the source tag for the mejs player
	 * @param {MediaElement} media
	 * @param {Map} map the map containing the video quality source tags
	 * @param {String} key the user selected quality
	 */
	updateVideoSource (media, map, key) {
		this.cleanMediaSource(media);
		let sources = map.get(key);
		for (let i = 0; i < media.children.length; i++) {
			let mediaNode = media.children[i];
			if (mediaNode.tagName === 'VIDEO') {
				sources.forEach(function (sourceElement) {
					mediaNode.appendChild(sourceElement);
				});
			}
		}
	},

	/**
	 * Remove all the source tag for the mejs player
	 * @param {MediaElement} media
	 */
	cleanMediaSource (media) {
		for (let i = 0; i < media.children.length; i++) {
			let mediaNode = media.children[i];
			if (mediaNode.tagName === 'VIDEO') {
				while (mediaNode.firstChild) {
					mediaNode.removeChild(mediaNode.firstChild);
				}
			}
		}
	},

	/**
	 * Search a map for a value key pair stored at a specified index
	 * @param {Map} map the map being searched
	 * @param {Number} index the index of the requested key value pair
	 * @return {Object} a key:value object
	 */
	getMapIndex (map, index) {
		let counter = -1;
		let keyValue = {};
		map.forEach(function (value, key) {

			if (counter === index) {
				keyValue.key = key;
				keyValue.value = value;
			}
			counter++;
		});
		return keyValue;
	},

	/**
	 * Returns flag for whether or not a given key exist in a give map
	 * @param {Map} map the map being searched
	 * @param {String} searchKey the map searching being searched
	 * @return {boolean}
	 */
	keyExist (map, searchKey) {
		return -1 < map.get('map_keys_1').indexOf(searchKey.toLowerCase());
	}
});
