'use strict';

/**
 * Markers Rolls plugin
 *
 * Based in Markers and Postroll plugins.
 *
 * This plugin allows you to add Visual Cues in the progress time rail and inject HTML content in these markers.
 * Every marker answer to a URL to inject the content in the video player when the marker position is reached.
 * Color for markers are configurable.
 */

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * Default marker color
	 * @type {String}
	 */
	markersRollsColor: '#E9BC3D',
	/**
	 * Default marker width
	 * @type {Number}
	 */
	markersRollsWidth: 1,
	/**
	 * @type {Object}
	 */
	markersRolls: {}
});

Object.assign(MediaElementPlayer.prototype, {
	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list.
	 *
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 * @param {HTMLElement} media
	 */
	buildmarkersrolls (player, controls, layers, media)  {
		let currentPosition = -1,
			lastPlayedPosition = -1, // Track backward seek
			lastMarkerRollCallback = -1, // Prevents successive firing of callbacks
			markersCount = Object.keys(player.options.markersRolls).length;

		if (!markersCount) {
			return;
		}

		for (let i = 0, total = markersCount; i < total; ++i) {
			const marker = document.createElement('span');

			marker.className = `${this.options.classPrefix}time-marker`;
			controls.querySelector(`.${this.options.classPrefix}time-total`).appendChild(marker);
		}

		let markersRollsLayer = document.createElement('iframe');
		markersRollsLayer.frameBorder = '0';
        markersRollsLayer.className = `${this.options.classPrefix}markersrolls-layer` + ' '
			+ `${this.options.classPrefix}overlay` + ' '
			+ `${this.options.classPrefix}layer`;
        markersRollsLayer.style.display = 'none';
        markersRollsLayer.style.backgroundColor = '#9F9F9F';
        markersRollsLayer.style.border = '0 none';
        markersRollsLayer.style.boxShadow = '#B0B0B0 0px 0px 20px -10px inset';
		markersRollsLayer.style.paddingBottom = '40px';

        layers.appendChild(markersRollsLayer);

		media.addEventListener('durationchange', () => {
			player.setmarkersrolls(controls);
		});
		media.addEventListener('timeupdate', () => {
			currentPosition = Math.floor(media.currentTime);

			if (lastPlayedPosition > currentPosition) {
				if (lastMarkerRollCallback > currentPosition) {
					lastMarkerRollCallback = -1;
				}
			} else {
				lastPlayedPosition = currentPosition;
			}

			if (0 === markersCount ||
				!player.options.markersRolls[currentPosition] ||
				currentPosition === lastMarkerRollCallback
			) {
				return;
			}

			lastMarkerRollCallback = currentPosition;

			media.pause();

            markersRollsLayer.src = player.options.markersRolls[currentPosition];
            markersRollsLayer.style.display = 'block';
		}, false);
		media.addEventListener('play', () => {
			markersRollsLayer.style.display = 'none';
			markersRollsLayer.src = '';
		}, false);

	},

	/**
	 * Create markers in the progress bar.
	 *
	 * @param {HTMLElement} controls
	 */
	setmarkersrolls (controls)  {
		const markersRolls = controls.querySelectorAll(`.${this.options.classPrefix}time-marker`);

		let i = 0;

		for (let position in this.options.markersRolls) {
			if (!this.options.markersRolls.hasOwnProperty(position)) {
				continue;
            }

			position = parseInt(position);

			if (position >= this.media.duration || position < 0) {
				continue;
			}

			const left = 100 * position / this.media.duration,
				marker = markersRolls[i];

			marker.style.width = this.options.markersRollsWidth + 'px';
			marker.style.left = `${left}%`;
			marker.style.background = this.options.markersRollsColor;

			i++;
		}
	}
});