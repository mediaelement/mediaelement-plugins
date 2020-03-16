## Version History

2.5.1 (2020/03/16)*

NEW PLUGINS

* Added snapshot plugin
* Added Markers Rolls plugin (#155)
* Added frame by frame navigation plugin (#130)
  This plugin allows for forward and backward navigation in videos that support it in 30fps and 60fps

TRANSLATIONS

* Added Turkish translations (#154)
* Added Malay translation (#113)
* Added German translation to a11y/README.md
* Fix ru and uk translations (#162)
* Fix translations for Playlist
* Accessibility plugin translations

DOCUMENTATION

* README.md: Fix link to the real Rafael Miranda :)
* README.md: Fix outgoing links to use HTTPS, and fixed broken redirects (#165)
* README.md: Added link to a11y plugin

PIP PLUGIN

* Added support for WICG PiP mode
* Added picture-in-picture indenting / docs fix
* Added full support for PiP in chrome 70
* Added PiP plugin description
* Added setting properties PiP plugin
* Added basic picture-in-picture plugin
* Pathfix in picture-in-picture.css
* Improve picture-in-picture.md overview

POSTROLL PLUGIN

* Close postroll, when replaing video (#158)

ADS PLUGIN

* Added 'mejsprerollfinished' Event to detect end of last Ad-Preroll, Ads.js (#136)

ACCESSIBILITY PLUGIN (#142)

* Added support for sign language and audio description and stylings 
 (tested on multiple devices e.g. IE11, Edge, Chrome, Firefox, Safari + iOS 10, iOS 11 + Android Chrome)
* Added to plugin overview page
* Ajust Gruntfile.js + task fixes

QUALITY PLUGIN

* Added callback on change quality (#140)
* Fix focusout event triggered earlier than click and there is no visible clickable element
* Implement automatic source creation from .m3u8 & .mpd playback (#114)
* Select Quality From Single .mpd (Feature request #92)
* Update to make auto generate quality source optional
* Removed obsolete code.
* Fix tabs and spaces
* Fix css issue from grunt build
* Fixed issue with the quality chooser being mis-aligned (css)
* Fixed bug where if the first quality in the quality group is unsupported by the browser the video errors out...
  (will now cycle through the quality source until a playable source is found)

PLAYLIST PLUGIN

* Fix playlist error in Safari (#129, #164)
* Fix currentMessage null issue (#132)
* Change incorrect comment of 'data-thumbnail' to 'data-playlist-thumbnail'

SPEED KEYS PLUGIN 

* Implement keyboard controls for changing playback speed using < and > keys like on YouTube.
* Remove minified files from source

*2.5.0 (2017/11/17)*

* Fixed typo on `Playlist` plugin that caused error on Edge, removed `disabled` attribute on each item and fixed workflow to autoplay next element @rafa8626
* Fixed issue when mouse leave from `Quality` button, its selector does not hide (https://github.com/mediaelement/mediaelement-plugins/pull/89) @meathill
* Fixed typo in `Quality`, `Stop` and `Preview` plugins @rafa8626
* Added multiple demo files for plugins @rafa8626
* Integrated `VRView` plugin @rafa8626
* Update to allow video quality grouping for browser fallback media type (https://github.com/mediaelement/mediaelement-plugins/pull/93) @Gungrave223
* Fixed issue when changing quality when media is paused @rafa8626

*2.4.0 (2017/08/09)*

* Added missing translations and removed Brazilian Portuguese to favor Portuguese @rafa8626
* Sorted alphabetically plugins name on README (https://github.com/mediaelement/mediaelement-plugins/pull/77) @isantolin
* Integrated `Playlist` plugin @rafa8626
* Added support for audio play on `Chromecast` @rafa8626
* Integrated `Google Tag Manager` plugin @rafa8626
* Fixed typos on methods used when player is destroyed @rafa8626

*2.3.1 (2017/07/22)*

* Added missing workflow to avoid loading multiple times same source on `Chromecast` plugin and added code to end session correctly @rafa8626
* Fixed issues on `Ads` plugin when using iframe renderers with it @rafa8626
* Fixed issue with `Context Menu` plugin to only be used on video media @rafa8626
* Fixed height on `Speed` plugin to display speed rates properly on audio tag @rafa8626
* Updated README file @rafa8626

*2.3.0 (2017/06/26)*

* Integrated `Facebook Pixel` plugin (https://github.com/mediaelement/mediaelement-plugins/pull/58) @isantolin
* Cleaned comments on bundles @rafa8626
* Replaced `childNodes` with `children` to avoid issues with non Node elements inside video/audio tag @rafa8626
* Integrated `grunt` to simplify tasks and removed elements from `package.json` @rafa8626
* Integrated [Stylelint](https://stylelint.io/) for CSS quality @rafa8626
* Improved CSS quality (https://github.com/mediaelement/mediaelement-plugins/pull/64) @marcobiedermann
* Refactor `Chromecast` to achieve default dual-nature and support live streaming; enabled Cast button on Ads @rafa8626

*2.2.2 (2017/05/25)*

* Added `markerWidth` property for `Markers` plugin (https://github.com/mediaelement/mediaelement-plugins/pull/49) @leocaseiro
* Fixed typos in README file (https://github.com/mediaelement/mediaelement-plugins/pull/50) @leocaseiro
* Integrated `Quality` plugin for different quality media files @rafa8626
* Disabled correctly controls on pre-roll (https://github.com/mediaelement/mediaelement-plugins/pull/52) @jonathanex and @rafa8626
* Fixed issue with `Stop` not allowing the current time to be rendered once media starts again @rafa8626
* Fixed issue on `Ads` plugin with different types of media @rafa8626

*2.2.1 (2017/05/16)*

* Fixed issues in Safari related to `Source Chooser` plugin @rafa8626
* Integrated `VRView` plugin @rafa8626
* Added `babel-preset-env` to optimize bundles based on supported browsers @rafa8626
* Fixed issues with `Speed` and `Source chooser` related to their menu options (https://github.com/mediaelement/mediaelement-plugins/pull/41) @lebanggit
* Expanded demo file with `Ads` and `VAST/VPAID` plugins @rafa8626
* Added missing workflow to avoid interacting with progress bar and some buttons in control bar when playing Ads @rafa8626
* Added new config element for `Chromecast` plugin to enable tracks @rafa8626
* Changed `match` to `test` and `includes` to `indexOf` to improve performance @rafa8626
* Fixed issues with `Context Menu` plugin not being displayed properly @rafa8626
* Enforced `https` on Chromecast library (https://github.com/mediaelement/mediaelement-plugins/pull/46) @jimmywarting
* Fixed issue with `Skip Back` plugin (https://github.com/mediaelement/mediaelement-plugins/pull/48) @joelkraft

*2.2.0 (2017/04/28)*

* Modified commands on `package.json` to avoid creating source map on stylesheets @rafa8626
* Integrated `AirPlay` plugin @rafa8626
* Integrated `Chromecast` plugin @rafa8626
* Improved documentation for each one of the plugins @rafa8626

*2.1.1 (2017/04/19)*

* Added demo file to show how to setup and configure plugins @rafa8626
* Expanded `VAST` plugin to support VAST3.0 and added more events for preroll @rafa8626
* Fixed typos in code in `Preview` and `Speed` plugins @rafa8626
* Added new icons and modified CSS for them; fixed minor issues with `Skip Back` and `Jump Forward` plugins @rafa8626
* Added missing French translations (https://github.com/mediaelement/mediaelement-plugins/pull/26) @kloh-fr

*2.1.0 (2017/03/30)*

* Added missing `bind()` calls on `Ads` plugin @rafa8626
* Fixed issue with `VAST` plugin due to updates on AJAX method @rafa8626
* Integrated VPAID 2.0 with `VAST` plugin and renamed package @rafa8626  
* Integrated events to load tracking URLs in `VAST` plugin @rafa8626
* Added link in documentation for `MediaElement` utilities  @rafa8626

*2.0.0 (2017/03/22)*

* Removed all dependencies to jQuery in code and used `mejs.Utils` to mimic jQuery's most used methods @rafa8626

*1.2.3 (2017/03/01)*

* Improved way to add control elements by using new `addControlElement()` method @rafa8626

*1.2.2 (2017/03/01)*

* Added translation files for all the plugins that required it and added documentation @rafa8626 
* Added workflow to preserve order of control elements when certain features are reset @rafa8626

*1.2.1 (2017/02/26)*

* Fixed issue with `Preview` plugin when using delay and moving out of player @rafa8626
* Integrated loading spinner in the `Preview` plugin for usability purposes @rafa8626
* Fixed typo and off-style button in `Loop` plugin @rafa8626
* Integrated workflow to configure empty text on WARIA text elements @rafa8626
* Fixed issues with Node tasks to bring missing stylesheets in `dist` folder @rafa8626

*1.2.0 (2017/02/21)*

* Integrated ESLint and fixed some bugs found @rafa8626
* Added `tabindex` to buttons to improve accessibility @rafa8626
* Fixed issue with `Preview` plugin that caused audio fade-in jittery @rafa8626
* Added `pauseOnlyOnPreview` and `delayPreview` configuration elements for `Preview` plugin @rafa8626

*1.1.0 (2017/01/30)*

* Added `preview` plugin that plays/pauses video when hovering it and allows to mute/fade-in/fade-out audio in `video` and `audio` tags @rafa8626
* Created documentation for each one of the plugins and updated documentation on README @rafa8626

*1.0.0 (2017/01/22)*

* initial release
