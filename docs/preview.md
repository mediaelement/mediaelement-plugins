# Preview

## Overview

This plugin allows the creation of a preview effect on videos: playing on hover and with possibility of mute/fade-in/fade-out its audio.

## Keyword to use it
```javascript
features: [..., 'preview']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
previewMode | boolean | `false` | Media starts playing when users mouse hovers on it, and resets when leaving player area
muteOnPreviewMode | boolean | `true` | When playing in preview mode, turn on/off sound
fadeInAudioStart | number | `0` | If `fadeInAudioInterval` is set, time when it starts fading in
fadeInAudioInterval | number | `0` | When playing media, time interval to fade in audio (must be greater than zero)
fadeOutAudioStart | number | `0` | If `fadeOutAudioInterval` is set, time when it starts fading out
fadeOutAudioInterval | number | `0` | When playing media, time interval to fade out audio (must be greater than zero)
fadePercent | number | `0.2` | Percentage in which media will fade in/out (in decimals, where 0.2 = 20%, 1 = 100%) 
pauseOnlyOnPreview | boolean | `false` | Whether reset or not the media when on preview mode
delayPreview | number | `0` | Delay in milliseconds to start previewing media