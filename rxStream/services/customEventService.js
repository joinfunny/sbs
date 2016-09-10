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
   * 自定义事件Schema重置
   */
  .callback('/services/customEvent/schema/resubmit', 'post', function (req, res, next, callback) {
    var dataResponse = {};
    dataResponse.success = true;
    dataResponse.msg = '';
    dataResponse.data = [];
    callback(dataResponse);
    return;

    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/bas/operation/schema/resubmit/',
      queryParams: req.query,
      formData: req.body
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 加载所有事件类型的所有属性（包含维度属性和指标属性）
   */
  .callback('/services/customEvent/getAllFields', 'get', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req);
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/events/props/' + appId,
      queryParams: req.query,
      formData: req.body
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 获取所有的事件类型
   */
  .callback('/services/customEvent/getAllEventType', 'get', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req);
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/events/' + appId,
      queryParams: req.query,
      formData: req.body
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 新建事件类型
   */
  .callback('/services/customEvent/addEvent', 'post', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req);
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    var body = JSON.parse(req.body.data);
    body.data.appId = +appId;
    body.props.forEach(function (item) {
      item.filterMode = +item.filterMode;
    });
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/event',
      queryParams: req.query,
      formData: body
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 更新事件信息
   */
  .callback('/services/customEvent/updateEvent', 'post', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req);
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    var body = JSON.parse(req.body.data);
    body.appId = +appId;
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/event/up',
      queryParams: req.query,
      formData: body
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 更新事件基础信息，用来更新事件的是否可见
   */
  .callback('/services/customEvent/saveEventBase', 'post', function (req, res, next, callback) {
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/bas/services/config/saveEventBase',
      queryParams: req.query,
      formData: req.body
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 获取事件默认属性
   */
  .callback('/services/customEvent/getDefaultProperty', 'get', function (req, res, next, callback) {
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/event/props/default',
      queryParams: req.query
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 获取事件属性通过id
   */
  .callback('/services/customEvent/getPropertyById', 'get', function (req, res, next, callback) {
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/event/props/' + req.query.eventId,
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 获取事件信息通过id
   */
  .callback('/services/customEvent/getEventInfoById', 'get', function (req, res, next, callback) {
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/event/' + req.query.eventId,
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 删除事件通过id
   */
  .callback('/services/customEvent/deleteEventById', 'get', function (req, res, next, callback) {
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/event/del/' + req.query.eventId
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 更新事件属性
   */
  .callback('/services/eventObject/updateEventProperty', 'post', function (req, res, next, callback) {
    var body = JSON.parse(req.body.data);
    body.forEach(function (item) {
      item.filterMode = +item.filterMode;
    });
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/event/props/up/' + req.query.eventId,
      formData: body
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 删除事件属性
   */
  .callback('/services/customEvent/deleteProperty', 'get', function (req, res, next, callback) {
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/event/prop/del/' + req.query.eventId + '/' + req.query.propId
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 检测属性重名
   */
  .callback('/services/customEvent/propRepeat', 'get', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req);
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    var formData = {
      "type": req.query.type,
      "name": req.query.name,
      "value": encodeURIComponent(req.query.value)
    };
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/event/checkname/' + appId,
      formData: formData
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  });