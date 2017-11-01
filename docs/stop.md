# Stop

## Overview

This plugin enables a Stop button in the control bar, which basically pauses media and loads an empty source. Once this is done, user
must implement his own mechanism to resume since the reference to the original source will get lost. 

If a `stop` method is detected, the button will fire its functionality.

## Keyword to use it
```javascript
features: [..., 'stop']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
stopText | string | `null` | Title for Stop button for WARIA purposes