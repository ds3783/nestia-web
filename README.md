# nestia-web
Nestia Web Component

## Monitor

### Usage:

#### Init:
var NestiaWeb = require('nestia-web');
//this line must @ top ,before any routes or app filters.
app.use(NestiaWeb.requestFilter());

.....


var Monitor = NestiaWeb.monitor;
Monitor.init(configObj);

#### Monitor Config:
{
    app: Express.app object (obj,required)
    prefix: monitor default prefix (string,optional)
    suffix: monitor default suffix (string,optional)
    mem: monitor memory usage (boolean,optional)
    cpu: monitor cpu usage (boolean,optional)
    mon404: monitor 404 response (boolean,optional)
    mon5xx: monitor 5xx response (boolean,optional)
    monitorPath: the path for express which remove graph drawer used to get monitor indicators and values
}


#### Request filter
used to adept nestia ip rule,when using request.ip property.