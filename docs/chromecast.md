# Chromecast

## Overview

This plugin uses version 3.2 to take advantage of [Google Cast Framework](https://developers.google.com/cast/docs/developers), and creates a button to start/stop streaming.

In order to get the most of this plugin, some elements must be placed in the video tag. 

The following snippet shows the `data-cast-*` attributes needed to achieve Chromecast best experience, **even when they are not required**.

```html
<video id="player1" width="640" height="360" preload="none"
       data-cast-title="[Your title]"
       data-cast-description="[Your optional description]"
       poster="//example.com/poster.jpg">
    <source src="//example.com/media.mp4" type="video/mp4">
</video>
```

The `poster` attribute is not required as well, but most of the media players use a static image when media is being broadcast in Chromecast, 
so **it is recommended its use**.

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
castTitle | string | `null` | Chromecast button title for ARIA purposes 
castAppId | string | `null` |  Chromecast Application ID; if `null` is provided, it will default to `chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID`
castPolicy | string | `origin` | Chromecast default policy: `origin` (by default, auto connect from same appId and page origin), `tab` (auto connect from same appId, page origin, and tab) and `page` (no auto connect)
castEnableTracks | boolean | `false` | Whether to load tracks or not through Chromecast. In order to process tracks correctly, `tracks` feature must be enable on the player configuration and user **MUST** set a custom receiver application. Read [this](https://github.com/googlecast/CastReferencePlayer) and [this](https://developers.google.com/cast/docs/receiver_apps) pages for more references.