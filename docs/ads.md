# Ads

## Overview

This plugin, with the [VAST/VPAID](ads-vast.md) plugin, manages the displaying of Ads before media starts playing.

It will fire the proper events depending of the nature of the Ads type (`vast` or `vpaid`) and takes care of the manipulation
of the user's experience in general.

## Keyword to use it
```javascript
features: [..., 'ads']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
adsPrerollMediaUrl | array | `[]` | Collection of Ads URLs
adsPrerollAdUrl | array | `[]` | Collection of URLs that will be tracked through a click event when playing an Ad 	
adsPrerollAdEnableSkip | boolean | `false` | If true, allows user to skip the pre-roll ad
adsPrerollAdSkipSeconds | number | `-1` | If positive number entered, it will only allow skipping after the time has elasped
indexPreroll | number | `0` | Keep track of the index for the preroll ads to be able to show more than one preroll
	