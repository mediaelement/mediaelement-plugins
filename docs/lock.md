# Lock

## Overview

This plugin adds a lock button to the control bar that disable the control bar and any click video to play and pause feature that may be active. To unlock the these controls click on the unlock icon.

By default the unlock icon will be hidden until the screen is clicked and then it required 3 clicks to enable. This feature is useful when you or someone else has trouble not touching the sreen on a mobile of tablet device while a video is playing.

## API

Parameter        | Type      | Default | Description
---------------- | --------- | ------- | --------
lockText         | string    | `null`  | Title for Lock button for WARIA purposes when lock feature is activated
unlockText       | string    | `null`  | Title for Unlock button for WARIA purposes when lock feature is activated
autohideUnlock   | boolean   | `true`  | Whether the unlock button should hide when not being used to unlock playback controls
unlockClicks     | number    | `3`     | The number of clicks required on the unlock button to unlock
unlockTimeWindow | number    | `2000`  | The timeframe in milliseconds in which the unlock clicks must occur.
