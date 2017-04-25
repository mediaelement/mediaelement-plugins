# Chromecast

Parameter | Type | Default | Description
------ | --------- | ------- | --------
castTitle | string | `null` | Chromecast button title for ARIA purposes 
cast | Object |  | Renderer configuration. The `cast` object contains the elements `appID` (Chromecast Application ID) and `policy`, which can be `origin` (by default, auto connect from same appId and page origin), `tab` (auto connect from same appId, page origin, and tab) and `page` (no auto connect)