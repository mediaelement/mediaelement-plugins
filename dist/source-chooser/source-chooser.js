(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Source chooser button
 *
 * This feature creates a button to speed media in different levels.
 */

// Translations (English required)

mejs.i18n.en["mejs.source-chooser"] = "Source Chooser";

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
  * @type {?String}
  */
	sourcechooserText: null
});

Object.assign(MediaElementPlayer.prototype, {

	/**
  * Feature constructor.
  *
  * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
  * @param {MediaElementPlayer} player
  * @param {$} controls
  * @param {$} layers
  * @param {HTMLElement} media
  */
	buildsourcechooser: function buildsourcechooser(player, controls, layers, media) {

		var t = this,
		    sourceTitle = mejs.Utils.isString(t.options.sourcechooserText) ? t.options.sourcechooserText : mejs.i18n.t('mejs.source-chooser'),
		    sources = [];

		// add to list
		var hoverTimeout = void 0;

		for (var j = 0, total = t.node.childNodes; i < total; i++) {
			var s = t.node.childNodes[j];
			if (s.nodeName === 'SOURCE') {
				sources.push(s);
			}
		}

		if (sources.length <= 1) {
			return;
		}

		player.sourcechooserButton = document.createElement('div');
		player.sourcechooserButton.className = t.options.classPrefix + "button " + t.options.classPrefix + "sourcechooser-button";
		player.sourcechooserButton.innerHTML = "<button type=\"button\" role=\"button\" aria-haspopup=\"true\" aria-owns=\"" + t.id + "\" title=\"" + sourceTitle + "\" aria-label=\"" + sourceTitle + "\" tabindex=\"0\"></button>" + ("<div class=\"" + t.options.classPrefix + "sourcechooser-selector " + t.options.classPrefix + "offscreen\" role=\"menu\" aria-expanded=\"false\" aria-hidden=\"true\"><ul></ul></div>");

		t.addControlElement(player.sourcechooserButton, 'sourcechooser');

		// hover
		player.sourcechooserButton.addEventListener('mouseover', function () {
			clearTimeout(hoverTimeout);
			player.showSourcechooserSelector();
		});
		player.sourcechooserButton.addEventListener('mouseout', function () {
			hoverTimeout = setTimeout(function () {
				player.hideSourcechooserSelector();
			}, 500);
		});

		// keyboard menu activation
		player.sourcechooserButton.addEventListener('keydown', function (e) {

			if (t.options.keyActions.length) {
				var keyCode = e.which || e.keyCode || 0;

				switch (keyCode) {
					case 32:
						// space
						if (!mejs.MediaFeatures.isFirefox) {
							// space sends the click event in Firefox
							player.showSourcechooserSelector();
						}
						player.sourcechooserButton.querySelector('input[type=radio]:checked').focus();
						break;
					case 13:
						// enter
						player.showSourcechooserSelector();
						player.sourcechooserButton.querySelector('input[type=radio]:checked').focus();
						break;
					case 27:
						// esc
						player.hideSourcechooserSelector();
						player.sourcechooserButton.querySelector('button').focus();
						break;
					default:
						return true;
				}

				e.preventDefault();
				e.stopPropagation();
			}
		});

		// close menu when tabbing away
		player.sourcechooserButton.addEventListener('focusout', mejs.Utils.debounce(function () {
			// Safari triggers focusout multiple times
			// Firefox does NOT support e.relatedTarget to see which element
			// just lost focus, so wait to find the next focused element
			setTimeout(function () {
				var parent = document.activeElement.closest("." + t.options.classPrefix + "sourcechooser-selector");
				if (!parent) {
					// focus is outside the control; close menu
					player.hideSourcechooserSelector();
				}
			}, 0);
		}, 100));

		var radios = player.sourcechooserButton.querySelectorAll('input[type=radio]');

		var _loop = function _loop(_i2, _total) {
			// handle clicks to the source radio buttons
			radios[_i2].addEventListener('click', function () {
				// set aria states
				this.setAttribute('aria-selected', true);
				this.checked = true;

				var otherRadios = this.closest("." + t.options.classPrefix + "sourcechooser-selector").querySelectorAll('input[type=radio]');

				for (var _j = 0, radioTotal = otherRadios.length; _j < radioTotal; _i2++) {
					if (otherRadios[_i2] !== this) {
						otherRadios[_i2].setAttribute('aria-selected', 'false');
						otherRadios[_i2].removeAttribute('checked');
					}
				}

				var src = this.value;

				if (media.currentSrc !== src) {
					(function () {
						var paused = media.paused,
						    canPlayAfterSourceSwitchHandler = function canPlayAfterSourceSwitchHandler() {
							if (!paused) {
								media.play();
							}
							media.removeEventListener('canplay', canPlayAfterSourceSwitchHandler, true);
						};

						var currentTime = media.currentTime;

						media.pause();
						media.setSrc(src);
						media.load();
						media.addEventListener('loadedmetadata', function () {
							media.currentTime = currentTime;
						}, true);
						media.addEventListener('canplay', canPlayAfterSourceSwitchHandler, true);
						media.load();
					})();
				}
			});
			_i = _i2;
		};

		for (var _i = 0, _total = radios.length; _i < _total; _i++) {
			_loop(_i, _total);
		}

		// Handle click so that screen readers can toggle the menu
		player.sourcechooserButton.querySelector('button').addEventListener('click', function () {
			if (mejs.Utils.hasClass(mejs.Utils.siblings(this, "." + t.options.classPrefix + "sourcechooser-selector"), t.options.classPrefix + "offscreen")) {
				player.showSourcechooserSelector();
				player.sourcechooserButton.querySelectorAll('input[type=radio]:checked').focus();
			} else {
				player.hideSourcechooserSelector();
			}
		});

		for (var _i3 = 0, _total2 = sources.length; _i3 < _total2; _i3++) {
			var src = sources[_i3];
			if (src.type !== undefined && src.nodeName === 'SOURCE' && typeof media.canPlayType === 'function') {
				player.addSourceButton(src.src, src.title, src.type, media.src === src.src);
			}
		}
	},

	/**
  *
  * @param {String} src
  * @param {String} label
  * @param {String} type
  * @param {Boolean} isCurrent
  */
	addSourceButton: function addSourceButton(src, label, type, isCurrent) {
		var t = this;
		if (label === '' || label === undefined) {
			label = src;
		}
		type = type.split('/')[1];

		t.sourcechooserButton.querySelector('ul').innerHTML += "<li>" + ("<input type=\"radio\" name=\"" + t.id + "_sourcechooser\" id=\"" + t.id + "_sourcechooser_" + label + type + "\"") + ("role=\"menuitemradio\" value=\"" + src + "\" " + (isCurrent ? 'checked="checked"' : '') + " aria-selected=\"" + isCurrent + "\"/>") + ("<label for=\"" + t.id + "_sourcechooser_" + label + type + "\" aria-hidden=\"true\">" + label + " (" + type + ")</label>") + "</li>";

		t.adjustSourcechooserBox();
	},

	/**
  *
  */
	adjustSourcechooserBox: function adjustSourcechooserBox() {
		var t = this;
		// adjust the size of the outer box
		t.sourcechooserButton.querySelector("." + t.options.classPrefix + "sourcechooser-selector").style.height = parseFloat(t.sourcechooserButton.querySelector("." + t.options.classPrefix + "sourcechooser-selector ul").offsetHeight) + "px";
	},

	/**
  *
  */
	hideSourcechooserSelector: function hideSourcechooserSelector() {

		var t = this;

		if (t.sourcechooserButton === undefined || !t.sourcechooserButton.querySelector('input[type=radio]')) {
			return;
		}

		var selector = t.sourcechooserButton.querySelector("." + t.options.classPrefix + "sourcechooser-selector"),
		    radios = selector.querySelectorAll('input[type=radio]');
		selector.setAttribute('aria-expanded', 'false');
		selector.setAttribute('aria-hidden', 'true');
		mejs.Utils.addClass(selector, t.options.classPrefix + "offscreen");

		// make radios not focusable
		for (var _i4 = 0, total = radios.length; _i4 < total; _i4++) {
			radios[_i4].setAttribute('tabindex', '-1');
		}
	},

	/**
  *
  */
	showSourcechooserSelector: function showSourcechooserSelector() {

		var t = this;

		if (t.sourcechooserButton === undefined || !t.sourcechooserButton.querySelector('input[type=radio]')) {
			return;
		}

		var selector = t.sourcechooserButton.querySelector("." + t.options.classPrefix + "sourcechooser-selector"),
		    radios = selector.querySelectorAll('input[type=radio]');
		selector.setAttribute('aria-expanded', 'true');
		selector.setAttribute('aria-hidden', 'false');
		mejs.Utils.removeClass(selector, t.options.classPrefix + "offscreen");

		// make radios not focusable
		for (var _i5 = 0, total = radios.length; _i5 < total; _i5++) {
			radios[_i5].setAttribute('tabindex', '0');
		}
	}
});

},{}]},{},[1]);
