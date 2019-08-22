# Playlist

## Overview

This plugin allows the creation of a video/audio playlist.

The following table described the components that can be used with this plugin, and the keyword to be used on the `features` array configuration.

Component | Keyword | Description
--------- | ------- | ---------------
Playlist  | `playlist` | REQUIRED; The main plugin that builds the playlist
Previous Track  | `prevtrack` | OPTIONAL; Control to go to the previous playlist item
Next Track  | `nexttrack` | OPTIONAL; Control to go to the next playlist item
Loop  | `loop` | OPTIONAL; Control to loop the current media
Shuffle  | `shuffle` | OPTIONAL; Control to shuffle the playlist

**NOTE:** If you plan to use Loop, it is strongly recommended NOT to use the standalone version of Loop included in the project.

## Keyword to use it
```javascript
features: [..., 'playlist', 'nexttrack', 'prevtrack', 'shuffle', 'loop']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
playlist | array | `[]` | List to be played; the array consists in a series of objects that MUST include the `src` and `title` attributes; other possible items: `data-playlist-thumbnail`, `type`, `description`. **If its empty, it will search for all the `source` elements within the video/audio tags**
showPlaylist | boolean | `true` | Whether or not to display the playlist; if so, a button to toggle the playlist will be displayed
autoClosePlaylist | boolean | `false` | If set to `true`, the playlist container will hide once user selects an item
prevText | string | `null` | Title for Previous button for WARIA purposes
nextText | string | `null` | Title for Next button for WARIA purposes
loopText | string | `null` | Title for Loop button for WARIA purposes
shuffleText | string | `null` | Title for Shuffle button for WARIA purposes
playlistTitle | string | `null` | Title for Playlist button for WARIA purposes
currentMessage | string | `null` | Message ONLY for audio, prepended to the `title` of media (i.e., _Now playing_)
