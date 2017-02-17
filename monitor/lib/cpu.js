/**
 * Created by ds3783 on 2017/2/17.
 */

var os = require('os');


function getCPUTimes() {
    var cpus = os.cpus();
    var data = [];
    cpuNum = cpus.length;
    for (var i = cpuNum - 1; i >= 0; i--) {
        var times = cpus[i].times;
        data.push({
            idle: times.idle,
            total: times.idle + times.user + times.nice + times.sys + times.irq
        });
    }
    return data;
}

function getCPUUsage(data) {
    if (data.length < 3) {
        return [];
    }
    var first = data[0];
    var second = data[1];
    var third = data[2];
    var usage = [];
    for (var i = 0; i < first.length; i++) {
        var first_idle = first[i].idle;
        var first_total = first[i].total;
        var second_idle = second[i].idle;
        var second_total = second[i].total;
        var third_idle = third[i].idle;
        var third_total = third[i].total;
        var first_usage = 1 - (second_idle - first_idle) / (second_total - first_total);
        var second_usage = 1 - (third_idle - second_idle) / (third_total - second_total);
        var per_usage = (first_usage + second_usage) / 2 * 100;
        usage.push(per_usage.toFixed(1));
    }
    return usage;
}


var usageDatas = [];
var cpuNum = 0;


module.exports = {
    init: function () {
        setInterval(function () {
            usageDatas.push(getCPUTimes());
            while (usageDatas.length > 3) {
                usageDatas.shift();
            }
        }, 500);
    },
    num: function () {
        return os.cpus().length;
    },
    usage: function () {
        return getCPUUsage(usageDatas);
    },
    usageAvg: function () {
        var usages = getCPUUsage(usageDatas);
        var sum = 0;
        var len = usages.length;
        for (var i = 0; i < len; i++) {
            sum += usages[i] * 1;
        }
        return len > 0 ? sum / len : 0;
    }
};
