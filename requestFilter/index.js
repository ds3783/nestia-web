/**
 * Created by ds3783 on 2017/4/17.
 */


var getIp = function (req) {
    /*
     * 1. x-forward-for  'A, B, C, D' search sequence: D->A
     * 2. x-real-ip
     * 3. remoteAddress
     * 
     * */
    var isLocal = function (ip) {
        /*
         * 192.168.*.* considered as outer network ips,
         * due to we haven't use that ip segment in our server cluster.
         * */
        return /^(10\.0\.|172\.(1[7-9]|2[0-9]|3[01])\.).*$/.test(ip);
    };
    var ips = [];
    var fwd = req.ips || [];
    if (fwd.length > 0) {
        ips = ips.concat(fwd.reverse());
    }
    if (!!req.headers['x-real-ip']) {
        ips.push(req.headers['x-real-ip']);
    }
    ips.push(req._remoteAddress);
    for (var i = 0; i < ips.length; i++) {
        if (ips[i] && !isLocal(ips[i])) {
            return ips[i];
        }
    }
    return '';
};


module.exports = function () {

    return function (req, res, next) {
        var ip = getIp(req);
        if (!!ip) {
            req.ip = ip;
        }
        
        next();
    }
};