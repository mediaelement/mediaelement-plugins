# Context Menu

## Overview

This plugin disabled the default context menu, and generates a custom one when performing mouse left click.
 
By default, it creates the following actions:

* Turn on/off fullscreen
* Turn on/off mute
* Download media

## API 

Parameter | Type | Default | Description
------ | --------- | ------- | --------
isContextMenuEnabled | boolean | `true` | Whether to display context menu or not
contextMenuTimeout | number | `null` | Time in milliseconds when the context should be hidden automatically; if `null` it will never disappears until an action is performed
contextMenuItems | array |  | An array of objects with format `{ render (player) { }, click (player) {} }` to render and perform click menu items, or `{ isSeparator: true }` to separate items