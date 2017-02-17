/**
 * Created by ds3783 on 2017/2/17.
 */
var process = require('process');
var cpu = require('./lib/cpu');
var monitor = require('./lib/monitor');
var onFinished = require('on-finished');

var monitorPath = '/monitor.jsp';


var prefix = '';
var Monitor = module.exports = {
    recordCnt: function (code, cnt) {
        monitor.recordCnt(prefix + code, cnt);
    },
    recordCntBatch: function (obj) {
        obj = obj || {};
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                Monitor.recordCnt(prop, (obj[prop] * 1) || 1);
            }
        }
    },
    recordVal: function (code, val) {
        monitor.recordVal(prefix + code, val);
    },
    recordValBatch: function (obj) {
        obj = obj || {};
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                Monitor.recordCnt(prop, (obj[prop] * 1) || 1);
            }
        }
    },
    getCpuNum: function () {
        return cpu.num();
    },
    getCpuUsage: function () {
        return cpu.usage();
    },
    init: function (pf, app) {
        prefix = pf || '';
        prefix = prefix ? prefix + '_' : '';
        cpu.init();
        monitor.init();
        setInterval(function () {
            var memUsage = process.memoryUsage();
            Monitor.recordVal('mem_rss_usage', Math.floor(memUsage.rss / 1024) / 1024);
            Monitor.recordVal('mem_heap_usage', Math.floor(memUsage.heapUsed / 1024) / 1024);
            Monitor.recordVal('mem_heap_size', Math.floor(memUsage.heapTotal / 1024) / 1024);
            Monitor.recordVal('cpu_usage', cpu.usageAvg());
        }, 1000);


        app && app.use(function (req, res, next) {
            if (
                /healthcheck.html/.test(req.path)
                || monitorPath == req.path
            ) {
                //ignore healthckeck and monitor data crawler
                next();
                return;
            }

            req.__startTick = process.hrtime();
            var logMonitor = function () {
                var timeSpan = process.hrtime(req.__startTick);
                var timeSpan2 = timeSpan[0] * 1000 + timeSpan[1] / 1e6;
                Monitor.recordVal('all_req_time', timeSpan2);
                Monitor.recordCnt('all_req_cnt', 1);
            };
            onFinished(res, logMonitor);
            next();
        });

        app && monitorPath && app.use(monitorPath, function (req, res, next) {
            res.status(200);
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", 0);
            res.header("Content-Type", "text/plain");
            res.send(monitor.getExportData().join('\n') + '\n');
        });
    }
};

