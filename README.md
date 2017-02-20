# nestia-web
Nestia Web Component

## Monitor

### Usage:

#### Init:
var NestiaWeb = require('nestia-web');
var Monitor = NestiaWeb.monitor;
Monitor.init(configObj);

#### Config:
{
    app: Express.app object (obj,required)
    prefix: monitor default prefix (string,optional)
    suffix: monitor default suffix (string,optional)
    mem: monitor memory usage (boolean,optional)
    cpu: monitor cpu usage (boolean,optional)
    mon404: monitor 404 response (boolean,optional)
    mon5xx: monitor 5xx response (boolean,optional)
}
