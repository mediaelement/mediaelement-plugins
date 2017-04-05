(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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
	audioTrackText: null
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
	buildaudiotracks: function buildaudiotracks(player, controls) {

		var t = this,
		    children = t.domNode.childNodes,
		    audioTrackNodes = [];

		var audioTracks = 0;

		for (var i = 0, total = children.lenght; i < total; i++) {
			if (children[i].tagName.toLowerCase() === 'audiotrack') {
				audioTracks++;
				audioTrackNodes.push(children[i]);
			}
		}

		if (!audioTracks) {
			return;
		}

		var audioTracksTitle = mejs.Utils.isString(t.options.audioTrackText) ? t.options.audioTrackText : mejs.i18n.t('mejs.audio-track');

		player.audioTrackButton = document.createElement('div');
		player.audioTrackButton.className = t.options.classPrefix + 'button ' + t.options.classPrefix + 'audiotrack-button';
		player.audioTrackButton.innerHTML = '<button type="button" aria-controls="' + t.id + '" title="' + audioTracksTitle + '" aria-label="' + audioTracksTitle + '" tabindex="0"></button>';

		t.addControlElement(player.audioTrackButton, 'audiotracks');
	},

	displayAudioCaptions: function displayAudioCaptions() {}

});

},{}]},{},[1]);
