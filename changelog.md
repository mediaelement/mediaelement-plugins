### Version History

*2.2.1 (2017/??/??)*

* Fixed issues in Safari related to `Source Chooser` plugin @rafa8626
* Added `babel-preset-env` to optimize bundles based on supported browsers @rafa8626
* Fixed issues with `Speed` and `Source chooser` related to their menu options (https://github.com/mediaelement/mediaelement-plugins/pull/41) @lebanggit
* Expanded demo file with `Ads` and `VAST/VPAID` plugins @rafa8626
* Added missing workflow to avoid interacting with progress bar and some buttons in control bar when playing Ads @rafa8626
* Added new config element for `Chromecast` plugin to enable tracks @rafa8626
* Changed `match` to `test` and `includes` to `indexOf` to improve performance @rafa8626
* Fixed issues with `Context Menu` plugin not being displayed properly @rafa8626

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
