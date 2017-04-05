'use strict';

/**
 * Audio Tracks Plugin
 *
 * Provides the Audio Track button to enhance this feature in browsers that don't support it natively.
 * @see https://github.com/jrglasgow/mediaelement_audio_description
 */

// Translations (English required)
mejs.i18n.en['mejs.audio-track'] = 'Audio Tracks';

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {?String}
	 */
	audioTrackText: null,
});

Object.assign(MediaElementPlayer.prototype, {

	descriptionTrackSrc: false,

	audioTrack: false,

	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {$} controls
	 * @param {$} layers
	 * @param {HTMLElement} media
	 */
	buildaudiotracks (player)  {

		const
			t = this,
			children = t.domNode.childNodes,
			audioTrackNodes = []
		;

		let audioTracks = 0;

		for (let i = 0, total = children.lenght; i < total; i++) {
			if (children[i].tagName.toLowerCase() === 'audiotrack') {
				audioTracks++;
				audioTrackNodes.push(children[i]);
			}
		}


		if (!audioTracks) {
			return;
		}

		const audioTracksTitle = mejs.Utils.isString(t.options.audioTrackText) ? t.options.audioTrackText : mejs.i18n.t('mejs.audio-track');

		player.audioTrackButton = document.createElement('div');
		player.audioTrackButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}audiotrack-button`;
		player.audioTrackButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${audioTracksTitle}" aria-label="${audioTracksTitle}" tabindex="0"></button>`;

		t.addControlElement(player.audioTrackButton, 'audiotracks');

	},

	displayAudioCaptions () {
	
	}

});