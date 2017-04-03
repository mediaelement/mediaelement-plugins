### Version History

*2.1.1 (2017/??/??)*

* Added demo file to show how to setup and configure plugins @ron666

*2.1.0 (2017/03/30)*

* Added missing `bind()` calls on `Ads` plugin @ron666
* Fixed issue with `VAST` plugin due to updates on AJAX method @ron666
* Integrated VPAID 2.0 with `VAST` plugin and renamed package @ron666  
* Integrated events to load tracking URLs in `VAST` plugin @ron666
* Added link in documentation for `MediaElement` utilities  @ron666

*2.0.0 (2017/03/22)*

* Removed all dependencies to jQuery in code and used `mejs.Utils` to mimic jQuery's most used methods @ron666

*1.2.3 (2017/03/01)*

* Improved way to add control elements by using new `addControlElement()` method @ron666

*1.2.2 (2017/03/01)*

* Added translation files for all the plugins that required it and added documentation @ron666 
* Added workflow to preserve order of control elements when certain features are reset @ron666

*1.2.1 (2017/02/26)*

* Fixed issue with `Preview` plugin when using delay and moving out of player @ron666
* Integrated loading spinner in the `Preview` plugin for usability purposes @ron666
* Fixed typo and off-style button in `Loop` plugin @ron666
* Integrated workflow to configure empty text on WARIA text elements @ron666
* Fixed issues with Node tasks to bring missing stylesheets in `dist` folder @ron666

*1.2.0 (2017/02/21)*

* Integrated ESLint and fixed some bugs found @ron666
* Added `tabindex` to buttons to improve accessibility @ron666
* Fixed issue with `Preview` plugin that caused audio fade-in jittery @ron666
* Added `pauseOnlyOnPreview` and `delayPreview` configuration elements for `Preview` plugin @ron666

*1.1.0 (2017/01/30)*

* Added `preview` plugin that plays/pauses video when hovering it and allows to mute/fade-in/fade-out audio in `video` and `audio` tags @ron666
* Created documentation for each one of the plugins and updated documentation on README @ron666

*1.0.0 (2017/01/22)*

* initial release
