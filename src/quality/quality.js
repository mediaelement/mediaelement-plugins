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
	qualityText: null,
	/**
	 * @type {boolean}
	 */
	autoGenerate: false,
	/**
	 * @type {boolean}
	 */
	autoDash: false,
	/**
	 * @type {boolean}
	 */
	autoHLS: false,
	/**
	 * @type Function
	 */
	qualityChangeCallback: null
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
			let quality = mediaNode instanceof HTMLElement ? mediaNode.getAttribute('data-quality') : mediaNode['data-quality'];

			if (quality === 'undefined') {
				quality = 'Auto';
				t.options.autoGenerate = true;
			}

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

		let
			currentQuality = '',
			sourceIndex = 0
		;

		media.addEventListener('error', function(e) {
			if (e.message === 'No renderer found' &&
				qualityMap.get(currentQuality).length > sourceIndex + 1 ) {
				sourceIndex = sourceIndex + 1;
				const nextSource = qualityMap.get(currentQuality)[sourceIndex].src;
				media.setSrc(nextSource); // ensure the default sources to set to play
				media.load();
			}
		});

		media.addEventListener('loadedmetadata', function () {
			// eslint-disable-next-line
			if (!!media.hlsPlayer) {
				const levels = media.hlsPlayer.levels;
				if (t.options.autoGenerate && levels.length > 1) {
					levels.forEach(function (level) {
						const height = level.height;
						const quality = t.getQualityFromHeight(height);
						t.addValueToKey(qualityMap, quality, '');
					});
					t.options.autoHLS = true;
					t.generateQualityButton(t, player, media, qualityMap, currentQuality);
				}
				// eslint-disable-next-line
			} else if (!!media.dashPlayer) {
				const bitrates = media.dashPlayer.getBitrateInfoListFor("video");
				if (t.options.autoGenerate && bitrates.length > 1) {
					bitrates.forEach(function (level) {
						const height = level.height;
						const quality = t.getQualityFromHeight(height);
						t.addValueToKey(qualityMap, quality, '');
					});
					t.options.autoDash = true;
					t.generateQualityButton(t, player, media, qualityMap, currentQuality);
				}
			}
		});

		t.generateQualityButton(t, player, media, qualityMap, currentQuality);
	},
	generateQualityButton (t, player, media, qualityMap, currentQuality) {
		t.cleanquality(player);

		const
			qualityTitle = mejs.Utils.isString(t.options.qualityText) ? t.options.qualityText : mejs.i18n.t('mejs.quality-chooser'),
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
		currentQuality = defaultValue;

		// Get initial quality
		const generateId = Math.floor(Math.random() * 100);
		player.qualitiesContainer = document.createElement('div');
		player.qualitiesContainer.className = `${t.options.classPrefix}button ${t.options.classPrefix}qualities-button`;
		player.qualitiesContainer.innerHTML = `<button type="button" title="${qualityTitle}" aria-label="${qualityTitle}" aria-controls="qualitieslist-${generateId}" aria-expanded="false">${defaultValue}</button>` +
			`<div class="${t.options.classPrefix}qualities-selector ${t.options.classPrefix}offscreen">` +
			`<ul class="${t.options.classPrefix}qualities-selector-list" id="qualitieslist-${generateId}" tabindex="-1"></ul></div>`;

		t.addControlElement(player.qualitiesContainer, 'qualities');

		qualityMap.forEach(function (value, key) {
			if (key !== 'map_keys_1') {
				const
					src = value[0],
					quality = key,
					inputId = `${t.id}-qualities-${quality}`
				;
				player.qualitiesContainer.querySelector('ul').innerHTML += `<li class="${t.options.classPrefix}qualities-selector-list-item">` +
					`<input class="${t.options.classPrefix}qualities-selector-input ${(quality === defaultValue ? `${t.options.classPrefix}qualities-selected-input` : '')}" type="radio" name="${t.id}_qualities" disabled="disabled" ` +
					`value="${quality}" id="${inputId}" ${(quality === defaultValue ? ' checked="checked"' : '')} />` +
					`<label for="${inputId}" class="${t.options.classPrefix}qualities-selector-label ${(quality === defaultValue ? ` ${t.options.classPrefix}qualities-selected` : '')}">` +
					`${src.title || quality} </label></li>`;
			}
		});

		let isHidden = true;
		const
			qualityContainer = player.qualitiesContainer,
			qualityButton = player.qualitiesContainer.querySelector(`button`),
			qualitiesSelector = player.qualitiesContainer.querySelector(`.${t.options.classPrefix}qualities-selector`),
			qualitiesList = player.qualitiesContainer.querySelector(`.${t.options.classPrefix}qualities-selector-list`),
			// Enable inputs after they have been appended to controls to avoid tab and up/down arrow focus issues
			radios = player.qualitiesContainer.querySelectorAll('input[type="radio"]'),
			labels = player.qualitiesContainer.querySelectorAll(`.${t.options.classPrefix}qualities-selector-label`)
		;

		function hideSelector() {
			mejs.Utils.addClass(qualitiesSelector, `${t.options.classPrefix}offscreen`);
			qualityButton.setAttribute('aria-expanded', 'false');
			qualityButton.focus();
			isHidden = true;
		}

		function showSelector() {
			mejs.Utils.removeClass(qualitiesSelector, `${t.options.classPrefix}offscreen`);
			qualitiesSelector.style.height = `${qualitiesSelector.querySelector('ul').offsetHeight}px`;
			qualitiesSelector.style.top = `${(-1 * parseFloat(qualitiesSelector.offsetHeight))}px`;
			qualityButton.setAttribute('aria-expanded', 'true');
			qualitiesSelector.querySelector('.' + t.options.classPrefix + 'qualities-selected-input').focus();
			isHidden = false;
		}

		qualityButton.addEventListener('click', () => {
			if (isHidden === true) {
				showSelector();
			} else {
				hideSelector();
			}
		});

		qualitiesList.addEventListener('focusout',  (event) =>{
			if (!qualityContainer.contains(event.relatedTarget)) {
				hideSelector();
			}
		});

		qualityButton.addEventListener('mouseenter',  () =>{
			showSelector();
		});

		qualityContainer.addEventListener('mouseleave',  () =>{
			hideSelector();
		});

		// Close with Escape key.
		// Allow up/down arrow to change the selected radio without changing the volume.
		qualityContainer.addEventListener('keydown', (event) => {
			if(event.key === "Escape"){
				hideSelector();
			}

			event.stopPropagation();
		});

		for (let i = 0, total = radios.length; i < total; i++) {
			const radio = radios[i];
			radio.disabled = false;
			radio.addEventListener('change', function () {
				if (t.options.autoDash) {
					t.updateQualityButton(this, player, currentQuality);
					t.switchDashQuality(player, media);
				} else if (t.options.autoHLS) {
					t.updateQualityButton(this, player, currentQuality);
					t.switchHLSQuality(player, media);
				} else {
					currentQuality = t.updateQualityButton(this, player, currentQuality);

					let currentTime = media.currentTime;
					const paused = media.paused;

					if (!paused) {
						media.pause();
					}
					t.updateVideoSource(media, qualityMap, currentQuality);
					media.setSrc(qualityMap.get(currentQuality)[0].src);
					media.load();
					media.dispatchEvent(mejs.Utils.createEvent('seeking', media));
					if (!paused) {
						media.play();
					}
					media.addEventListener('canplay', function canPlayAfterSourceSwitchHandler () {
						media.setCurrentTime(currentTime);
						media.removeEventListener('canplay', canPlayAfterSourceSwitchHandler);
					});
				}
				if (t.options.qualityChangeCallback) {
					t.options.qualityChangeCallback(media, media.originalNode, newQuality)
				}
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

	},

	/**
	 * Feature destructor.
	 *
	 * Always has to be prefixed with `clean` and the name that was used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 */
	cleanquality (player) {
		if (player) {
			if (player.qualitiesContainer) {
				player.qualitiesContainer.remove();
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
			map.get('map_keys_1').push(key);
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
		return -1 < map.get('map_keys_1').indexOf(searchKey);
	},

	/**
	 * Responsible for switching the video source when quality source was auto created from dash manifest
	 * @param {MediaElementPlayer} player
	 * @param {MediaElement} media
	 */
	switchDashQuality (player, media) {
		const radios = player.qualitiesContainer.querySelectorAll('input[type="radio"]');
		for (let index = 0; index < radios.length; index++) {
			if (radios[index].checked) {
				if (index === 0 ) {
					media.dashPlayer.setAutoSwitchQuality(true);
				} else {
					media.dashPlayer.setAutoSwitchQuality(false);
					media.dashPlayer.setQualityFor("video", index - 1);
				}
			}
		}
	},

	/**
	 * Responsible for switching the video source when quality source was auto created from hls manifest
	 * @param {MediaElementPlayer} player
	 * @param {MediaElement} media
	 */
	switchHLSQuality (player, media) {
		const radios = player.qualitiesContainer.querySelectorAll('input[type="radio"]');
		for (let index = 0; index < radios.length; index++) {
			if (radios[index].checked) {
				if (index === 0 ) {
					media.hlsPlayer.currentLevel = -1;
				} else {
					media.hlsPlayer.currentLevel = index - 1;
				}
			}
		}
	},

	/**
	 * Responsible for switching the video source when quality source was auto created from dash manifest
	 * @param {Element} self the check quality radio button
	 * @param {MediaElementPlayer} player
	 */
	updateQualityButton (self, player) {
		const t = this;
		const
			newQuality = self.value
		;

		const formerSelected = player.qualitiesContainer.querySelectorAll(`.${t.options.classPrefix}qualities-selected`);
		for (let i = 0, total = formerSelected.length; i < total; i++) {
			mejs.Utils.removeClass(formerSelected[i], `${t.options.classPrefix}qualities-selected`);
			formerSelected[i].parentElement.querySelector('input').classList.remove(`${t.options.classPrefix}qualities-selected-input`);
		}

		self.checked = true;
		const currentSelected = mejs.Utils.siblings(self, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}qualities-selector-label`));
		for (let j = 0, total = currentSelected.length; j < total; j++) {
			mejs.Utils.addClass(currentSelected[j], `${t.options.classPrefix}qualities-selected`);
			currentSelected[j].parentElement.querySelector('input').classList.add(`${t.options.classPrefix}qualities-selected-input`);
		}

		player.qualitiesContainer.querySelector('button').innerHTML = newQuality;
		return newQuality;
	},

	/**
	 * Returns the quality represnetaion base on the height of the loaded video
	 * @param {Number} height the pixel height of the video
	 **/
	getQualityFromHeight (height) {
		if (height >= 4320) {
			return "8K UHD";
		} else if (height >= 2160) {
			return "UHD";
		} else if (height >= 1440) {
			return "QHD";
		} else if (height >= 1080) {
			return "FHD";
		} else if (height >= 720) {
			return "HD";
		} else {
			return "SD";
		}
	}
});
