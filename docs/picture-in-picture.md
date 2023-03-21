# Picture in Picture

## Overview

This feature allows you to view a video outside of the browsers viewport.
Also know as **Picture-In-Picture** or PiP

## Note

+ This is not a W3C standard though it supported by chrome (70 or later) and Safari (10 or later)


## Keyword

```javascript
$("video").mediaelementplayer({
    features: [...,  'pictureInPicture']
});
```

## API

Parameter | Type | Default | Description
------ | ------ | ------ | ------
PiPTitle |string |`null` |alternative button title
