# Postroll

## Overview

This plugin allows the injection of any HTML content in an independent layer once the media has ended.

The following snippet shows the proper HTML to activate the postroll functionality.

```html
<video id="player1" width="640" height="360" preload="none" poster="//example.com/poster.jpg">
    <source src="//example.com/media.mp4" type="video/mp4">
    <link href="/path/to/postroll" rel="postroll">
</video>
```

The `link` tag's `rel` attribute **must be `postroll` always**.

## Keyword to use it
```javascript
features: [..., 'postroll']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
postrollCloseText | string | `null` | Title for button to Postroll layer for WARIA purposes