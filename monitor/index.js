/**
 * Created by ds3783 on 2017/2/17.
 */
var process = require('process');
var cpu = require('./lib/cpu');
var monitor = require('./lib/monitor');
var onFinished = require('on-finished');

var monitorPath = '/monitor.jsp';


var prefix = '';
var suffix = '';

var Monitor = module.exports = {
    recordCnt: function (code, cnt) {
        monitor.recordCnt(prefix + code + suffix, cnt);
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
        monitor.recordVal(prefix + code + suffix, val);
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
    init: function (options) {

        monitor.init();

        options = options || {};

        prefix = options.prefix || '';
        suffix = options.suffix || '';
        prefix = prefix ? prefix + '_' : '';
        suffix = suffix ? suffix + '_' : '';
        monitorPath = options.monitorPath || monitorPath;


        var app = options.app;
        app && app.use(function (req, res, next) {
            if (
                /healthcheck.html/.test(req.path)
                || monitorPath === req.path
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
                if (options['mon404']) {
                    if (res.status == 404 || res.getHeader('X-Error') == 404) {
                        Monitor.recordCnt('404_req_cnt', 1);
                    }
                }
                if (options['mon5xx']) {
                    if (res.status > 499 && res.status < 600) {
                        Monitor.recordCnt('5xx_req_cnt', 1);
                    }
                }
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

        if (options['cpu']) {
            cpu.init();
        }

        var monitorEverySecond = options['cpu'] || options['mem'];
        if (monitorEverySecond) {
            setInterval(function () {
                if (options['mem']) {
                    var memUsage = process.memoryUsage();
                    Monitor.recordVal('mem_rss_usage', Math.floor(memUsage.rss / 1024) / 1024);
                    Monitor.recordVal('mem_heap_usage', Math.floor(memUsage.heapUsed / 1024) / 1024);
                    Monitor.recordVal('mem_heap_size', Math.floor(memUsage.heapTotal / 1024) / 1024);
                }
                if (options['cpu']) {
                    Monitor.recordVal('cpu_usage', cpu.usageAvg());
                }
            }, 1000);
        }
    }
};

