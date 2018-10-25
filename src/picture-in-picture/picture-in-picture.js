'use strict';

/**
 * Picture in picture
 *
 *
 * This feature is currently supported by safari 11 and chrome (70)
 *
 * Univream - 2018
 */


mejs.i18n.en['mejs.picture-in-pictureText'] = "Picture in Picture";

// Feature configuration
Object.assign(mejs.MepDefaults, {
    /**
	  * @type {?String} PiPTitle - Hover title of pip-button
	  */
	  PiPTitle: null
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
    buildpictureInPicture (player, controls, layers, media) {

      const
        t = this,
        buttonWrapper = document.createElement('div'),
        button = document.createElement('button'),
		video = t.node;

		button.setAttribute('type', 'button');
		button.setAttribute('id', 'picture-in-picture-button');
		button.setAttribute('title', t.options.PiPTitle == null ? mejs.i18n.t('mejs.picture-in-pictureText') : t.options.PiPTitle);
		buttonWrapper.className = `${t.options.classPrefix}button ${t.options.classPrefix}picture-in-picture-button`;
		buttonWrapper.appendChild(button);

      	if(video instanceof HTMLVideoElement) {
			// This is currently not a W3C standard (25-10-2018)
			// https://wicg.github.io/picture-in-picture/
			if(document.pictureInPictureEnabled && !video.disablePictureInPicture) {
				button.addEventListener('click', () => {
					if(!document.pictureInPictureElement) {
						video.requestPictureInPicture()
						.catch(error => {
							// Handle error
						});
					}
					else {
						document.exitPictureInPicture()
						.catch(error => {
							// Handle error
						});
					}
				});
			}
			// Safari implmentation
        	else if (video.webkitSupportsPresentationMode && typeof video.webkitSetPresentationMode === "function") {
				// For more info https://developer.apple.com/documentation/webkitjs/adding_picture_in_picture_to_your_safari_media_controls?language=javascript
				// Toggle PiP when the user clicks the button.
				button.addEventListener("click", function(event) {
					video.webkitSetPresentationMode(video.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture");
				});
			}
			else {
				return;
			}
		}

		t.addControlElement(buttonWrapper, 'pictureInPicture');
	}
});
