# Markers

## Overview

This plugin allows you to create Visual Cues in the progress time rail.

Also, allows you to register a custom callback function that will be triggered every time the media reaches a marker.

The `MediaElementPlayer` object and media's current time should be passed to the registered callback function.

The marker color is configurable.

## Keyword to use it
```javascript
features: [..., 'markers']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
markerColor | string | `#E9BC3D` | Specify the color of marker in hexadecimal code
markerWidth | number | `1` | Specify the width of marker in pixels
markers | array | `[]` | List of numbers to specify marker times in seconds
markerCallback | function | `function(media, time) {}` | Callback function invoked when a marker position is reached