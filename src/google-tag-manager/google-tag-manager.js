/**
 * Google Tag Manager Plugin
 *
 * This feature enables Google Tag Manager to send certain events, such as play, pause, ended, etc. It requires previous configuration
 * on Pixel to send events properly.
 * @see https://developers.google.com/tag-manager/
 */

// Feature configuration

Object.assign(mejs.MepDefaults, {
    /**
     * @type {Array}
     */
    dataLayer = [];
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
    buildgoogletagmanager (player, controls, layers, media) {

        media.addEventListener('play', function () {
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({'event': 'clickPlay'});
            }
        }, false);
        media.addEventListener('pause', function () {
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({'event': 'clickPause'});
            }
        }, false);
        media.addEventListener('ended', function () {
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({'event': 'clickEnded'});
            }
        }, false);
    }
});
