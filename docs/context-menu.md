# Context Menu

## Overview

This plugin disabled the default context menu, and generates a custom one when performing mouse left click.
 
By default, it creates the following actions:

* Turn on/off fullscreen
* Turn on/off mute
* Download media

## Keyword to use it
```javascript
features: [..., 'contextmenu']
```

## API 

Parameter | Type | Default | Description
------ | --------- | ------- | --------
contextMenuItems | array | `[]` | An array of objects with format `{ render (player) { }, click (player) {} }` to render and perform click menu items, or `{ isSeparator: true }` to separate items