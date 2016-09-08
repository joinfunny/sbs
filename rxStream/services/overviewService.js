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
  /*
   * 获取所有的概览数据--OK
   */
  .callback('/services/overview/list', 'get', function (req, res, next, callback) {

    var appId = AppPage.BusinessData.getAppId(req);
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }

    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/analysis/list/' + appId + '/0'
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 获取单个概览数据--OK
   */
  .callback('/services/overview/get', 'get', function (req, res, next, callback) {
    var id = req.query.id;
    if (!id) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.OVERVIEW_GET_ID_LOSE));
      return;
    }
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/analysis/' + id
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 保存单个概览数据--OK
   */
  .callback('/services/overview/save', 'post', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req),
      urlPath;
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    var formData;
    if (!req.body.data) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.OVERVIEW_UPDATE_FORMAT_ERROR + '必须包含overviewObject属性'));
      return;
    }
    formData = JSON.parse(req.body.overviewObject);
    var id = formData.id;
    if (!formData.type || !formData.comment || !formData.name || !formData.file) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.OVERVIEW_UPDATE_FORMAT_ERROR + '新增对象属性缺失'));
      return;
    }
    var url = id ? '/stream/analysis/update' : '/stream/analysis/create';
    formData.appId = appId;
    formData.type = 0;
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: url,
      formData: formData
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /*
   *删除指定的概览数据--OK
   */
  .callback('/services/overview/delete', 'post', function (req, res, next, callback) {
    var id = req.query.id;
    if (!id) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.OVERVIEW_DEL_ID_LOSE));
      return;
    }
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/analysis/delete/' + id
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  });