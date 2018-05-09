'use strict';

/**
 * Picture in picture
 *
 * This feature is exposed by Webkit JS and is used in safari 11 to
 * display **video** content outside of the viewport in macOS/IOS
 */

// If plugin needs translations, put here English one in this format:
// mejs.i18n.en["mejs.id1"] = "String 1";
// mejs.i18n.en["mejs.id2"] = "String 2";

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
	  pictureInPictureTextalt: null
});


Object.assign(MediaElementPlayer.prototype, {

    // Public variables (also documented according to JSDoc specifications)

    /**
     * Feature constructor.
     *
     * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
     * @param {MediaElementPlayer} player
     * @param {HTMLElement} controls
     * @param {HTMLElement} layers
     * @param {HTMLElement} media
     */
    buildpictureInPicture (player, controls, layers, media) {
        // This allows us to access options and other useful elements already set.
        // Adding variables to the object is a good idea if you plan to reuse
        // those variables in further operations.

        const
          t = this,
          buttonWrapper = document.createElement('div'),
          button = document.createElement('button'),
					video = t.node
        ;

        if(video instanceof HTMLVideoElement) {

	        button.setAttribute('type', 'button');
					video.setAttribute('preload', 'auto');
					button.setAttribute('title', t.options.pictureInPictureTextalt == null ? mejs.i18n.t('mejs.picture-in-pictureText') : t.options.pictureInPictureTextalt);
					button.textContent = "Pic";
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
            video.addEventListener('play', function() {
              video.webkitSetPresentationMode("picture-in-picture");
            });
          }

          if(t.options.standartScaleEnd) {
					 video.addEventListener('ended', function () {
              this.webkitSetPresentationMode("inline");
					 });
          }

	        t.addControlElement(button, 'pictureInPicture');
				}

    }
});
