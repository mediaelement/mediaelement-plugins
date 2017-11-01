'use strict';

export default class ChromecastPlayer {

	/**
	 *
	 * @param {cast.framework.RemotePlayer} player
	 * @param {cast.framework.RemotePlayerController} controller
	 * @param {MediaElement} media
	 * @param {Object} options
	 */
	constructor (player, controller, media, options) {
		const t = this;
		t.player = player;
		t.controller = controller;
		t.media = media;
		t.endedMedia = false;
		t.enableTracks = options.castEnableTracks;
		t.isLive = options.castIsLive;

		// Add event listeners for player changes which may occur outside sender app
		t.controller.addEventListener(cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, () => {
			if (t.paused) {
				t.pause();
			} else {
				t.play();
			}
			t.endedMedia = false;
		});
		t.controller.addEventListener(cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED, () => {
			t.setMuted(t.player.isMuted);
			t.volume = 0;
		});
		t.controller.addEventListener(cast.framework.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED, () => {
			const event = mejs.Utils.createEvent('loadedmetadata', t.media);
			t.media.dispatchEvent(event);
		});
		t.controller.addEventListener(cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED, () => {
			t.volume = t.player.volumeLevel;
			const event = mejs.Utils.createEvent('volumechange', t.media);
			t.media.dispatchEvent(event);
		});
		t.controller.addEventListener(cast.framework.RemotePlayerEventType.DURATION_CHANGED, () => {
			const event = mejs.Utils.createEvent('timeupdate', t.media);
			t.media.dispatchEvent(event);
		});
		t.controller.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, () => {
			const event = mejs.Utils.createEvent('timeupdate', t.media);
			t.media.dispatchEvent(event);

			if (!t.isLive && t.getCurrentTime() >= t.getDuration()) {
				t.endedMedia = true;
				setTimeout(() => {
					const event = mejs.Utils.createEvent('ended', t.media);
					t.media.dispatchEvent(event);
				}, 50);
			}
		});
		t.controller.addEventListener(cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED, () => {
			t.setMuted(t.player.isMuted)
		});

