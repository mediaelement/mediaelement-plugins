# Picture in Picture

## Overview

This feature allows you to view a video in **macOS** outside of the viewport. It uses the official picture in picture mode through WebKit JS.

## Note

+ This feature only works with safari 10 or later
+ to start picture in picture mode at the beginning of the video some of the video content has to be buffered
   + use preload=`auto` to start buffering at the beginning of the video

## Keyword to use it
```javascript
features: [..., "pictureInPicture"],
...
```

## API

Parameter | Type | Default | Description
------ | ------ | ------ | ------
standartScaleEnd | boolean |   true` | video goes back to 'standart scale' at the end of the video
picInPicScaleStart | boolean | `false` | starts picture in picture mode at the beginning of the video
picInPicTitle | string | `null` | alternative button title
