var request = require('request');
var _ = require('lodash');
var config = global.config || require('./appConfig');
var AppPage = require('./AppPage');
var log = require("./log").logger("httpClient"); // logger中的参数随便起
var BusinessData = require('./AppPage/BusinessData');

var MSG = {
  NOT_EXPECTED_PARAMS: '不符合预期的传参'
};
/**
 * Http远程请求
 * @param {JSON} opts {req:请求输入对象,res:输出对象,httpHost:调用host地址}
 */
function HttpClient(opts) {
  if (opts.res) {
    this.res = opts.res;
  } else {
    throw new Error(MSG.NOT_EXPECTED_PARAMS + " res参数不可为空.");
  }
  if (opts.req) {
    this.req = opts.req;
  } else {
    throw new Error(MSG.NOT_EXPECTED_PARAMS + " req参数不可为空.");
  }
  if (opts.urlPath) {
    this.urlPath = opts.urlPath;
    if (!(Object.prototype.toString.call(this.urlPath) === '[object String]' && this.urlPath.length > 0)) {
      throw new Error(MSG.NOT_EXPECTED_PARAMS + " urlPath必须为字符串，且不可为空.");
    }
  } else {
    throw new Error(MSG.NOT_EXPECTED_PARAMS + " urlPath参数不可为空.");
  }
  this.httpHost = opts.httpHost || config.remoteHost;
  this.options = _.extend(true, {
    httpHost: this.httpHost
  }, opts);
}


HttpClient.prototype = {
  responseJsonData: null,
  responseText: '',
  /**
   * 设置请求输出对象
   * @param {object} res 输出对象
   */
  setResponse: function (res) {
    this.response = res;
  },
  /**
   * 设置请求输入对象
   * @param {object} req 输入对象
   */
  setRequest: function (req) {
    this.request = req;
  },
  /**
   * 设置请求要发送的主机地址
   * @param {string} host 主机地址
   */
  setHttpHost: function (host) {
    this.httpHost = host;
  },
  /**
   * 发送事件完毕后触发
   */
  onSendComplete: function (err, requestData) {
    this.res.json(requestData);
    this.res.end();
  },
  /**
   * 单次执行
   * @param  {}   options  [description]
   */
  send: function (callback) {
    var that = this,
      options = that.options;
    if (options.beforeSend) {
      options.beforeSend.call(that, options);
    }
    if (!options.urlPath) {
      throw 'http请求地址不可为空.';
    }

    var arr = [];

    if (options.queryParams) {
      for (var param in options.queryParams) {
        if (options.queryParams.hasOwnProperty(param)) {
          arr.push(param + '=' + options.queryParams[param]);
        }
      }
    }

    var url = that.httpHost + options.urlPath + (arr.length > 0 ? ('?' + arr.join('&')) : '');

    console.log('begin http request from "' + url + '"');

    var onResponse = function (error, response, body) {
      var dataObject;
      if (!error && response && response.statusCode === 200) {
        dataObject = BusinessData.HttpClientResponseDataFormatter(response);

        console.log('remote call success, url:' + url + ', request body :" ' + JSON.stringify(response.body, null, 2) + ' "');

        if (dataObject.success) {
          if (options.onSuccess) {
            options.onSuccess.call(that, dataObject);
          }
        } else {
          if (options.onFiald) {
            options.onFiald.call(that, dataObject);
          }
        }

        that.dataObject = dataObject;

      } else {

        dataObject = {};
        dataObject.success = false;
        dataObject.msg = error || '服务请求失败，请联系系统管理员！';
        dataObject.statusCode = response && response.statusCode || '';

        if (process.env.ENV === 'dev') {
          dataObject.url = url;
          dataObject.responseBody = response && response.body ? JSON.stringify(response.body) : '';
          log.error(dataObject);
        }
        if (options.onFiald) {
          options.onFiald.call(that, dataObject);
        }
        that.dataObject = dataObject;
      }

      if (callback) {
        callback.call(that, that.dataObject);
      }
    };
    if (process.env.ENV === 'dev') {
      console.log('method:' + options.method);
      console.log('url:' + url);
      console.log('queryParams:' + JSON.stringify(options.queryParams || {}, null, 2));
      console.log('formData:' + JSON.stringify(options.formData || {}, null, 2));
    }
    if (options.method === 'get') {
      request.get(url, onResponse);
    } else {
      request.post(url, {
        json: true,
        body: options.formData || {}
      }, onResponse);
    }
  },
  /**
   * Get请求
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  get: function (callback) {
    this.options.method = 'get';
    this.send(callback);
  },
  /**
   * Post请求
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  post: function (callback) {
    this.options.method = 'post';
    this.send(callback);
  }
};

module.exports = HttpClient;