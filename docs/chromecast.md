# Chromecast

## Overview

This plugin uses version 3.2 to take advantage of [Google Cast Framework](https://developers.google.com/cast/docs/developers), and creates a button to start/stop streaming.

In order to get the most of this plugin, some elements must be placed in the video tag. 

The following snippet shows the `data-cast-*` attributes needed to achieve Chromecast best experience, **even when they are not required**.

```html
<video id="player1" width="640" height="360" preload="none"
       data-cast-title="[Your title]"
       data-cast-description="[Your optional description]"
       poster="/path/to/poster.jpg">
    <source src="/path/to/media.mp4" type="video/mp4">
</video>

<audio id="player2" preload="none" controls
       data-cast-title="[Your title]"
       data-cast-description="[Your optional description]"
       data-cast-poster="/path/to/poster.jpg">
    <source src="/path/to/media.mp3" type="audio/mp3">
</audio>
```

The `poster` or `data-cast-poster` attributes are not required as well, but most of the media players use a static image when media is being broadcast in Chromecast, 
so **it is recommended their use**.

`data-cast-poster` is meant for **audio only** since `poster` is not supported natively for audio tag.

Chromecast **ONLY** accepts **MP4, HLS and M(PEG)-DASH** formats. 

Also, a page can contain **ONLY ONE** sender; otherwise, an error indicating that `cast-button` has been registered will be logged.

To avoid that, [this link](https://jsfiddle.net/Luuwnjfm/24/) shows a way to get away with it if you have to render your player dynamically.

## Keyword to use it
```javascript
features: [..., 'chromecast']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
castTitle | string | `null` | Chromecast button title for WARIA purposes 
castAppId | string | `null` |  Chromecast Application ID; if `null` is provided, it will default to `chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID`
castPolicy | string | `origin` | Chromecast default policy: `origin` (by default, auto connect from same appId and page origin), `tab` (auto connect from same appId, page origin, and tab) and `page` (no auto connect)
castEnableTracks | boolean | `false` | Whether to load tracks or not through Chromecast. In order to process tracks correctly, `tracks` feature must be enable on the player configuration and CORS **MUST** be setup correctly. Read [this link](https://developers.google.com/cast/docs/player) for more information
castIsLive | boolean | `false` | Whether the current media is a live stream or not