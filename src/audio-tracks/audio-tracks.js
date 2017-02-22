'use strict';

/**
 * Audio Tracks Plugin
 *
 * Provides the Audio Track button to enhance this feature in browsers that don't support it natively.
 * @see https://github.com/jrglasgow/mediaelement_audio_description
 */


// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {String}
	 */
	audioTrackText: '',
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
	buildaudiotracks: function (player, controls)  {

		const
			t = this,
			audioTracks = t.$media.children('audiotrack'),
			total = audioTracks.length
		;

		if (!total) {
			return;
		}

		const audioTracksTitle = t.options.audioTrackText ? t.options.audioTrackText : mejs.i18n.t('mejs.audio-track');

		player.audioTrackButton = $(`<div class="${t.options.classPrefix}button ${t.options.classPrefix}audiotrack-button">` +
			`<button type="button" aria-controls="${t.id}" title="${audioTracksTitle}" aria-label="${audioTracksTitle}" tabindex="0"></button>` +
		`</div>`)
		.appendTo(controls);

	},

	displayAudioCaptions: function() {
	
	}

});