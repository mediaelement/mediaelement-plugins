# Quality

## Overview

This plugin allows the generation of a menu with different video/audio qualities, depending of the elements set 
in the <source> tags, such as `title` and `data-quality`

## Keyword to use it
```javascript
features: [..., 'quality']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
defaultQuality | string | `null` | Initial media quality; if `null`, it will take the first available source
qualityText | string | `null` | Title for Quality button for WARIA purposes