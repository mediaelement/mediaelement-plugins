# Google Analytics

## Overview

This plugin enables [Google Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/events) 
to send media events, such as `play`, `pause`, `ended`, etc. 

It requires Google Analytics configuration to send events properly. For more information, check 
[Set up Analytics tracking](https://support.google.com/analytics/answer/1008080?hl=en).

## Keyword to use it
```javascript
features: [..., 'googleanalytics']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
googleAnalyticsTitle | string | _(empty)_ | Google Analytics Title,
googleAnalyticsCategory | string | `Videos` | Google Analytics Category label,
googleAnalyticsEventPlay | string | `Play` | Google Analytics Play label
googleAnalyticsEventPause | string | `Pause` | Google Analytics Pause label
googleAnalyticsEventEnded | string | `Ended` | Google Analytics ended event label
googleAnalyticsEventTime | string | `Time` | Google Analytics time event label