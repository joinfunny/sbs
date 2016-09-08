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
     * 事件对象列表
     */
    .callback('/services/eventObject/list', 'get', function (req, res, next, callback) {
        var appId = AppPage.BusinessData.getAppId(req);
        if (!appId) {
            callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
            return;
        }
        var httpClient = new HttpClient({
            req: req,
            res: res,
            /*urlPath: '/stream/eventobjects' + req.body.appId,*/
            urlPath: '/stream/eventobjects/' + appId,
            formData: req.body
        });
        httpClient.get(function (responseData) {
            callback(responseData);
        });
    })
    /*
     * 添加新对像
     */
    .callback('/services/eventObject/addObject', 'post', function (req, res, next, callback) {
        var appId = AppPage.BusinessData.getAppId(req);
        if (!appId) {
            callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
            return;
        }
        var body = JSON.parse(req.body.data);
        body.props.forEach(function (item) {
            item.filterMode = +item.filterMode;
        });
        var httpClient = new HttpClient({
            req: req,
            res: res,
            urlPath: '/stream/eventobject/' + appId,
            formData: body
        });
        httpClient.post(function (responseData) {
            callback(responseData);
        });
    })
    /*
     * 查询单个事件对像
     */
    .callback('/services/eventObject/getObject', 'get', function (req, res, next, callback) {
        var httpClient = new HttpClient({
            req: req,
            res: res,
            urlPath: '/stream/eventobject/' + req.query.objectId,
        });
        httpClient.get(function (responseData) {
            callback(responseData);
        });
    })
    /*
     * 更新事件对像
     */
    .callback('/services/eventObject/updateObject', 'post', function (req, res, next, callback) {
        var appId = AppPage.BusinessData.getAppId(req);
        if (!appId) {
            callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
            return;
        }
        var body = JSON.parse(req.body.data);
        body.props.forEach(function (item) {
            item.filterMode = +item.filterMode;
        });
        var httpClient = new HttpClient({
            req: req,
            res: res,
            urlPath: '/stream/eventobject/up/' + appId,
            formData: body
        });
        httpClient.post(function (responseData) {
            callback(responseData);
        });
    })
    /*
     * 加载所有事件对像的所有属性
     */
    .callback('/services/eventObject/getAllFields', 'get', function (req, res, next, callback) {
        var appId = AppPage.BusinessData.getAppId(req);
        if (!appId) {
            callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
            return;
        }
        //远程调用
        var httpClient = new HttpClient({
            req: req,
            res: res,
            urlPath: '/stream/eventobjects/props/' + appId,
            queryParams: req.query,
            formData: req.body
        });
        httpClient.get(function (responseData) {
            callback(responseData);
        });
    })
    /*
     * 删除对象属性
     */
    .callback('/services/eventobjects/deleteProperty', 'get', function (req, res, next, callback) {
        //远程调用
        var httpClient = new HttpClient({
            req: req,
            res: res,
            urlPath: '/stream/eventobject/prop/del/'+ req.query.objectId + '/' + req.query.propId,
        });
        httpClient.get(function (responseData) {
            callback(responseData);
        });
    })
    /*
     * 默认对象列表
     */
    .callback('/services/eventObject/defaultObject', 'get', function (req, res, next, callback) {
        var appId = AppPage.BusinessData.getAppId(req);
        if (!appId) {
            callback(AppPage.BusinessData.GetCallBackObject(false, AppPage.MSG.APPID_LOSE));
            return;
        }
        var httpClient = new HttpClient({
            req: req,
            res: res,
            urlPath: '/stream/eventobjects/default/' + appId,
            formData: req.body
        });
        httpClient.get(function (responseData) {
            callback(responseData);
        });
    });