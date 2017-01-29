# ![MediaElementJS](https://cloud.githubusercontent.com/assets/910829/22357262/e6cf32b4-e404-11e6-876b-59afa009f65c.png)

# MediaElement.js Plugins

This repository contains plugins built for MediaElementJS.

## Ads

Parameter | Type | Default | Description
------ | --------- | ------- | --------
adsPrerollMediaUrl | array | `[]` | URL to a media file
adsPrerollAdUrl | array | `[]` | URL for clicking ad 	
adsPrerollAdEnableSkip | boolean | `false` | If true, allows user to skip the pre-roll ad
adsPrerollAdSkipSeconds | number | `-1` | If positive number entered, it will only allow skipping after the time has elasped
indexPreroll | number | `0` | Keep track of the index for the preroll ads to be able to show more than one preroll. Used for VAST3.0 Adpods
	
## VAST

Parameter | Type | Default | Description
------ | --------- | ------- | --------
vastAdTagUrl | string | `x` | Character used to stop speeding media

## Context Menu
No API required

## Google Analytics

Parameter | Type | Default | Description
------ | --------- | ------- | --------
googleAnalyticsTitle | string | _(empty)_ | GA Title,
googleAnalyticsCategory | string | `Videos` | GA Category label,
googleAnalyticsEventPlay | string | `Play` | GA Play label
googleAnalyticsEventPause | string | `Pause` | GA Pause label
googleAnalyticsEventEnded | string | `Ended` | GA ended event label
googleAnalyticsEventTime | string | `Time` | GA time event label

## Jump Forward

Parameter | Type | Default | Description
------ | --------- | ------- | --------
jumpForwardInterval | number | `30` | Seconds to jump forward media
jumpForwardText | string | _(empty)_ | Title for Jump Forward button for WARIA purposes

## Loop

Parameter | Type | Default | Description
------ | --------- | ------- | --------
loopText | string | _(empty)_ | Title for Loop button for WARIA purposes when loop feature is activated

## Markers

Parameter | Type | Default | Description
------ | --------- | ------- | --------
markerColor | string | `#E9BC3D` | Specify the color of marker
markers | array | `[]` | List of numbers to specify marker times in seconds
markerCallback | function | `function(media, time) {}` | Callback function invoked when a marker position is reached

## Postroll

Parameter | Type | Default | Description
------ | --------- | ------- | --------
postrollCloseText | string | _(empty)_ | Title for button to Postroll layer for WARIA purposes

## Skip Back

Parameter | Type | Default | Description
------ | --------- | ------- | --------
skipBackInterval | number | `30` | Seconds to skip back media
skipBackText | string | _(empty)_ | Title for Skip Back button for WARIA purposes

## Source Chooser

Parameter | Type | Default | Description
------ | --------- | ------- | --------
sourcechooserText | string | _(empty)_ | Title for Source Chooser button for WARIA purposes

## Speed

Parameter | Type | Default | Description
------ | --------- | ------- | --------
speeds | array | `['1.50', '1.25', '1.00', '0.75']` | Enable speeding media; accounts for strings or objects like `[{name: 'Slow', value: '0.75'}, {name: 'Normal', value: '1.00'}, ...]`
defaultSpeed | number | `1.00` | Initial speed of media	
speedChar | string | `x` | Character used to stop speeding media

## Stop

Parameter | Type | Default | Description
------ | --------- | ------- | --------
stopText | string | _(empty)_ | Title for Stop button for WARIA purposes

# Node.js

Download it at https://nodejs.org/ and follow the steps to install it, or install `node.js` with `npm`.

Once installed, at the command prompt, type `npm install`, which will download all the necessary tools.

# Guidelines to Contribute

## General Conventions

* Tab size is **8** for indentation.
* **ALWAYS** make changes to the files in the `/src/` directory, and **NEVER** in `/build/` directory. This is with the sole purpose of facilitating the merging (and further, the compiling) operation, and help people to see changes more easily.
* Use [JSDoc](http://usejsdoc.org/) conventions to document code. This facilitates the contributions of other developers and ensures more quality in the product.
* **BEFORE PUSHING** any changes, run `npm run jshint` to ensure code quality.
* The file for the feature must be placed inside a folder matching its name (i.e, `loop/loop.js`).
* Update `package.json` with a command under the `script` configuration to make sure it will be bundled and compiled properly. For more reference, [review the file](package.json).
* Make sure you also write comments about their purpose, and add them into the README file to keep documentation up-to-date.
* You can also include CSS inside the feature folder, matching the name of the feature JS file and adding CSS styles for "legacy" and BEM naming convention.
```css
.mejs__feature, .mejs-feature {
    // all your styles
}
```

## Template to create a Feature 
```javascript
/**
 * [Name of feature]
 *
 * [Description]
 */

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
     * @param {$} controls
     * @param {$} layers
     * @param {HTMLElement} media
     */
    build[feature_name]: function(player, controls, layers, media) {
        // This allows us to access options and other useful elements already set.
        // Adding variables to the object is a good idea if you plan to reuse 
        // those variables in further operations.
        let t = this;
        
        // All code required inside here to keep it private;
        // otherwise, you can create more methods or add variables
        // outside of this scope
    }
    
    // Optionally, each feature can be destroyed setting a `clean` method
    
    /**
     * Feature destructor.
     *
     * Always has to be prefixed with `clean` and the name that was used in MepDefaults.features list
     * @param {MediaElementPlayer} player
     */
    clean[feature_name]: function(player, controls, layers, media) {}
            
    // Other optional public methods (all documented according to JSDoc specifications)
});
```
### A word on `ES6` for Features

All the features are written using `Ecmascript 2015` specifications. 

See`src/` directory, and check how the files were written to ensure compatibility.

**Note**: the `for...of` loop could have been used, but in order to bundle them and reduce the size of the bundled files, it is **strongly recommended to avoid** its use.