# VAST/VPAID

## Overview

This plugin, with the [Ads](ads.md) plugin, manages the displaying of Ads before media starts playing.

It will generate the proper structures after parsing VPAID2.0 or VAST3.0 XML files to be processed by the `Ads` plugin.

## API

Parameter | Type | Default | Description
------ | --------- | ------- | --------
vastAdTagUrl | string | __empty__ | VAST or VPAID URL
vastAdsType | string | `vast` | Type of Ads (`vast` or `vpaid`)