var fs = require('fs');
var path = require('path');
var config = require('../config.js');
var logerrorfile = path.join(__dirname, '../../logs/error.txt');
var logsuccessfile = path.join(__dirname, '../../logs/success.txt');

if (config.debug) {
    var logfile = path.join(__dirname, '../../logs');
    var level = 'log';
} else {
    var logfile = path.join(__dirname, '../../../logs');
    var level = 'warn';
}

var logger = require('tracer').dailyfile({root: logfile, maxLogFiles: 10000, format: "{{timestamp}} <{{title}}> {{message}}", dateformat: "yyyy/mm/dd HH:MM:ss", level: level});

module.exports.error = function () {
    logger
        .error
        .apply(logger, arguments);
};

module.exports.warn = function () {
    logger
        .warn
        .apply(logger, arguments);
};

module.exports.info = function () {
    logger
        .info
        .apply(logger, arguments);
};

module.exports.debug = function () {
    logger
        .debug
        .apply(logger, arguments);
};

module.exports.trace = function () {
    logger
        .trace
        .apply(logger, arguments);
};