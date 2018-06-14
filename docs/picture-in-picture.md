# Picture in Picture

## Overview

This feature allows you to view a video outside of the browsers viewport.
Also know as **Picture-In-Picture** or PiP

## Note

+ This feature only works with safari 10 or later, chrome 68 or later


## Keyword

```javascript
features: [..., "pictureInPicture"],
...
```

## API

Parameter | Type | Default | Description
------ | ------ | ------ | ------
standartScaleEnd | boolean |   `true` | video goes back to 'standart scale' (back to viewport) at the end of the video
picInPicTitle | string | `null` | alternative button title
