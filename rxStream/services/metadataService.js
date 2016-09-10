var express = require('express');
var crypto = require('crypto');
var async = require('async');
var Utils = require('../runtime/AppPage/Utils');
var ServiceHandler = require('../runtime/serviceHandler');
var HttpClient = require('../runtime/httpClient');
var config = global.config || require('../runtime/appConfig');
require('../runtime/AppPage/BusinessData');
require('../runtime/AppPage/MSG');

module.exports = ServiceHandler

  /**
   *获取事件的配置数据--OK
   */
  .callback('/services/metadata/config', 'get', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req);
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }

    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/events/objects/props/' + appId
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /**
   * 获取维度值--ERROR
   */
  .callback('/services/metadata/dimension', 'get', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req);
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    var fieldName = req.query.fieldName;
    if (!fieldName) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.METADATA_GET_FIELD_LOSE));
      return;
    }
    var showCount = req.query.showCount || 100;
    if (!showCount) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.METADATA_GET_COUNT_LOSE));
      return;
    }

    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/dimensions/' + appId + '/' + fieldName + '/' + showCount
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  });