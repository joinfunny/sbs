/*Create by jiangfeng*/
var express = require('express');
var request = require('request');
var HttpClient = require('../runtime/httpClient');

module.exports = {
  /**
   *
   */
  router: null,
  /**
   * 以回调的方式请求服务
   * --常用在请求处理逻辑中不能同步返回数据的业务场景下调用
   * @param  {string}   reqPath 请求地址
   * @param  {string}   method  get/post
   * @param  {Function}   exec    必须带有四个参数的函数体:req,res,next,callback
   * @return {Router}         当前注册完毕的Router对象
   */
  callback: function (reqPath, method, exec) {
    if (this.router === null) {
      this.router = express.Router();
    }
    method = method || 'get';
    this.router[method](reqPath, function (req, res, next) {
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      var params = Array.prototype.slice.call(arguments, 0);
      params.push(function (actionResult) {
        res.json(actionResult);
        res.end();
      });
      exec.apply(this, params);
    });
    return this;
  },
  /**
   * 直接返回的方式请求服务
   * --常用在请求处理逻辑中能同步返回数据的业务场景下调用
   * @param  {string} reqPath 请求地址
   * @param  {string} method  get/post
   * @param  {Function} exec    必须带有三个参数的函数体:req,res,next
   * @return {Router}         当前注册完毕的Router对象
   */
  send: function (reqPath, method, exec) {
    if (this.router === null) {
      this.router = express.Router();
    }
    method = method || 'get';
    this.router[method](reqPath, function (req, res, next) {
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      var actionResult = exec.apply(this, arguments);
      res.json(actionResult);
      res.end();
    });
    return this;
  }
};