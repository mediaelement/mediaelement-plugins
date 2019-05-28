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
 */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

mejs.i18n.en['mejs.snapshot'] = 'Take a Snapshot';

Object.assign(mejs.MepDefaults, {

	/*
	 * Assign default snapshot paramaters
	 * @param snapError   = null|(errorMsg) => {when success returns Error message}
	 * @param snapSuccess = null|(snapObject) => {returns snap object contains: {url = blob|base64 , type = image/jpeg|image/png, quality = from 0 to 1 (float)}  }
	 * @param snapType	  = png|jpeg
	 * @param snapQuality = between 0 & 1 (float)
	 * @param snapShot	  = bool true|false either to 
	 */

	snapError: null, // snap error callBack
	snapSuccess: null, // snap success callBack
	snapType: 'png', // default image-type value
	snapQuality: 1,  // default snap-quality value
	snapShot: true,
	snapWidth: null,
	snapHeight: null

});

Object.assign(MediaElementPlayer.prototype, {
	buildsnapshot: function buildsnapshot(player, controls, layers, media) {

		var t = this;

		/**
		 * check media type, if not video return 0;
		 */

		if ( false === t.options.isVideo ) {
			return;
		}

		var snapShot = t.options.snapShot,

		defaultTitle = mejs.i18n.t('mejs.snapshot'),

		    // skipTitle = mejs.Utils.isString(t.options.skipBackText) ? t.options.skipBackText.replace('%1', t.options.skipBackInterval) : defaultTitle,
		// Get a handle on the 2d context of the canvas element
		video = media.firstChild,
		
		canvas = document.querySelector('canvas'),
		context = canvas.getContext('2d'),

			// Define some vars required later
		w, h, ratio, button = document.createElement('div');

		//var isSave = snapShot ? '<a href="#" id="save-snapshot"></a>': null;

		button.className = t.options.classPrefix + 'button ' + t.options.classPrefix + 'snapshot-button';
		button.innerHTML = '<button type="button" aria-controls="' + t.id + '" title="' + defaultTitle + '" aria-label="' + defaultTitle + '" tabindex="0"></button>';

		t.addControlElement(button, 'snapshot');

		media.addEventListener('loadedmetadata', () => {
				// Calculate the ratio of the video's width to height
			ratio = video.videoWidth / video.videoHeight;
			// Define the required width as 100 pixels smaller than the actual video's width
			w = t.options.snapWidth != null ? parseInt(t.options.snapWidth) : video.videoWidth - 100;
			// Calculate the height based on the video's width and the ratio
			h = t.options.snapHeight != null ? parseInt(t.options.snapHeight) : parseInt(w / ratio, 10);
			// Set the canvas width and height to the values just calculated
			

			canvas.width = w;
			canvas.height = h;

		}, false);


		let isSeeking 	= false,
			snapSuccess = t.options.snapSuccess,
			snapError	= t.options.snapError,
			snapType 	= t.options.snapType,
			snapQuality = t.options.snapQuality;

		media.addEventListener( 'seeking', () => { isSeeking = true; } );
		media.addEventListener( 'seeked', () => { isSeeking = false; } );

		button.addEventListener('click', () => {

			if ( false === isSeeking && media.currentTime > 0){

				/*
				 * Callback error when media seeking or media not played yet
				 * Return 
				 * Parameters
				 */
				
				if ( isFunction(snapSuccess) )

				 	snapSuccess.call(this, snap(snapType, snapQuality) );

				if ( true === snapShot ) {

					return saveSnap(snapType, snapQuality);

				}

			} else {

				/*
				 * callback error when media seeking or media not played yet
				 * return 
				 * parameters
				 */
				
				if ( isFunction(snapError) )
				
					return snapError.call(this);

			}


		});


		/*
		 * SO source: https://stackoverflow.com/a/7356528/3950681
		 */
		var isFunction = (funcfunction) => {
 			return funcfunction && {}.toString.call(funcfunction) === '[object Function]';
		}

		var saveSnap = () => {

			canvas.toBlob(function(blob){

		     	var blobUrl = URL.createObjectURL(blob);

		     	var a = document.createElement("a");
    			document.body.appendChild(a);

			    a.setAttribute("href", blobUrl);
			    a.className = 'snapshot-download';
			    a.setAttribute("download", 'snapshot-' + Math.floor(media.currentTime) + '.' + t.options.snapType);
			    a.click();
			    URL.revokeObjectURL(blobUrl);

		    }, 'image/' + t.options.snapType, t.options.snapQuality );

				
		};

		var snap = ( snapType, snapQuality ) => {

			// Define the size of the rectangle that will be filled (basically the entire element)
			context.fillRect(0, 0, w, h);
			// Grab the image from the video
			context.drawImage(video, 0, 0, w, h);

			var dataURL = canvas.toDataURL('image/' + snapType, snapQuality );

			var snapObject = {
					'url': dataURL, 
					'type':'image/' + snapType, 
					'quality': snapQuality,
					'width': w,
					'height': h
				};

			return snapObject;

		}
	}
});

},{}]},{},[1]);
