var express = require('express');
var crypto = require('crypto');
var async = require('async');
var Utils = require('../runtime/AppPage/Utils');
var ServiceHandler = require('../runtime/serviceHandler');
var HttpClient = require('../runtime/httpClient');
var config = global.config || require('../runtime/appConfig');

module.exports = ServiceHandler
  /*
   * 更新APP meta信息--LOSE
   */
  .callback('/services/app/metaupdate/:appId', 'post', function (req, res, next, callback) {
    var appId = req.params.appId;
    if (!appId) {
      callback({
        success: false,
        dataObject: null,
        msg: '参数错误.'
      });
      return;
    }
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      ///bas/services/appmeta/update/+appId---目前此接口丢失
      urlPath: '/bas/services/appmeta/update/' + appId
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 创建APP--OK
   */
  .callback('/services/app/create', 'post', function (req, res, next, callback) {
    var userId = req.session[config.session.__USER_ID__];
    if (!userId) {
      callback({
        success: false,
        dataObject: null,
        msg: '参数错误.'
      });
      return;
    }
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/createapp',
      queryParams: { userId: userId }
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 检测指定appId下sdk是否收集到了数据--LOSE
   */
  .callback('/services/app/checksdk/:appId', 'post', function (req, res, next, callback) {
    var appId = req.params.appId;
    if (!appId) {
      callback({
        success: false,
        dataObject: null,
        msg: '参数错误.'
      });
      return;
    }
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      httpHost: config.metricHost,
      //urlPath: '/bassass/operation/checksdk/' + appId,
      urlPath: '/bassass/operation/checksdk/' + appId,
      queryParams: req.query || {},
      formData: req.body || {}
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  });