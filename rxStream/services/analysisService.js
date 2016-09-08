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
    * 获取指定ID的分析模型 --OK
    * 必须传参id
    * @return
    */
  .callback('/services/analysis/get', 'get', function (req, res, next, callback) {
    var id = req.query.id;
    if (!id) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.ANALYSIS_GET_ID_LOSE));
      return;
    }
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/analysis/' + id
    });
    httpClient.get(function (responseData) {
      if (responseData.dataObject && responseData.dataObject.type) {
        responseData.dataObject.type = AppPage.BusinessData.AnalysisTypes[responseData.dataObject.type];
      }
      callback(responseData);
    });
  })
  /*
   * 获取所有的分析类别--OK
   */
  .callback('/services/analysis/getAnalysisTypes', 'get', function (req, res, next, callback) {

    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/analysis/models'
    });
    httpClient.get(function (responseData) {

      if (responseData.dataObject) {
        responseData.dataObject.forEach(function (item) {
          item.type = AppPage.BusinessData.AnalysisTypes[item.type];
        });
      }
      callback(responseData);
    });
  })
  /*
   * 获取某个AppId的所有事件数据量--OK
   */
  .callback('/services/analysis/getEventCount', 'get', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req);
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/app_data_count/' + appId
    });
    httpClient.get(function (responseData) {
      callback(responseData);
    });
  })
  /*
   * 获取所有的分析对象--OK
   */
  .callback('/services/analysis/list', 'get', function (req, res, next, callback) {
    var appId = AppPage.BusinessData.getAppId(req),
      urlPath;
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    var type = req.query.type;
    if (type) {
      type = AppPage.BusinessData.GetAnalysisTypeKey(type);
      urlPath = '/stream/analysis/list/' + appId + '/' + type;
    } else {
      urlPath = '/stream/analysis/list/' + appId;
    }


    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: urlPath
    });
    httpClient.get(function (responseData) {

      if (responseData.dataObject && responseData.dataObject instanceof Array) {
        responseData.dataObject.forEach(function (item) {
          item.type = AppPage.BusinessData.AnalysisTypes[item.type];
        });
      }
      callback(responseData);
    });
  })

  /*
   * 删除指定ID的分析对象--OK
   * 要删除的参数:req.query.id
   * @return {success,msg,dataObject=null}
   */
  .callback('/services/analysis/delete', 'post', function (req, res, next, callback) {
    var id = req.query.id;
    if (!id) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.ANALYSIS_DEL_ID_LOSE));
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
  })
  /**
   * 获取分析结果--OK
   */
  .callback('/services/analysis/getAnalyzeObject', 'post', function (req, res, next, callback) {
    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      httpHost: config.analysisApiPath,
      urlPath: '/stream/analysis/query',
      queryParams: req.query,
      formData: JSON.parse(req.body.data)
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  })
  /**
   * 保存分析模型（新增+修改）--OK
   * FORM-DATA格式:{analysisObject:"{...}"}
   * @return {
   *            success:true,
   *            msg:'',
   *            dataObject:{id,name,templateId,comment,type}
   *          }
   */
  .callback('/services/analysis/saveAnalysis', 'post', function (req, res, next, callback) {

    var appId = AppPage.BusinessData.getAppId(req),
      urlPath;
    if (!appId) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
      return;
    }
    var formData;
    if (!req.body.analysisObject) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.ANALYSIS_UPDATE_FORMAT_ERROR + '必须包含analysisObject属性'));
      return;
    }
    formData = JSON.parse(req.body.analysisObject);
    var id = formData.id;
    if (!formData.type || !formData.comment || !formData.name || !formData.file) {
      callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.ANALYSIS_UPDATE_FORMAT_ERROR + '新增对象属性缺失'));
      return;
    }
    formData.type = AppPage.BusinessData.GetAnalysisTypeKey(formData.type);
    //如果id为空，则为新增分析模型，否则为更新分析模型操作，使用的接口不一样
    var url = id ? '/stream/analysis/update' : '/stream/analysis/create';
    formData.appId = appId;

    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: url,
      formData: formData
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  });