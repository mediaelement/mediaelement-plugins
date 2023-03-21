# Markers

## Overview

Based in Markers and Postroll plugins.

This plugin allows you to create Visual Cues in the progress time rail and inject HTML content in these markers.
The HTML content will be displayed every time the media reaches a marker.

Every marker answer to a URL to inject the content in the video player when the marker position is reached.

Color for markers are configurable.

## Keyword to use it
```javascript
features: [..., 'markersrolls']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
markersRollsColor | string | `#E9BC3D` | Specify the color of markers in hexadecimal code
markersRollsWidth | number | `1` | Specify the width of markers in pixels
markersRolls | object | `{}` | Marker times in seconds associated to the URL to inject. See demo folder for examples.
