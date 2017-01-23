# <img width="100%" alt="MediaElementJS" src="https://cloud.githubusercontent.com/assets/910829/22048731/f3627e1e-dcfc-11e6-956d-372f134f25de.png">

# MediaElement.js Plugins

This repository contains plugins built for MediaElementJS.


## Ads

Parameter | Type | Default | Description
------ | --------- | ------- | --------
adsPrerollMediaUrl | array | `[]` | URL to a media file
adsPrerollAdUrl | array | `[]` | URL for clicking ad 	
adsPrerollAdEnableSkip | boolean | `false` | If true, allows user to skip the pre-roll ad
adsPrerollAdSkipSeconds | number | `-1` | If positive number entered, it will only allow skipping after the time has elasped
indexPreroll | number | `0` | Keep track of the index for the preroll ads to be able to show more than one preroll. Used for VAST3.0 Adpods
	
## VAST

Parameter | Type | Default | Description
------ | --------- | ------- | --------
vastAdTagUrl | string | `x` | Character used to stop speeding media

## Context Menu
No API required

## Google Analytics

Parameter | Type | Default | Description
------ | --------- | ------- | --------
googleAnalyticsTitle | string | _(empty)_ | GA Title,
googleAnalyticsCategory | string | `Videos` | GA Category label,
googleAnalyticsEventPlay | string | `Play` | GA Play label
googleAnalyticsEventPause | string | `Pause` | GA Pause label
googleAnalyticsEventEnded | string | `Ended` | GA ended event label
googleAnalyticsEventTime | string | `Time` | GA time event label

## Jump Forward

Parameter | Type | Default | Description
------ | --------- | ------- | --------
jumpForwardInterval | number | `30` | Seconds to jump forward media
jumpForwardText | string | _(empty)_ | Title for Jump Forward button for WARIA purposes

## Loop

Parameter | Type | Default | Description
------ | --------- | ------- | --------
loopText | string | _(empty)_ | Title for Loop button for WARIA purposes when loop feature is activated

## Markers

Parameter | Type | Default | Description
------ | --------- | ------- | --------
markerColor | string | `#E9BC3D` | Specify the color of marker
markers | array | `[]` | List of numbers to specify marker times in seconds
markerCallback | function | `function(media, time) {}` | Callback function invoked when a marker position is reached

## Postroll

Parameter | Type | Default | Description
------ | --------- | ------- | --------
postrollCloseText | string | _(empty)_ | Title for button to Postroll layer for WARIA purposes

## Skip Back

Parameter | Type | Default | Description
------ | --------- | ------- | --------
skipBackInterval | number | `30` | Seconds to skip back media
skipBackText | string | _(empty)_ | Title for Skip Back button for WARIA purposes

## Source Chooser

Parameter | Type | Default | Description
------ | --------- | ------- | --------
sourcechooserText | string | _(empty)_ | Title for Source Chooser button for WARIA purposes

## Speed

Parameter | Type | Default | Description
------ | --------- | ------- | --------
speeds | array | `['1.50', '1.25', '1.00', '0.75']` | Enable speeding media; accounts for strings or objects like `[{name: 'Slow', value: '0.75'}, {name: 'Normal', value: '1.00'}, ...]`
defaultSpeed | number | `1.00` | Initial speed of media	
speedChar | string | `x` | Character used to stop speeding media

## Stop

Parameter | Type | Default | Description
------ | --------- | ------- | --------
stopText | string | _(empty)_ | Title for Stop button for WARIA purposes
