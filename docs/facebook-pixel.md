# Facebook Pixel

## Overview

This plugin enables [Facebook Pixel](https://developers.facebook.com/docs/facebook-pixel) to send certain events, such as play, pause, ended, etc. 

It requires previous configuration on Pixel to send events properly.

## Keyword to use it
```javascript
features: [..., 'facebookpixel']
```

## API 

Parameter | Type | Default | Description
------ | --------- | ------- | --------
facebookPixelTitle | string | __empty__ | The title to record events through Facebook Pixel (like Google Analytics)
facebookPixelCategory | string | `Videos` | The category name to record events through Facebook Pixel (like Google Analytics)