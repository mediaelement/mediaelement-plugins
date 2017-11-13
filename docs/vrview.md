# VRView

## Overview

This plugin allows the interaction of [Google's VRView](https://developers.google.com/vr/concepts/vrview-web) with `MediaElement.js` to see 360 videos.

Google VRView only supports MP4, M(PEG)-DASH and HLS videos.

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
vrPath | string | _empty_ | Path to load Google VRView library; by default, it will try to load `https://storage.googleapis.com/vrview/2.0/build/vrview.min.js`
vrIsStereo | boolean | `true` | Indicates whether the content at the image or video URL is stereo or not
vrIsAutopanOff | boolean | `true` | When true, disables the autopan introduction on desktop
vrDebug | boolean | `false` |  When `true`, turns on debug features like rendering hotspots ad showing the FPS meter
vrDefaultYaw | number | `0` | Numeric angle in degrees of the initial heading for the 360° content. By default, the camera points at the center of the underlying image
vrIsYawOnly | boolean | `false` | When `true`, prevents roll and pitch. This is intended for stereo panoramas