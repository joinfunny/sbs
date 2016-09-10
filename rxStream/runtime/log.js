var path = require("path");
var log4js = require("log4js");
/**
 * 日志配置
 */
exports.configure = function (configFilePath) {
  log4js.configure(configFilePath);
};

/**
 * 暴露到应用的日志接口，调用该方法前必须确保已经configure过
 * @param name 指定log4js配置文件中的category。依此找到对应的appender。
 *              如果appender没有写上category，则为默认的category。可以有多个
 * @returns {Logger}
 */
exports.logger = function (name) {
  var dateFileLog = log4js.getLogger(name);
  dateFileLog.setLevel(log4js.levels.INFO);
  return dateFileLog;
};

/**
 * 用于express中间件，调用该方法前必须确保已经configure过
 * @returns {Function|*}
 * TRACE: new Level(5000, "TRACE"),
 * DEBUG: new Level(10000, "DEBUG"),
 * INFO:  new Level(20000, "INFO"),
 * WARN:  new Level(30000, "WARN"),
 * ERROR: new Level(40000, "ERROR"),
 * FATAL: new Level(50000, "FATAL"),
 */
exports.useLog = function () {
  return log4js.connectLogger(log4js.getLogger("app"), { level: log4js.levels.INFO });
};