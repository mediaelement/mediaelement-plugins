/**
 * Facebook Pixel Plugin
 *
 * This feature enables Facebook Pixel to send certain events, such as play, pause, ended, etc. It requires previous configuration
 * on Pixel to send events properly.
 * @see https://developers.facebook.com/docs/facebook-pixel
 */

// Feature configuration

Object.assign(mejs.MepDefaults, {
    /**
     * @type {String}
     */
    facebookPixelTitle: '',
    /**
     * @type {String}
     */
    facebookPixelCategory: 'Videos',
    /**
     * @type {String}
     */
    facebookPixelEventTime: 'Time'
});

Object.assign(MediaElementPlayer.prototype, {

    /**
     * Feature constructor.
     *
     * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
     * @param {MediaElementPlayer} player
     * @param {HTMLElement} controls
     * @param {HTMLElement} layers
     * @param {HTMLElement} media
     */
    buildfacebookpixel: function buildfacebookpixel(player, controls, layers, media) {

        media.addEventListener('play', function () {
            if (typeof fbq !== 'undefined') {
                fbq('trackCustom', player.options.facebookPixelCategory, {Event: 'Play', Title: player.options.facebookPixelTitle === '' ? player.media.currentSrc : player.options.facebookPixelTitle});
            }
        }, false);
        media.addEventListener('pause', function () {
            if (typeof fbq !== 'undefined') {
                fbq('trackCustom', player.options.facebookPixelCategory, {Event: 'Pause', Title: player.options.facebookPixelTitle === '' ? player.media.currentSrc : player.options.facebookPixelTitle});
            }
        }, false);
        media.addEventListener('ended', function () {
            if (typeof fbq !== 'undefined') {
                fbq('trackCustom', player.options.facebookPixelCategory, {Event: 'Ended', Title: player.options.facebookPixelTitle === '' ? player.media.currentSrc : player.options.facebookPixelTitle});
            }
        }, false);
    }
});
