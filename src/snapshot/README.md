# Mediaelement Snapshot

* Author: Yassine Qoraiche
* Website: https://codecsocean.com/
* License: MIT

## Overview

Mediaelement Snapshot plugin creates a button in the player controls allows to take video snapshots with different image types (jpeg, png).

## Installation

Download plugin files and place the js files after the main [Mediaelement](https://github.com/mediaelement/mediaelement/) player js `mediaelement-and-player.min.js` file:

```HTML
<!-- Include main mediaelement player file -->
<script src="/path/to/mediaelement-and-player.min.js"></script>
<!-- Include snapshot main plugin file -->
<script src="/path/to/snapshot/snapshot.min.js"></script>
<!-- Include snapshot Translation file -->
<script src="/path/to/snapshot/snapshot-i18n.js"></script>

```
Place plugin main CSS style after the main player stylesheet

```HTML

<!-- Include main mediaelement player stylesheet file -->
<link rel="stylesheet" href="/path/to/mediaelementplayer.min.css">
<!-- Include snapshot main stylesheet file -->
<link rel="stylesheet" href="/path/to/snapshot/snapshot.min.css">

```

Add plugin keyword to the features list

```Javascript
features: [..., 'snapshot']
```

That's it !.

For more details about [How to Install mediaelement plugin](https://github.com/mediaelement/mediaelement-plugins#installation).

## Usage

Initialize Snapshot plugin

```Javascript

var player = new MediaElementPlayer(document.querySelector('video'), {

  features:['play', 'playpause', volume', 'progress', 'snapshot', fullscreen'],

       snapType:'jpeg',
       snapQuality: 0.5, //half quality
       snapShot: true,
            
       snapSuccess: function(snap){
          console.log(snap.url); //return snap object
       },

       snapError: function(){
          console.log('you can not take snapshot while the player loading !');
       }
       
 });

```

## API

| Parameter 	| Type 	          | Default | Description |
| ----------- | --------------  | --------| -----------
| snapShot    | boolean         | `true`  | Either to save snapshot image locally (`true`) or not (`false`)
| snapType    | string          | `png`   | Type of image `png`or `jpeg`
| snapWidth   | number          | Default video width  | Snapshot image width
| snapHeight  | number          | Default video height  | Snapshot image height
| snapQuality | number or float | `1`     | Snapshot image quality between `0` and `1`
| snapSuccess | function()      | `null`  | success callback => (snapshot) accepts one parameter contains snapshot object
| snapError   | function()      | `null`  | error callback() => () accepts no parameters 

## Support

Having trouble with this plugin? [create an issue](https://github.com/Codecsocean/mediaelement-snapshot/issues) describing the problem that you have encountered.
 
