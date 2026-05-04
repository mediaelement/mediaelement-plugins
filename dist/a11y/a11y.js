/*!
 * MediaElement.js
 * http://www.mediaelementjs.com/
 *
 * Wrapper that mimics native HTML5 MediaElement (audio and video)
 * using a variety of technologies (pure JavaScript, Flash, iframe)
 *
 * Copyright 2010-2017, John Dyer (http://j.hn/)
 * License: MIT
 *
 */(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

mejs.i18n.en['mejs.a11y-audio-description'] = 'Toggle audio description';
mejs.i18n.en['mejs.a11y-video-description'] = 'Toggle sign language';

Object.assign(mejs.MepDefaults, {
    videoDescriptionToggled: false,

    audioDescriptionToggled: false,

    defaultSource: null,

    audioDescriptionSource: null,

    videoDescriptionSource: null,

    isPlaying: false,

    isVoiceover: false,

    audioDescriptionCanPlay: false,

    iconSpritePathA11y: 'mejs-a11y-icons.svg'
});

Object.assign(MediaElementPlayer.prototype, {
    builda11y: function builda11y() {
        var t = this;

        t.options.defaultSource = {
            src: t.node.src,
            type: t.node.type
        };
        t.options.isVoiceover = t._loadBooleanFromAttribute('data-audio-description-voiceover');
        t.options.audioDescriptionSource = t._loadSourceFromAttribute('data-audio-description');
        t.options.videoDescriptionSource = t._loadSourceFromAttribute('data-video-description');

        if (t.options.audioDescriptionSource) t._createAudioDescription();
        if (t.options.videoDescriptionSource) t._createVideoDescription();

        t.a11yPlayHandler = function () {
            return t.options.isPlaying = true;
        };
        t.a11yPlayingHandler = function () {
            return t.options.isPlaying = true;
        };
        t.a11yPauseHandler = function () {
            return t.options.isPlaying = false;
        };
        t.a11yEndedHandler = function () {
            return t.options.isPlaying = false;
        };

        t.media.addEventListener('play', t.a11yPlayHandler);
        t.media.addEventListener('playing', t.a11yPlayingHandler);
        t.media.addEventListener('pause', t.a11yPauseHandler);
        t.media.addEventListener('ended', t.a11yEndedHandler);
    },
    cleana11y: function cleana11y(player, layers, controls, media) {
        var t = this;

        if (t.a11yPlayHandler) {
            media.removeEventListener('play', t.a11yPlayHandler);
            media.removeEventListener('playing', t.a11yPlayingHandler);
            media.removeEventListener('pause', t.a11yPauseHandler);
            media.removeEventListener('ended', t.a11yEndedHandler);
        }

        if (t.audioDescriptionButton && t.audioDescriptionClickHandler) {
            t.audioDescriptionButton.removeEventListener('click', t.audioDescriptionClickHandler);
            t.audioDescriptionButton = null;
            t.audioDescriptionClickHandler = null;
        }

        if (t.videoDescriptionButton && t.videoDescriptionClickHandler) {
            t.videoDescriptionButton.removeEventListener('click', t.videoDescriptionClickHandler);
            t.videoDescriptionButton = null;
            t.videoDescriptionClickHandler = null;
        }

        if (t.audioDescription) {
            if (t.audioDescriptionPlayHandler) {
                media.removeEventListener('play', t.audioDescriptionPlayHandler);
            }
            if (t.audioDescriptionPlayingHandler) {
                media.removeEventListener('playing', t.audioDescriptionPlayingHandler);
            }
            if (t.audioDescriptionPauseHandler) {
                media.removeEventListener('pause', t.audioDescriptionPauseHandler);
            }
            if (t.audioDescriptionWaitingHandler) {
                media.removeEventListener('waiting', t.audioDescriptionWaitingHandler);
            }
            if (t.audioDescriptionEndedHandler) {
                media.removeEventListener('ended', t.audioDescriptionEndedHandler);
            }
            if (t.audioDescriptionTimeupdateHandler) {
                media.removeEventListener('timeupdate', t.audioDescriptionTimeupdateHandler);
            }
            if (t.audioDescriptionVolumechangeHandler) {
                media.removeEventListener('volumechange', t.audioDescriptionVolumechangeHandler);
            }
            if (t.audioDescriptionCanplayHandler) {
                t.audioDescription.node.removeEventListener('canplay', t.audioDescriptionCanplayHandler);
            }

            var clonedAudioId = t.audioDescription.node.getAttribute('id').replace('_' + media.rendererName, '');

            t.audioDescription.remove();
            t.audioDescription = null;

            var clonedAudioElement = document.getElementById(clonedAudioId);
            if (clonedAudioElement) {
                clonedAudioElement.parentNode.removeChild(clonedAudioElement);
            }
        }

        if (t.videoVolumeButton) {
            mejs.Utils.removeClass(t.videoVolumeButton, 'hidden');
            t.videoVolumeButton = null;
        }

        if (t.descriptiveVolumeButton) {
            t.descriptiveVolumeButton = null;
        }

        t.options.audioDescriptionToggled = false;
        t.options.videoDescriptionToggled = false;
        t.options.audioDescriptionCanPlay = false;
    },
    _getFirstChildNodeByClassName: function _getFirstChildNodeByClassName(parentNode, className) {
        return [].concat(_toConsumableArray(parentNode.childNodes)).find(function (node) {
            return node.className.indexOf(className) > -1;
        });
    },
    _generateIconHtml: function _generateIconHtml(id, classPrefix, iconSpritePathA11y, iconId) {
        return '<svg xmlns="http://www.w3.org/2000/svg" id="' + id + '" class="' + classPrefix + iconId + '" aria-hidden="true" focusable="false">\n            <use xlink:href="' + iconSpritePathA11y + '#' + iconId + '"></use></svg>';
    },
    _createAudioDescription: function _createAudioDescription() {
        var t = this;
        var iconHtml = t._generateIconHtml(t.id, t.options.classPrefix, t.options.iconSpritePathA11y, 'icon-audio');
        var audioDescriptionTitle = mejs.i18n.t('mejs.a11y-audio-description');
        var audioDescriptionButton = document.createElement('div');
        audioDescriptionButton.className = t.options.classPrefix + 'button ' + t.options.classPrefix + 'audio-description-button';
        audioDescriptionButton.innerHTML = '<button type="button" aria-controls="' + t.id + '" title="' + audioDescriptionTitle + '" aria-label="' + audioDescriptionTitle + '" tabindex="0">' + iconHtml + '</button>';

        t.addControlElement(audioDescriptionButton, 'audio-description');

        t.audioDescriptionButton = audioDescriptionButton;
        t.audioDescriptionClickHandler = function () {
            t.options.audioDescriptionToggled = !t.options.audioDescriptionToggled;
            mejs.Utils.toggleClass(audioDescriptionButton, 'audio-description-on');

            t._toggleAudioDescription();
        };

        audioDescriptionButton.addEventListener('click', t.audioDescriptionClickHandler);
    },
    _createVideoDescription: function _createVideoDescription() {
        var t = this;
        var iconHtml = t._generateIconHtml(t.id, t.options.classPrefix, t.options.iconSpritePathA11y, 'icon-video');
        var videoDescriptionTitle = mejs.i18n.t('mejs.a11y-video-description');
        var videoDescriptionButton = document.createElement('div');
        videoDescriptionButton.className = t.options.classPrefix + 'button ' + t.options.classPrefix + 'video-description-button';
        videoDescriptionButton.innerHTML = '<button type="button" aria-controls="' + t.id + '" title="' + videoDescriptionTitle + '" aria-label="' + videoDescriptionTitle + '" tabindex="0">' + iconHtml + '</button>';
        t.addControlElement(videoDescriptionButton, 'video-description');

        t.videoDescriptionButton = videoDescriptionButton;
        t.videoDescriptionClickHandler = function () {
            t.options.videoDescriptionToggled = !t.options.videoDescriptionToggled;
            mejs.Utils.toggleClass(videoDescriptionButton, 'video-description-on');

            t._toggleVideoDescription();
        };

        videoDescriptionButton.addEventListener('click', t.videoDescriptionClickHandler);
    },
    _loadSourceFromAttribute: function _loadSourceFromAttribute(attribute) {
        var t = this;
        if (!t.node.hasAttribute(attribute)) return null;

        var sources = null;
        var json = void 0;

        try {
            var data = t.node.getAttribute(attribute);
            json = JSON.parse(data);
        } catch (error) {
            console.error('error loading ' + attribute + ': ' + error.message);
        } finally {
            sources = json;
        }

        return sources ? this._evaluateBestMatchingSource(sources) : null;
    },
    _loadBooleanFromAttribute: function _loadBooleanFromAttribute(attribute) {
        var t = this;
        if (!t.node.hasAttribute(attribute)) return false;

        var boolValue = t.node.getAttribute(attribute);
        return boolValue === 'true' || boolValue === '';
    },
    _evaluateBestMatchingSource: function _evaluateBestMatchingSource(sources) {
        var _this = this;

        var getMimeFromType = function getMimeFromType(type) {
            return mejs.Utils.getMimeFromType(type);
        };
        var canPlayType = function canPlayType(type) {
            return _this.node.canPlayType(type);
        };
        var matchesBrowser = function matchesBrowser(file) {
            return canPlayType(getMimeFromType(file.type));
        };

        var probablySource = sources.find(function (file) {
            return matchesBrowser(file) === 'probably';
        });
        if (probablySource) return probablySource;

        var alternativeSource = sources.find(function (file) {
            return matchesBrowser(file) === 'maybe';
        });
        if (alternativeSource) return alternativeSource;

        return null;
    },
    _createAudioDescriptionPlayer: function _createAudioDescriptionPlayer() {
        var t = this;

        var audioNode = document.createElement('audio');
        audioNode.setAttribute('preload', 'auto');
        audioNode.classList.add(t.options.classPrefix + 'audio-description-player');
        audioNode.setAttribute('src', t.options.audioDescriptionSource.src);
        audioNode.setAttribute('type', t.options.audioDescriptionSource.type);
        audioNode.load();
        document.body.appendChild(audioNode);

        t.audioDescription = new mejs.MediaElementPlayer(audioNode, {
            features: ['volume'],
            audioVolume: t.options.videoVolume,
            startVolume: t.node.volume,
            pauseOtherPlayers: false,

            iconSprite: t.options.iconSprite,

            fakeNodeName: t.options.fakeNodeName || 'mediaelementwrapper',

            hideScreenReaderTitle: true
        });

        t.audioDescriptionCanplayHandler = function () {
            return t.options.audioDescriptionCanPlay = true;
        };
        t.audioDescriptionPlayHandler = function () {
            return t.audioDescription.node.play().catch(function (e) {
                return console.error(e);
            });
        };
        t.audioDescriptionPlayingHandler = function () {
            return t.audioDescription.node.play().catch(function (e) {
                return console.error(e);
            });
        };
        t.audioDescriptionPauseHandler = function () {
            return t.audioDescription.node.pause();
        };
        t.audioDescriptionWaitingHandler = function () {
            return t.audioDescription.node.pause();
        };
        t.audioDescriptionEndedHandler = function () {
            return t.audioDescription.node.pause();
        };
        t.audioDescriptionTimeupdateHandler = function () {
            var shouldSync = Math.abs(t.currentTime - t.audioDescription.node.currentTime) > 0.35;
            var canPlay = t.options.audioDescriptionCanPlay;
            if (shouldSync && canPlay) t.audioDescription.node.currentTime = t.currentTime;
        };

        t.audioDescription.node.addEventListener('canplay', t.audioDescriptionCanplayHandler);
        t.media.addEventListener('play', t.audioDescriptionPlayHandler);
        t.media.addEventListener('playing', t.audioDescriptionPlayingHandler);
        t.media.addEventListener('pause', t.audioDescriptionPauseHandler);
        t.media.addEventListener('waiting', t.audioDescriptionWaitingHandler);
        t.media.addEventListener('ended', t.audioDescriptionEndedHandler);
        t.media.addEventListener('timeupdate', t.audioDescriptionTimeupdateHandler);

        if (t.options.isVoiceover) {
            t.audioDescriptionVolumechangeHandler = function () {
                return t.audioDescription.node.volume = t.node.volume;
            };
            t.media.addEventListener('volumechange', t.audioDescriptionVolumechangeHandler);
        } else {
            var volumeButtonClass = t.options.classPrefix + 'volume-button';
            var videoVolumeButton = t._getFirstChildNodeByClassName(t.controls, volumeButtonClass);
            t.videoVolumeButton = videoVolumeButton;

            if (videoVolumeButton) {
                var descriptiveVolumeButton = t._getFirstChildNodeByClassName(t.audioDescription.controls, volumeButtonClass);
                videoVolumeButton.classList.add('hidden');
                t.controls.insertBefore(descriptiveVolumeButton, videoVolumeButton.nextSibling);
                t.descriptiveVolumeButton = descriptiveVolumeButton;
            }
        }
    },
    _toggleAudioDescription: function _toggleAudioDescription() {
        var t = this;

        if (!t.audioDescription) t._createAudioDescriptionPlayer();

        if (t.options.audioDescriptionToggled) {
            t.audioDescription.node.volume = t.volume;
            if (t.options.isPlaying && t.audioDescription) {
                t.audioDescription.node.muted = false;
                t.audioDescription.node.play().catch(function (e) {
                    return console.error(e);
                });
            }

            if (!t.options.isVoiceover) {
                t.muted = true;
                t.audioDescription.node.muted = false;
            }

            if (!t.options.isVoiceover && t.videoVolumeButton && t.descriptiveVolumeButton) {
                mejs.Utils.addClass(t.videoVolumeButton, 'hidden');
                mejs.Utils.removeClass(t.descriptiveVolumeButton, 'hidden');
            }
        } else {
            t.volume = t.audioDescription.node.volume;
            t.audioDescription.node.pause();
            t.audioDescription.node.muted = true;

            if (!t.options.isVoiceover) {
                t.muted = false;
                t.audioDescription.node.muted = true;
            }

            if (!t.options.isVoiceover && t.videoVolumeButton && t.descriptiveVolumeButton) {
                mejs.Utils.removeClass(t.videoVolumeButton, 'hidden');
                mejs.Utils.addClass(t.descriptiveVolumeButton, 'hidden');
            }
        }
    },
    _toggleVideoDescription: function _toggleVideoDescription() {
        var t = this;
        var currentTime = t.node.currentTime;
        var wasPlaying = t.options.isPlaying;
        var active = t.options.videoDescriptionToggled;

        t.node.pause();

        t.node.src = active ? t.options.videoDescriptionSource.src : t.options.defaultSource.src;
        t.node.type = active ? t.options.videoDescriptionSource.type : t.options.defaultSource.type;
        t.node.load();

        if (wasPlaying) {
            t.node.play().then(function () {
                return t.node.currentTime = currentTime;
            }).catch(function (e) {
                return console.error(e);
            });
        } else {
            t.node.setCurrentTime(currentTime);
        }
    }
});

},{}]},{},[1]);
