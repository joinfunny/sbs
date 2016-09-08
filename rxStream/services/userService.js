var express = require('express');
var crypto = require('crypto');
var async = require('async');
var Utils = require('../runtime/AppPage/Utils');
var ServiceHandler = require('../runtime/serviceHandler');
var HttpClient = require('../runtime/httpClient');
var config = global.config || require('../runtime/appConfig');

var MSG = {
  USERNAME_REQIRED: '用户名不能为空\r\n',
  PWD_REQIRED: '密码不能为空\r\n',
  NICKNAME_REQIRED: '用户昵称不能为空\r\n',
  EMAIL_REQIRED: '邮箱不能为空\r\n',
  PHONE_REQIRED: '手机号码不能为空\r\n',
  QUERY_FAILD: '查询失败\r\n',
  USER_NOTEXISTS: '用户名或密码输入错误\r\n',
  CAPTCHA_DIFF: '验证码输入有误！\r\n'
};

module.exports = ServiceHandler
  /*
   * 用户登录服务--ERROR
   * 需要将登录用户对应的appId和对应的用户信息保存到Session中
   */
  .callback('/services/user/login', 'post', function (req, res, next, callback) {
    var formData = req.body, actionResult = {};

    (!req.session[config.session.__LOGIN_COUNT__]) && (req.session[config.session.__LOGIN_COUNT__] = 0);

    req.session[config.session.__LOGIN_COUNT__] += 1;

    if (!formData.userName || !formData.password) {

      if (!formData.userName) {
        actionResult.success = false;
        actionResult.message = MSG.USERNAME_REQIRED;
      }
      if (!formData.password) {
        actionResult.success = false;
        actionResult.msg = MSG.PWD_REQIRED;
      }
      callback(actionResult);
      return;
    }


    //验证校验码
    /*if (req.session[config.session.__LOGIN_COUNT__] > 3 && req.session[config.session.__CAPTCHA__] !== formData.captha) {
      Utils.log(MSG.CAPTCHA_DIFF);
      actionResult.success = false;
      actionResult.message = MSG.CAPTCHA_DIFF;
      callback(actionResult);
      return;
    }*/

    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/user/login',
      formData: formData
    });
    httpClient.post(function (responseData) {
      if (responseData.success) {
        this.req.session[config.session.__USER_ID__] = responseData.dataObject['id'];
        this.req.session[config.session.__USER_NAME__] = responseData.dataObject['userName'];
      }

      callback(responseData);
    });
  })
  .callback('/services/user/logout', 'post', function (req, res, next, callback) {
    var actionResult = {};
    res.cookie(config.session.__USER_ID__, 'null', { maxAge: 0 });
    res.cookie(config.session.__USER_NAME__, 'null', { maxAge: 0 });
    for (var param in req.session) {
      if (req.session.hasOwnProperty(param)) {
        delete req.session[param];
      }
    }
    actionResult.success = true;
    actionResult.msg = "";
    callback(actionResult);
  })
  /*
   * 用户注册服务--OK
   *
   */
  .callback('/services/user/signup', 'post', function (req, res, next, callback) {
    var formData = req.body || {}, actionResult = {};
    /**
     * 前端传过来的数据结构：
    {
      userName: 'stream1'
      password: 'stream1'
      userAppellation: 'dfsa'
      tel: '15810929612'
      email: 'fdsafs@163.com'
      terminalType: 'PC'
    }
    后端需要的数据数据结构：
    {
      "userName": "abc",
      "password": "pass",
      "nickName": "cba",
      "email": "abc@rongcapital.cn"
      "tel": "13812345678"
    }
     */

    formData.nickName = formData.userAppellation || '';

    if (!formData.userName) {
      actionResult.success = false;
      actionResult.message = MSG.USERNAME_REQIRED;
      callback(actionResult);
      return;
    }
    if (!formData.password) {
      actionResult.success = false;
      actionResult.message = MSG.PWD_REQIRED;
      callback(actionResult);
      return;
    }
    if (!formData.nickName) {
      actionResult.success = false;
      actionResult.message = MSG.NICKNAME_REQIRED;
      callback(actionResult);
      return;
    }
    if (!formData.email) {
      actionResult.success = false;
      actionResult.message = MSG.EMAIL_REQIRED;
      callback(actionResult);
      return;
    }
    if (!formData.tel) {
      actionResult.success = false;
      actionResult.message = MSG.PHONE_REQIRED;
      callback(actionResult);
      return;
    }


    //远程调用
    var httpClient = new HttpClient({
      req: req,
      res: res,
      urlPath: '/stream/user/register',
      formData: formData
    });
    httpClient.post(function (responseData) {
      callback(responseData);
    });
  });