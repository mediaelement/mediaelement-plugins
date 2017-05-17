'use strict';

/**
 * Markers plugin
 *
 * This feature allows you to add Visual Cues in the progress time rail.
 * This plugin also lets you register a custom callback function that will be called every time the play position reaches a marker.
 * Marker position and a reference to the MediaElement Player object is passed to the registered callback function for
 * any post processing. Marker color is configurable.
 */


// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * Default marker color
	 * @type {String}
	 */
	markerColor: '#E9BC3D',
	/**
	 * Default marker width
	 * @type {Number}
	 */
	markerWidth: 1,
	/**
	 * @type {Number[]}
	 */
	markers: [],
	/**
	 * @type {Function}
	 */
	markerCallback ()  {
	}
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
	buildmarkers (player, controls, layers, media)  {

		if (!player.options.markers.length) {
			return;
		}

		let
			t = this,
			currentPos = -1,
			currentMarker = -1,
			lastPlayPos = -1, // Track backward seek
			lastMarkerCallBack = -1 // Prevents successive firing of callbacks
		;

		for (let i = 0, total = player.options.markers.length; i < total; ++i) {
			const marker = document.createElement('span');
			marker.className = `${t.options.classPrefix}time-marker`;
			controls.querySelector(`.${t.options.classPrefix}time-total`).appendChild(marker);
		}

		media.addEventListener('durationchange', () => {
			player.setmarkers(controls);
		});
		media.addEventListener('timeupdate', () => {
			currentPos = Math.floor(media.currentTime);
			if (lastPlayPos > currentPos) {
				if (lastMarkerCallBack > currentPos) {
					lastMarkerCallBack = -1;
				}
			} else {
				lastPlayPos = currentPos;
			}

			if (player.options.markers.length) {
				for (let i = 0, total = player.options.markers.length; i < total; ++i) {
					currentMarker = Math.floor(player.options.markers[i]);
					if (currentPos === currentMarker && currentMarker !== lastMarkerCallBack) {
						player.options.markerCallback(media, media.currentTime); //Fires the callback function
						lastMarkerCallBack = currentMarker;
					}
				}
			}

		}, false);

	},
	/**
	 * Create markers in the progress bar
	 *
	 * @param {HTMLElement} controls
	 */
	setmarkers (controls)  {

		const
			t = this,
			markers = controls.querySelectorAll(`.${t.options.classPrefix}time-marker`)
		;

		for (let i = 0, total = t.options.markers.length; i < total; ++i) {
			if (Math.floor(t.options.markers[i]) <= t.media.duration && Math.floor(t.options.markers[i]) >= 0) {
				const
					left = 100 * Math.floor(t.options.markers[i]) / t.media.duration,
					marker = markers[i]
				;

				marker.style.width = t.options.markerWidth + 'px';
				marker.style.left = `${left}%`;
				marker.style.background = t.options.markerColor;
			}
		}

	}
});