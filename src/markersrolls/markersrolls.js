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
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 * @param {HTMLElement} media
	 */
	buildmarkersrolls(player, controls, layers, media) {
		const {markersRollsColor, markersRollsWidth, markersRolls, classPrefix} = player.options;
		const controlsTotalTime = controls.querySelector(`.${classPrefix}time-total`);

		let currentPosition = -1,
			lastPlayedPosition = -1, // Track backward seek
			lastMarkerRollCallback = -1, // Prevents successive firing of callbacks
			markersAreRendered = false;

		const markersCount = Object.keys(markersRolls).length;

		if (!markersCount) {
			return;
		}

		/**
		 * @returns {HTMLIFrameElement}
		 */
		function createIframeLayer() {
			const layer = document.createElement('iframe');

			layer.frameBorder = '0';
			layer.className = `${classPrefix}markersrolls-layer ${classPrefix}overlay ${classPrefix}layer`;
			layer.style.display = 'none';
			layer.style.backgroundColor = '#9F9F9F';
			layer.style.border = '0 none';
			layer.style.boxShadow = '#B0B0B0 0px 0px 20px -10px inset';
			layer.style.paddingBottom = '40px';

			return layer;
		}

		/**
		 * @param {Number} markerPosition
		 * @param {Number} duration
		 * @returns {HTMLSpanElement}
		 */
		function createMarker({markerPosition, duration}) {
			const marker = document.createElement('span');

			marker.className = `${classPrefix}time-marker`;
			marker.style.width = `${markersRollsWidth}px`;
			marker.style.left = `${100 * markerPosition / duration}%`;
			marker.style.background = markersRollsColor;

			return marker;
		}

		const markersRollsLayer = createIframeLayer();

		layers.appendChild(markersRollsLayer);

		/**
		 * Create markers in the progress bar.
		 */
		function tryRenderMarkers() {
			if (markersAreRendered) {
				return;
			}

			const duration = media.getDuration();

			if (!duration) {
				return;
			}

			for (let markerPosition in markersRolls) {
				if (!markersRolls.hasOwnProperty(markerPosition)) {
					continue;
				}

				markerPosition = parseInt(markerPosition);

				if (markerPosition >= duration || markerPosition < 0) {
					continue;
				}

				const marker = createMarker({
					markerPosition,
					duration
				});

				controlsTotalTime.appendChild(marker);
			}

			markersAreRendered = true;
		}

		player.markersRollsLoadedMetadata = () => {
			tryRenderMarkers();
		};
		player.markersRollsTimeUpdate = () => {
			currentPosition = Math.floor(media.currentTime);

			if (lastPlayedPosition > currentPosition) {
				if (lastMarkerRollCallback > currentPosition) {
					lastMarkerRollCallback = -1;
				}
			} else {
				lastPlayedPosition = currentPosition;
			}

			if (0 === markersCount ||
				!markersRolls[currentPosition] ||
				currentPosition === lastMarkerRollCallback
			) {
				return;
			}

			lastMarkerRollCallback = currentPosition;

			media.pause();

			markersRollsLayer.src = markersRolls[currentPosition];
			markersRollsLayer.style.display = 'block';
		};
		player.markersRollsPlay = () => {
			tryRenderMarkers();

			markersRollsLayer.style.display = 'none';
			markersRollsLayer.src = '';
		};

		media.addEventListener('loadedmetadata', player.markersRollsLoadedMetadata);
		media.addEventListener('timeupdate', player.markersRollsTimeUpdate);
		media.addEventListener('play', player.markersRollsPlay);
	},
	/**
	 * Feature destructor.
	 *
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 * @param {HTMLElement} media
	 */
	cleanmarkersrolls(player, controls, layers, media) {
		media.removeEventListener('loadedmetadata', player.markersRollsLoadedMetadata);
		media.removeEventListener('timeupdate', player.markersRollsTimeUpdate);
		media.removeEventListener('play', player.markersRollsPlay);
	}
});