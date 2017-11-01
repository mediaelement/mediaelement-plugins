# Speed

## Overview

This plugin creates a button that allows the user to play media at different speed rates.

## Keyword to use it
```javascript
features: [..., 'speed']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
speeds | array | `['1.50', '1.25', '1.00', '0.75']` | Enable speeding media; accounts for strings or objects like `[{name: 'Slow', value: '0.75'}, {name: 'Normal', value: '1.00'}, ...]`
defaultSpeed | number | `1.00` | Initial speed of media	
speedChar | string | `x` | Character used to stop speeding media
speedText | string | `null` | Title for Speed button for WARIA purposes