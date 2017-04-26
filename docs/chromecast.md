# Chromecast

## Overview

This plugin uses version 3.2 to take advantage of [Google Cast Framework](https://developers.google.com/cast/docs/developers), and creates a button to start/stop streaming.

In order to get the most of this plugin, some elements must be placed in the video tag. 

The following snippet shows the `data-cast-*` attributes needed to achieve Chromecast best experience, **even when they are not required**.

```html
<video id="player1" width="640" height="360" preload="none"
       data-cast-title="[Your title]"
       data-cast-description="[Your optional description]"
       data-cast-thumb="[Your thumbnail URL]"
       poster="//example.com/poster.jpg">
    <source src="//example.com/media.mp4" type="video/mp4">
    <track srclang="en" kind="subtitles" src="/path/to/tracks.vtt" label="English">
</video>
```

Although the `track` element is indicated in the code above, **it is not required**.

This plugin also processes `audioTrack` tags.

The `poster` attribute is not required as well, but most of the media players use a static image when media is being broadcast in Chromecast, 
so **it is recommended its use**.

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
castTitle | string | `null` | Chromecast button title for ARIA purposes 
cast | Object |  | Renderer configuration. The `cast` object contains the elements `appID` (Chromecast Application ID) and `policy`, which can be `origin` (by default, auto connect from same appId and page origin), `tab` (auto connect from same appId, page origin, and tab) and `page` (no auto connect)