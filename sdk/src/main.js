var _ = require('./utils');
var rxStream = require('./rxStream');

var defaultConfig = {
    sendLimit: 10,
    crossSubDomain: true,
    loadTime: 1 * new Date(),
    autoTrack: true,
    showLog: false
};
var rx = window[rxStream.config.LIB_KEY] || rxStream.config.LIB_KEY;
if (rx) {
    rx = window[rx]
}

if (rx.para) {
    _.extend(defaultConfig, rx.para);
}

_.extend(rx, rxStream);

rx.init(defaultConfig);

