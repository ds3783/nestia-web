/**
 * Created by ds3783 on 2017/2/17.
 */


var cntObj = {};
var valObj = {};
var lastResult = [];

var exportRecords = function () {
    lastResult = [];
    var keySet = {};
    var add = function (k, v) {
        if (keySet[k]) {
            return;
        }
        keySet[k] = true;
        lastResult.push(k + "=" + v);
    };
    for (var i in cntObj) {
        if (cntObj.hasOwnProperty(i)) {
            add(i, cntObj[i]);
        }
    }
    for (var j in valObj) {
        if (valObj.hasOwnProperty(j)) {
            var obj = valObj[j];
            add(j, (obj.cnt > 0 ? (obj.sum / obj.cnt) : 0));
        }
    }
    keySet = null;
};


module.exports = {
    init: function () {
        setInterval(function () {
            exportRecords();
            cntObj = {};
            valObj = {};
        }, 60000);
    },
    recordCnt: function (code, cnt) {
        cntObj[code] = (cntObj[code] || 0) + (cnt || 1);
    },
    recordVal: function (code, val) {
        valObj[code] = valObj[code] || {cnt: 0, sum: 0};
        valObj[code]['cnt']++;
        valObj[code]['sum'] += val || 0;
    },
    getExportData: function () {
        return lastResult;
    }
};