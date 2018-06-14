'use strict';

/**
 * Picture in picture
 *
 *
 * This feature is currently supported by safari 11 and chrome canary (68)
 *
 * Univream - 2018
 */


mejs.i18n.en['mejs.picture-in-pictureText'] = "Picture in Picture";

// Feature configuration
Object.assign(mejs.MepDefaults, {
    /**
	  * @type {Bool} standartScaleEnd - Rezooms the video back into the video elment at the End
	  */
	  standartScaleEnd: true,

    /**
	  * @type {?String} picInPicTitle - Sets the hovertitle of the PiP button
	  */
	  picInPicTitle: null
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
				video = t.node
      ;

			// define inner button attributes
			button.setAttribute('type', 'button');
			button.setAttribute('id', 'picture-in-picture-button');
			button.setAttribute('title',
			t.options.picInPicTitle == null ? mejs.i18n.t('mejs.picture-in-pictureText') : t.options.picInPicTitle);
			buttonWrapper.className = `${t.options.classPrefix}button ${t.options.classPrefix}picture-in-picture-button`;

			buttonWrapper.appendChild(button);

      if(video instanceof HTMLVideoElement) {

				if(document.pictureInPictureEnabled && !video.disablePictureInPicture) {
					// works currently only in chrome 68 (6/14/2018)
					button.addEventListener('click', () => {
						if(!document.pictureInPictureElement) {
							video.requestPictureInPicture()
							.catch(error => {
								alert("An error occured while requesting PiP: " + error);
							});
						}
						else {
							document.exitPictureInPicture()
							.catch(error => {
								alert("An error occured while exiting PiP: " + error);
							})
						}
					});

					if(t.options.standartScaleEnd) {
						video.addEventListener('ended', function () {
							document.exitPictureInPicture();
						});
	      	}
				}
        else if (video.webkitSupportsPresentationMode && typeof video.webkitSetPresentationMode === "function") {
					// for more info https://developer.apple.com/documentation/webkitjs/adding_picture_in_picture_to_your_safari_media_controls?language=javascript
        	// Toggle PiP when the user clicks the button.
        	button.addEventListener("click", function(event) {
        		video.webkitSetPresentationMode(video.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture");
        	});

	      	if(t.options.standartScaleEnd) {
						video.addEventListener('ended', function () {
	          	video.webkitSetPresentationMode("inline");
						});
	      	}
        }
				else {
					return;
				}

				t.addControlElement(buttonWrapper, 'pictureInPicture');
			}
  	}
});
