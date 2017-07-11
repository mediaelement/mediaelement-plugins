/*!
 * MediaElement.js
 * http://www.mediaelementjs.com/
 *
 * Wrapper that mimics native HTML5 MediaElement (audio and video)
 * using a variety of technologies (pure JavaScript, Flash, iframe)
 *
 * Copyright 2010-2017, John Dyer (http://j.hn/)
 * Maintained by, Rafael Miranda (rafa8626@gmail.com)
 * License: MIT
 *
 */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

mejs.i18n.en['mejs.playlist'] = 'Toggle Playlist';
mejs.i18n.en['mejs.playlist-prev'] = 'Previous';
mejs.i18n.en['mejs.playlist-next'] = 'Next';

Object.assign(mejs.MepDefaults, {
	playlist: [],

	prevText: null,

	nextText: null,

	playlistTitle: null
});

Object.assign(MediaElementPlayer.prototype, {
	buildplaylist: function buildplaylist(player, controls, layers, media) {
		var _this = this;

		var defaultPlaylistTitle = mejs.i18n.t('mejs.playlist'),
		    playlistTitle = mejs.Utils.isString(player.options.playlistTitle) ? player.options.playlistTitle : defaultPlaylistTitle;

		if (player.createPlayList_()) {
			return;
		}

		player.currentPlaylistItem = 0;
		player.originalControlsIndex = controls.style.zIndex;
		controls.style.zIndex = 5;

		player.playlistButton = document.createElement('div');
		player.playlistButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'playlist-button';
		player.playlistButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + playlistTitle + '" aria-label="' + playlistTitle + '" tabindex="0"></button>';

		player.playlistLayer = document.createElement('div');
		player.playlistLayer.className = player.options.classPrefix + 'playlist-layer  ' + player.options.classPrefix + 'layer ' + player.options.classPrefix + 'playlist-hidden ' + player.options.classPrefix + 'playlist-selector';
		player.playlistLayer.innerHTML = '<ul class="' + player.options.classPrefix + 'playlist-selector-list"></ul>';
		layers.insertBefore(player.playlistLayer, layers.firstChild);

		for (var i = 0, total = player.listItems.length; i < total; i++) {
			player.playlistLayer.querySelector('ul').innerHTML += player.listItems[i];
		}

		player.addControlElement(player.playlistButton, 'playlist');
		player.endedCallback = function () {
			if (player.currentPlaylistItem < player.totalItems) {
				player.setSrc(player.playlist[++player.currentPlaylistItem]);
				player.load();
				player.play();
			} else {
				mejs.Utils.addClass(nextButton, _this.options.classPrefix + 'off');
			}
		};

		player.keydownCallback = function (e) {
			var event = mejs.Utils.createEvent('click', e.target);
			e.target.dispatchEvent(event);
			return false;
		};

		media.addEventListener('ended', player.endedCallback);

		player.playlistButton.addEventListener('click', function () {
			mejs.Utils.toggleClass(player.playlistLayer, player.options.classPrefix + 'playlist-hidden');
		});

		var items = player.playlistLayer.querySelectorAll('.' + player.options.classPrefix + 'playlist-selector-list-item'),
		    inputs = player.playlistLayer.querySelectorAll('input[type=radio]');

		for (var _i = 0, _total = inputs.length; _i < _total; _i++) {
			inputs[_i].addEventListener('click', function () {
				var radios = player.playlistLayer.querySelectorAll('input[type="radio"]'),
				    selected = player.playlistLayer.querySelectorAll('.' + player.options.classPrefix + 'playlist-selected');

				for (var j = 0, total2 = radios.length; j < total2; j++) {
					radios[j].checked = false;
				}
				for (var _j = 0, _total2 = selected.length; _j < _total2; _j++) {
					mejs.Utils.removeClass(selected[_j], player.options.classPrefix + 'playlist-selected');
				}

				this.checked = true;
				mejs.Utils.addClass(this.parentNode, player.options.classPrefix + 'playlist-selected');
				player.currentPlaylistItem = this.getAttribute('data-index');
				player.setSrc(this.value);
				player.load();
				player.play();

				if (player.isVideo) {
					mejs.Utils.toggleClass(player.playlistLayer, player.options.classPrefix + 'playlist-hidden');
				}
			});
		}

		for (var _i2 = 0, _total3 = items.length; _i2 < _total3; _i2++) {
			items[_i2].addEventListener('click', function () {
				var radio = mejs.Utils.siblings(this.querySelector('.' + player.options.classPrefix + 'playlist-selector-label'), function (el) {
					return el.tagName === 'INPUT';
				})[0],
				    event = mejs.Utils.createEvent('click', radio);
				radio.dispatchEvent(event);
			});
		}

		player.playlistLayer.addEventListener('keydown', function (e) {
			var keyCode = e.which || e.keyCode || 0;
			if (~[13, 32, 38, 40].indexOf(keyCode)) {
				player.keydownCallback(e);
			}
		});
	},
	cleanplaylist: function cleanplaylist(player, controls, layers, media) {
		media.removeEventListener('ended', player.endedCallback_);
	},
	buildprevtrack: function buildprevtrack(player) {

		var defaultPrevTitle = mejs.i18n.t('mejs.playlist-prev'),
		    prevTitle = mejs.Utils.isString(player.options.prevText) ? player.options.prevText : defaultPrevTitle;
		player.prevButton = document.createElement('div');
		player.prevButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'prev-button';
		player.prevButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + prevTitle + '" aria-label="' + prevTitle + '" tabindex="0"></button>';

		player.prevPlaylistCallback_ = function () {
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
	cleanprevtrack: function cleanprevtrack(player) {
		player.prevButton.removeEventListener('click', player.prevPlaylistCallback_);
	},
	buildnexttrack: function buildnexttrack(player) {
		var defaultNextTitle = mejs.i18n.t('mejs.playlist-next'),
		    nextTitle = mejs.Utils.isString(player.options.nextText) ? player.options.nextText : defaultNextTitle;
		player.nextButton = document.createElement('div');
		player.nextButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'next-button';
		player.nextButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + nextTitle + '" aria-label="' + nextTitle + '" tabindex="0"></button>';

		player.nextPlaylistCallback_ = function () {
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
	cleannexttrack: function cleannexttrack(player) {
		player.nextButton.removeEventListener('click', player.nextPlaylistCallback_);
	},
	createPlayList_: function createPlayList_() {
		var t = this;

		t.playlist = t.options.playlist.length ? t.options.playlist : [];

		if (!t.playlist.length) {
			var children = t.mediaFiles || t.media.originalNode.children;

			for (var i = 0, total = children.length; i < total; i++) {
				var childNode = children[i];

				if (childNode.tagName.toLowerCase() === 'source') {
					(function () {
						var elements = {};
						Array.prototype.slice.call(childNode.attributes).forEach(function (item) {
							elements[item.name] = item.value;
						});

						if (elements.src && elements.type && elements.title) {
							elements.type = mejs.Utils.formatType(elements.src, elements.type);
							t.playlist.push(elements);
						}
					})();
				}
			}
		}

		if (t.playlist.length < 2) {
			return;
		}

		t.listItems = [];
		for (var _i3 = 0, _total4 = t.playlist.length; _i3 < _total4; _i3++) {
			var element = t.playlist[_i3],
			    item = document.createElement('li'),
			    id = t.id + '_playlist_item_' + _i3,
			    thumbnail = element['data-thumbnail'] ? '<img tabindex="-1" src="' + element['data-thumbnail'] + '">' : '',
			    description = element['data-description'] ? '<p role="link" tabindex="-1">' + element['data-description'] + '</p>' : '';
			item.tabIndex = 0;
			item.classList = t.options.classPrefix + 'playlist-selector-list-item';
			item.innerHTML = '<input type="radio" class="' + t.options.classPrefix + 'playlist-selector-input" ' + ('name="' + t.id + '_playlist" id="' + id + '" data-index="' + _i3 + '" value="' + element.src + '" disabled>') + ('<label class="' + t.options.classPrefix + 'playlist-selector-label" ') + ('for="' + id + '">' + (element.title || _i3) + '</label>') + ('<div class="' + t.options.classPrefix + 'playlist-content">' + thumbnail + description + '</div>');

			t.listItems.push(item.outerHTML);
		}
	}
});

},{}]},{},[1]);
