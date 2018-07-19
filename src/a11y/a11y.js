'use strict';

mejs.i18n.en['mejs.a11y-audio-description'] = 'Toggle audio description';
mejs.i18n.en['mejs.a11y-video-description'] = 'Toggle sign language';

Object.assign(mejs.MepDefaults, {
    /**
     * Video description is toggled
     * @type {Boolean}
     */
    videoDescriptionToggled: false,

    /**
     * Audio description is toggled
     * @type {Boolean}
     */
    audioDescriptionToggled: false,

    /**
     * Store for initial source file
     * @type ?{src: String, type: String}
     */
    defaultSource: null,

    /**
     * Store for best matching audio description file
     * @type {?String}
     */
    audioDescriptionSource: null,

    /**
     * Store for best matching video description file
     * @type {?String}
     */
    videoDescriptionSource: null,

    /**
     * Player is currently playing
     * @type {Boolean}
     */
    isPlaying: false,

    /**
     * Should audio description be voiceover
     * @type {Boolean}
     */
    isVoiceover: false,

    /**
     * Audio description player has fired the canplay event
     * @type {Boolean}
     */
    audioDescriptionCanPlay: false,
});


Object.assign(MediaElementPlayer.prototype, {
    builda11y ()  {
        const t = this;

        t.options.defaultSource = {
            src: t.node.src,
            type: t.node.type
        };
        t.options.isVoiceover = t._loadBooleanFromAttribute('data-audio-description-voiceover');
        t.options.audioDescriptionSource = t._loadSourceFromAttribute('data-audio-description');
        t.options.videoDescriptionSource = t._loadSourceFromAttribute('data-video-description');

        if (t.options.audioDescriptionSource) t._createAudioDescription();
        if (t.options.videoDescriptionSource) t._createVideoDescription();

        t.node.addEventListener('play', () => t.options.isPlaying = true);
        t.node.addEventListener('playing', () => t.options.isPlaying = true);
        t.node.addEventListener('pause', () => t.options.isPlaying = false);
        t.node.addEventListener('ended', () => t.options.isPlaying = false);
    },

    /**
     * Get the first child node by class name
     * @private
     * @param {Node} parentNode
     * @param {String} className
     * @returns {Node} childNode
     */
    _getFirstChildNodeByClassName(parentNode, className) {
        return [...parentNode.childNodes].find(node => node.className.indexOf(className) > -1);
    },

    /**
     * Create audio description button and bind events
     * @private
     * @returns {Undefined}
     */
    _createAudioDescription() {
        const t = this;

        const audioDescriptionTitle = mejs.i18n.t('mejs.a11y-audio-description');
        const audioDescriptionButton = document.createElement('div');
        audioDescriptionButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}audio-description-button`;
        audioDescriptionButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${audioDescriptionTitle}" aria-label="${audioDescriptionTitle}" tabindex="0"></button>`;

        t.addControlElement(audioDescriptionButton, 'audio-description');

        audioDescriptionButton.addEventListener('click', () => {
            t.options.audioDescriptionToggled = !t.options.audioDescriptionToggled;
            mejs.Utils.toggleClass(audioDescriptionButton, 'audio-description-on');

            t._toggleAudioDescription();
        });
    },

    /**
     * Create video description button and bind events
     * @private
     * @returns {Undefined}
     */
    _createVideoDescription() {
        const t = this;
        const videoDescriptionTitle = mejs.i18n.t('mejs.a11y-video-description');
        const videoDescriptionButton = document.createElement('div');
        videoDescriptionButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}video-description-button`;
        videoDescriptionButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${videoDescriptionTitle}" aria-label="${videoDescriptionTitle}" tabindex="0"></button>`;
        t.addControlElement(videoDescriptionButton, 'video-description');

        videoDescriptionButton.addEventListener('click', () => {
            t.options.videoDescriptionToggled = !t.options.videoDescriptionToggled;
            mejs.Utils.toggleClass(videoDescriptionButton, 'video-description-on');

            t._toggleVideoDescription();
        });
    },

    /**
     * Load the best matching source file from a data attribute
     * @private
     * @param {String} attribute - data attribute for a source object.
     * @returns {?String} source - best matching source file or null
     */
    _loadSourceFromAttribute(attribute) {
        const t = this;
        if (!t.node.hasAttribute(attribute)) return null;

        let sources = null;
        let json;

        try {
            const data = t.node.getAttribute(attribute);
            json = JSON.parse(data);
        } catch(error) {
            console.error(`error loading ${attribute}: ${error.message}`);
        } finally {
            sources = json;
        }

        return (sources) ? this._evaluateBestMatchingSource(sources) : null;
    },

    /**
     * Evaluate if audio description should be toggled as voiceover
     * @private
     * @param {String} attribute - data attribute for voice over toggle
     * @returns {?Boolean}
     */
    _loadBooleanFromAttribute(attribute) {
        const t = this;
        if(!t.node.hasAttribute(attribute)) return false;

        const boolValue = t.node.getAttribute(attribute);
        return boolValue === 'true' || boolValue === '';
    },

    /**
     * Evaluate the best matching source from an array of sources
     * @private
     * @param {Array.<{src: String, type: String}>} sources
     * @returns ?{src: String, type: String} source
     */
    _evaluateBestMatchingSource(sources) {
        const getMimeFromType = type => mejs.Utils.getMimeFromType(type);
        const canPlayType = type => this.node.canPlayType(type);
        const matchesBrowser = file => canPlayType(getMimeFromType(file.type));

        // checking most likely support
        const propablySource = sources.find(file => matchesBrowser(file) === 'probably');
        if (propablySource) return propablySource;

        // checking might support
        const alternativeSource = sources.find(file => matchesBrowser(file) === 'maybe');
        if (alternativeSource) return alternativeSource;

        return null;
    },

    /**
     * Create a hidden audio dom node for audio description
     * @private
     * @returns {Undefined}
     */
    _createAudioDescriptionPlayer() {
        const t = this;

        const audioNode = document.createElement('audio');
        audioNode.setAttribute('preload', 'auto');
        audioNode.classList.add(`${t.options.classPrefix}audio-description-player`);
        audioNode.setAttribute('src', t.options.audioDescriptionSource.src);
        audioNode.setAttribute('type', t.options.audioDescriptionSource.type);
        audioNode.load();
        document.body.appendChild(audioNode);

        t.audioDescription = new mejs.MediaElementPlayer(audioNode, {
            features: ['volume'],
            audioVolume: t.options.videoVolume,
            startVolume: t.node.volume,
            pauseOtherPlayers: false
        });

        t.audioDescription.node.addEventListener('canplay', () => t.options.audioDescriptionCanPlay = true);
        t.node.addEventListener('play', () => t.audioDescription.node.play().catch(e => console.error(e)));
        t.node.addEventListener('playing', () => t.audioDescription.node.play().catch(e => console.error(e)));
        t.node.addEventListener('pause', () => t.audioDescription.node.pause());
        t.node.addEventListener('waiting', () => t.audioDescription.node.pause());
        t.node.addEventListener('ended', () => t.audioDescription.node.pause());
        t.node.addEventListener('timeupdate', () => {
            const shouldSync = Math.abs(t.node.currentTime - t.audioDescription.node.currentTime) > 0.35;
            const canPlay = t.options.audioDescriptionCanPlay;
            if (shouldSync && canPlay) t.audioDescription.node.currentTime = t.node.currentTime;
        });

        // if audio description is voice over, map volume slider to both players
        // otherwise move the audio players volume slider inside the movie player to simulate normal volume handling
        if(t.options.isVoiceover) {
            t.node.addEventListener('volumechange', () => t.audioDescription.node.volume = t.node.volume);
        } else {
            const volumeButtonClass = `${t.options.classPrefix}volume-button`;
            const videoVolumeButton = t._getFirstChildNodeByClassName(t.controls, volumeButtonClass);
            t.videoVolumeButton = videoVolumeButton;

            if(videoVolumeButton) {
                const descriptiveVolumeButton = t._getFirstChildNodeByClassName(t.audioDescription.controls, volumeButtonClass);
                videoVolumeButton.classList.add('hidden');
                t.controls.insertBefore(descriptiveVolumeButton, videoVolumeButton.nextSibling);
                t.descriptiveVolumeButton = descriptiveVolumeButton;
            }
        }
    },

    /**
     * Handle audio description toggling
     * @private
     * @returns {Undefined}
     */
    _toggleAudioDescription() {
        const t = this;

        if (!t.audioDescription) t._createAudioDescriptionPlayer();

        if (t.options.audioDescriptionToggled) {
            t.audioDescription.node.volume = t.node.volume;
            if (t.options.isPlaying && t.audioDescription) t.audioDescription.node.play().catch(e => console.error(e));

            if(!t.options.isVoiceover) {
                t.node.muted = true;
                t.audioDescription.node.muted = false;
            }

            if(!t.options.isVoiceover && t.videoVolumeButton && t.descriptiveVolumeButton) {
                mejs.Utils.addClass(t.videoVolumeButton, 'hidden');
                mejs.Utils.removeClass(t.descriptiveVolumeButton, 'hidden');
            }
        } else {
            t.node.volume = t.audioDescription.node.volume;
            t.audioDescription.node.pause();

            if(!t.options.isVoiceover) {
                t.node.muted = false;
                t.audioDescription.node.muted = true;
            }

            if(!t.options.isVoiceover && t.videoVolumeButton && t.descriptiveVolumeButton) {
                mejs.Utils.removeClass(t.videoVolumeButton, 'hidden');
                mejs.Utils.addClass(t.descriptiveVolumeButton, 'hidden');
            }
        }
    },

    /**
     * Handle video description toggling
     * @private
     * @returns {Undefined}
     */
    _toggleVideoDescription() {
        const t = this;
        const currentTime = t.node.currentTime;
        const wasPlaying = t.options.isPlaying;
        const active = t.options.videoDescriptionToggled;

        t.node.pause();

        t.node.src = active ? t.options.videoDescriptionSource.src : t.options.defaultSource.src;
        t.node.type = active ? t.options.videoDescriptionSource.type : t.options.defaultSource.type;
        t.node.load();

        if (wasPlaying) {
            t.node.play()
                .then(() => t.node.currentTime = currentTime)
                .catch(e => console.error(e))
        } else {
            t.node.setCurrentTime(currentTime);
        }
    }
});