		t.load();
		return t;
	}

	get paused() {
		return this.player.isPaused;
	}

	set muted (value) {
		this.setMuted(value);
	}

	get muted () {
		return this.player.isMuted;
	}

	get ended () {
		return this.endedMedia;
	}

	get readyState () {
		return this.media.originalNode.readyState;
	}

	set currentTime (value) {
		this.setCurrentTime(value);
	}

	get currentTime () {
		return this.getCurrentTime();
	}

	get duration () {
		return this.getDuration();
	}

	set volume (value) {
		this.setVolume(value);
	}

	get volume () {
		return this.getVolume();
	}

	set src (src) {
		this.setSrc(src);
	}

	get src () {
		return this.getSrc();
	}

	getSrc () {
		return this.media.originalNode.src;
	}

	setSrc (value) {
		this.media.originalNode.src = typeof value === 'string' ? value : value[0].src;
		this.load();
	}

	setCurrentTime (value) {
		this.player.currentTime = value;
		this.controller.seek();
		const event = mejs.Utils.createEvent('timeupdate', this.media);
		this.media.dispatchEvent(event);
	}

	getCurrentTime () {
		return this.player.currentTime;
	}

	getDuration () {
		return this.player.duration;
	}

	setVolume (value) {
		this.player.volumeLevel = value;
		this.controller.setVolumeLevel();
		const event = mejs.Utils.createEvent('volumechange', this.media);
		this.media.dispatchEvent(event);
	}

	getVolume () {
		return this.player.volumeLevel;
	}

	play () {
		if (this.player.isPaused) {
			this.controller.playOrPause();
			const event = mejs.Utils.createEvent('play', this.media);
			this.media.dispatchEvent(event);
		}
	}

	pause () {
		if (!this.player.isPaused) {
			this.controller.playOrPause();
			const event = mejs.Utils.createEvent('pause', this.media);
			this.media.dispatchEvent(event);
		}
	}

	load () {
		const
			t = this,
			url = this.media.originalNode.src,
			type = mejs.Utils.getTypeFromFile(url),
			mediaInfo = new chrome.cast.media.MediaInfo(url, type),
			castSession = cast.framework.CastContext.getInstance().getCurrentSession()
		;

		if (url === window.location.href || !castSession) {
			return;
		}

		// Find captions/audioTracks
		if (t.enableTracks === true) {
			const
				tracks = [],
				children = t.media.originalNode.children
			;

			let counter = 1;

			for (let i = 0, total = children.length; i < total; i++) {
				const
					child = children[i],
					tag = child.tagName.toLowerCase();

				if (tag === 'track' && (child.getAttribute('kind') === 'subtitles' || child.getAttribute('kind') === 'captions')) {
					const el = new chrome.cast.media.Track(counter, chrome.cast.media.TrackType.TEXT);
					el.trackContentId = mejs.Utils.absolutizeUrl(child.getAttribute('src'));
					el.trackContentType = 'text/vtt';
					el.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
					el.name = child.getAttribute('label');
					el.language = child.getAttribute('srclang');
					el.customData = null;
					tracks.push(el);
					counter++;
				}
			}
			mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
			mediaInfo.tracks = tracks;
		}

		mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
		mediaInfo.streamType = t.isLive ? chrome.cast.media.StreamType.LIVE : chrome.cast.media.StreamType.BUFFERED;
		mediaInfo.customData = null;
		mediaInfo.duration = null;
		mediaInfo.currentTime = t.isLive ? Infinity : 0;

		if (t.media.originalNode.getAttribute('data-cast-title')) {
			mediaInfo.metadata.title = t.media.originalNode.getAttribute('data-cast-title');
		}

		if (t.media.originalNode.getAttribute('data-cast-description')) {
			mediaInfo.metadata.subtitle = t.media.originalNode.getAttribute('data-cast-description');
		}

		if (t.media.originalNode.getAttribute('poster') || t.media.originalNode.getAttribute('data-cast-poster')) {
			const poster = t.media.originalNode.getAttribute('poster') || t.media.originalNode.getAttribute('data-cast-poster');
			mediaInfo.metadata.images = [
				{'url': mejs.Utils.absolutizeUrl(poster)}
			];
		}

		const request = new chrome.cast.media.LoadRequest(mediaInfo);

		castSession.loadMedia(request).then(() => {
			// Autoplay media in the current position
			const currentTime = t.media.originalNode.currentTime;
			t.setCurrentTime(currentTime);
			t.play();

			const event = mejs.Utils.createEvent('play', t.media);
			t.media.dispatchEvent(event);
		}, (error) => {
			t._getErrorMessage(error);
		});
	}

	setMuted (value) {
		if (value === true && !this.player.isMuted) {
			this.controller.muteOrUnmute();
		} else if (value === false && this.player.isMuted) {
			this.controller.muteOrUnmute();
		}
		setTimeout(() => {
			const event = mejs.Utils.createEvent('volumechange', this.media);
			this.media.dispatchEvent(event);
		}, 50);
	}

	canPlayType (type) {
		return ~['application/x-mpegurl', 'vnd.apple.mpegurl', 'application/dash+xml', 'video/mp4'].indexOf(type);
	}

	_getErrorMessage (error) {

		const description = error.description ? ` : ${error.description}` : '.';

		let message;

		switch (error.code) {
			case chrome.cast.ErrorCode.API_NOT_INITIALIZED:
				message = `The API is not initialized${description}`;
				break;
			case chrome.cast.ErrorCode.CANCEL:
				message = `The operation was canceled by the user${description}`;
				break;
			case chrome.cast.ErrorCode.CHANNEL_ERROR:
				message = `A channel to the receiver is not available${description}`;
				break;
			case chrome.cast.ErrorCode.EXTENSION_MISSING:
				message = `The Cast extension is not available${description}`;
				break;
			case chrome.cast.ErrorCode.INVALID_PARAMETER:
				message = `The parameters to the operation were not valid${description}`;
				break;
			case chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE:
				message = `No receiver was compatible with the session request${description}`;
				break;
			case chrome.cast.ErrorCode.SESSION_ERROR:
				message = `A session could not be created, or a session was invalid${description}`;
				break;
			case chrome.cast.ErrorCode.TIMEOUT:
				message = `The operation timed out${description}`;
				break;
			default:
				message = `Unknown error: ${error}`;
				break;
		}

		console.error(message);
	}
}

window.ChromecastPlayer = ChromecastPlayer;