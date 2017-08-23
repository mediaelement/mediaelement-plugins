# Source Chooser

## Overview

This plugin generates a button to choose between different sources, if more than one is indicated within the `video`/`audio` tags.

```html
<video id="player1" width="640" height="360" preload="none" poster="//example.com/poster.jpg">
    <source src="//example.com/media.mp4" type="video/mp4">
    <source src="//example.com/media.webm" type="video/webm">
    <source src="//example.com/media.ogv" type="video/ogv">
</video>
```

## Keyword to use it
```javascript
features: [..., 'sourcechooser']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
sourcechooserText | string | `null` | Title for Source Chooser button for WARIA purposes