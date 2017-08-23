# VAST/VPAID

## Overview

This plugin, with the [Ads](ads.md) plugin, manages the displaying of Ads before media starts playing.

It will generate the proper structures after parsing VPAID/VAST XML files to be processed by the `Ads` plugin.

**NOTE**: Currently, this plugin only supports Linear elements with MP4/FLV. Support for Flash and Javascript MediaFiles coming soon.

## Keyword to use it
```javascript
features: [..., 'vast']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
vastAdTagUrl | string | __empty__ | VAST or VPAID URL
vastAdsType | string | `vast` | Type of Ads (`vast` or `vpaid`)