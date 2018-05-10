'use strict';

/**
 * Picture in picture
 *
 *
 * This feature is exposed by Webkit JS and is used in safari 11 to
 * display **video** content outside of the viewport in macOS/IOS
 *
 * Univream - 2018
 */


mejs.i18n.en['mejs.picture-in-pictureText'] = "Picture in Picture";

// Feature configuration
Object.assign(mejs.MepDefaults, {
    /**
	  * @type {Bool}
	  */
	  standartScaleEnd: true,

     /**
	  * @type {Bool}
	  */
	  picInPicScaleStart: false,


    /**
	  * @type {?String}
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

        if(video instanceof HTMLVideoElement) {

		// define inner button attributes
	       	button.setAttribute('type', 'button');
		button.setAttribute('id', 'picture-in-picture-button');
		button.setAttribute('title',
		t.options.picInPicTitle == null ? mejs.i18n.t('mejs.picture-in-pictureText') : t.options.picInPicTitle);
	       	buttonWrapper.className = `${t.options.classPrefix}button ${t.options.classPrefix}picture-in-picture-button`;

	        buttonWrapper.appendChild(button);

		// for more info https://developer.apple.com/documentation/webkitjs/adding_picture_in_picture_to_your_safari_media_controls?language=javascript
	        if (video.webkitSupportsPresentationMode && typeof video.webkitSetPresentationMode === "function") {
	        	// Toggle PiP when the user clicks the button.
	        	button.addEventListener("click", function(event) {
	        		video.webkitSetPresentationMode(video.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture");
	        	});
	        } else {
	        	return;
	        }

          	if(t.options.picInPicScaleStart) {
			// makes sure that this is a onetime toggle
			let changedMode = false;
            		video.addEventListener('play', function() {
					if(!changedMode) {
						video.webkitSetPresentationMode("picture-in-picture");
						changedMode = true;
					}
            		});
          	}

          	if(t.options.standartScaleEnd) {
			video.addEventListener('ended', function () {
              			video.webkitSetPresentationMode("inline");
			});
          	}

	        t.addControlElement(button, 'pictureInPicture');
		}

    }
});
