# Google Tag Manager

## Overview

This plugin enables [Google Tag Manager](https://support.google.com/tagmanager/answer/6106961?hl=en) 
to push dataLayer events, such as `play`, `pause`, `ended`, etc. 

It requires Google Tag Manager configuration to send events properly. For more information, check 
[Set up GTM triggers](https://support.google.com/tagmanager/answer/6102821?hl=en).

## Keyword to use it
```javascript
features: [..., 'googletagmanager']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
Play | string | `clickPlay` | Google Tag Manager Play Event,
Pause | string | `clickPause` | Google Tag Manager Pause Event
Ended | string | `clickEnded` | Google Tag Manager Ended Event
