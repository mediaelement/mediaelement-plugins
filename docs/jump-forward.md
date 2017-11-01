# Jump Forward

## Overview

This plugin creates a button to forward media a specific number of seconds.

It will work even when media is not being played initially.

## Keyword to use it
```javascript
features: [..., 'jumpforward']
```

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
jumpForwardInterval | number | `30` | Seconds to jump forward media
jumpForwardText | string | `null` | Title for Jump Forward button for WARIA purposes