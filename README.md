# ![MediaElementJS](https://cloud.githubusercontent.com/assets/910829/22357262/e6cf32b4-e404-11e6-876b-59afa009f65c.png)

# MediaElement.js Plugins

[![CDNJS](https://img.shields.io/cdnjs/v/mediaelement-plugins.svg)](https://cdnjs.com/libraries/mediaelement-plugins)

This repository contains plugins built for MediaElementJS.

* Author(s): John Dyer [http://j.hn/](http://j.hn/) and Rafael Miranda [https://github.com/ron666](https://github.com/ron666)
* Website: [http://mediaelementjs.com/](http://mediaelementjs.com/)
* License: [MIT](http://johndyer.mit-license.org/)
* Contributors: [all contributors](https://github.com/johndyer/mediaelement-plugins/graphs/contributors)

# Table of Contents

* [Installation](#installation)
* [Guidelines to Contribute](#guidelines)
    * [Node.js](#nodejs)
    * [General Conventions](#conventions)
    * [Template to create a Feature](#template)
    * [Template for Translations](#translations)
    * [A word on `ES6` for Features](#es6)
* [Available plugins](#plugins)

## * IMPORTANT CHANGES on `2.3.0` version

As part of the continuous improvements the player, we have decided to drop completely support for IE9 and IE10, since market share of those browsers together is 0.4%, according to http://caniuse.com/usage-table.
 
This change is for `MediaElement` and `MediaElement Plugins` repositories. 

<a id="installation"></a>
# Installation

Download the package from https://github.com/mediaelement/mediaelement-plugins, and reference any plugins you need from `dist` folder and add any configuration related to the plugin.

Or you can use a CDN; check https://cdnjs.com/libraries/mediaelement-plugins.

For example, if you want to install `Speed` plugin do the following:
```html
<script src="/path/to/mediaelement-and-player.min.js"></script>
<!-- Include any languages from `build/lang` folder -->
<script src="/path/to/dist/speed/speed.min.js"></script>
<!-- Translation file for plugin (includes ALL languages available on player)-->
<script src="/path/to/dist/speed/speed-i18n.js"></script>
<script>
    var player = new MediaElementPlayer('playerId', {
    	defaultSpeed: 0.75,
    	// other configuration elements
    });
</script>
```

Some of them will contain CSS styles so place them after the main player stylesheet:
```html
<link rel="stylesheet" href="/path/to/mediaelementplayer.min.css">
<link rel="stylesheet" href="/path/to/dist/speed/speed.min.css">
```

<a id="guidelines"></a>
# Guidelines to Contribute

<a id="nodejs"></a>
## Node.js

Download it at https://nodejs.org/ and follow the steps to install it, or install `node.js` with `npm`.

Once installed, at the command prompt, type `npm install`, which will download all the necessary tools.

<a id="conventions"></a>
## General Conventions

* Tab size is **8** for indentation.
* **ALWAYS** make changes to the files in the `/src/` directory, and **NEVER** in `/dist/` directory. This is with the sole purpose of facilitating the merging (and further, the compiling) operation, and help people to see changes more easily.
* Use [JSDoc](http://usejsdoc.org/) conventions to document code. This facilitates the contributions of other developers and ensures more quality in the product.
* **BEFORE PUSHING** any changes, run `npm run eslint` to ensure code quality.
* The file for the feature must be placed inside a folder matching its name, as well as any SVG/CSS elements needed (i.e, `loop/loop.js`).
* Update `package.json` with a command under the `script` configuration to make sure it will be bundled and compiled properly. For more reference, [review the file](package.json).
* Make sure you also create a `docs/FEATURE_NAME.md` file describing its purpose, API, etc., and add the name with a link to its document in the `README` file to keep documentation up-to-date.
* **DO NOT REINVENT THE WHEEL**: Use the utilities that `MediaElement` provides for DOM manipulation/AJAX/etc. Check [this link](https://github.com/mediaelement/mediaelement/blob/master/docs/utils.md) for more details.
* You can also include CSS inside the feature folder, matching the name of the feature JS file and adding CSS styles for "legacy" and BEM naming convention.
* If using an icon, its size **MUST** be **20x20px**, so it matches all the rest of the icons' dimensions.
```css
.mejs__[feature_name], .mejs-[feature_name] {
    // all your styles
}
```

<a id="template"></a>
## Template to create a Feature
```javascript
'use strict';

/**
 * [Name of feature]
 *
 * [Description]
 */

// If plugin needs translations, put here English one in this format:
// mejs.i18n.en["mejs.id1"] = "String 1";
// mejs.i18n.en["mejs.id2"] = "String 2";

// Feature configuration
Object.assign(mejs.MepDefaults, {
    // Any variable that can be configured by the end user belongs here.
    // Make sure is unique by checking API and Configuration file.
    // Add comments about the nature of each of these variables.
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
    build[feature_name] (player, controls, layers, media) {
        // This allows us to access options and other useful elements already set.
        // Adding variables to the object is a good idea if you plan to reuse
        // those variables in further operations.
        const t = this;

        // All code required inside here to keep it private;
        // otherwise, you can create more methods or add variables
        // outside of this scope
    },

    // Optionally, each feature can be destroyed setting a `clean` method

    /**
     * Feature destructor.
     *
     * Always has to be prefixed with `clean` and the name that was used in MepDefaults.features list
     * @param {MediaElementPlayer} player
     * @param {HTMLElement} controls
     * @param {HTMLElement} layers
     * @param {HTMLElement} media
     */
    clean[feature_name] (player, controls, layers, media) {}

    // Other optional public methods (all documented according to JSDoc specifications)
});
```
<a id="translations"></a>
## Template for Translations

If translatable strings are part of the plugin, you will need to create a `[feature_name]-i18n.js` file with this format:
```javascript
'use strict';

if (mejs.i18n.ca !== undefined) {
        mejs.i18n.ca["mejs.id1"] = "";
}
if (mejs.i18n.cs !== undefined) {
        mejs.i18n.cs["mejs.id1"] = "";
}
// And the rest of the languages
```
**NOTE**: The more languages are integrated on `MediaElementPlayer`, the bigger this template will become.

Also, if you are adding a new language to `MediaElementPlayer`, you will need to add it in all the existing `i18n` files in the same way described in the template above.

<a id="es6"></a>
### A word on `ES6` for Features

All the features are written using `Ecmascript 2015` specifications.

See`src/` directory, and check how the files were written to ensure compatibility.

**Note**: the `for...of` loop could have been used, but in order to bundle them and reduce the size of the bundled files, it is **strongly recommended to avoid** its use.

<a id="plugins"></a>
## Available plugins

* [Ads](docs/ads.md)
* [AirPlay](docs/airplay.md)
* [Chromecast](docs/chromecast.md)
* [Context Menu](docs/context-menu.md)
* [Facebook Pixel](docs/facebook-pixel.md)
* [Google Analytics](docs/google-analytics.md)
* [Google Tag Manager](docs/google-tag-manager.md)
* [Jump Forward](docs/jump-forward.md)
* [Loop](docs/loop.md)
* [Markers](docs/markers.md)
* [Playlist](docs/playlist.md)
* [Postroll](docs/postroll.md)
* [Preview](docs/preview.md)
* [Quality](docs/quality.md)
* [Skip Back](docs/skip-back.md)
* [Source Chooser](docs/source-chooser.md)
* [Speed](docs/speed.md)
* [Stop](docs/stop.md)
* [VAST/VPAID](docs/ads-vast.md)
* [VRView](docs/vrview.md)

# Changelog

Changes available at [Change Log](changelog.md)
