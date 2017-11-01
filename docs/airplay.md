# AirPlay

## Overview

This plugin displays a button to interact with an AirPlay device, if available.

It detects if media tag has the `x-webkit-airplay` attribute set as `allow`; if not, the plugin sets it, to provide also native support.

## Keyword to use it
```javascript
features: [..., 'airplay']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
airPlayTitle | string | `null` | AirPlay button title for ARIA purposes