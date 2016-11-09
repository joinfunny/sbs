'use strict';

var react = require('react');
var config = require('../config.js');
var router = require('./router.js');
var debug = require('debug');
var JSTicket = require('../models/jsticket.js');
var fetch = require('../components/fetch.js');

module.exports = function(req, res, next) {
    var controller = req.controller;
    if(controller) {
        var promises = [];
        var controllerData = controller.getData(req.requestCookie); //这里把解析好的Cookie传进去。以便接口调用
        // 页面数据
        promises.push(controllerData);
        // 用户数据
        if(!req.query.json) {
            // 用户信息，同步页面需要给到
            // query.json = 1 属于异步请求，所以不需要用户信息
            if(req.headers.cookie && req.headers.cookie.indexOf("bx_user=") >= 0){
                var userId = req.headers.cookie.split('bx_user=')[1].split('%')[0];
            }else{
                var userId = ''
            }
            var userData = fetch('/app/appusernew/uinfo', req.headers, {tp:'get',uid:userId});
            var userPromise = new Promise(function(resolve, reject) {
                userData.then((data) => {
                    resolve(data.data);
                }, () => {
                    resolve({});
                }).catch(() => {
                    resolve({});
                });
            });

            promises.push(userPromise);
        }

        var ua = req.headers['user-agent'];
        if((/MicroMessenger/i).test(ua)) {
            var url = req.protocol + '://' + req.hostname + req.url;
            // jsticket数据
            promises.push(JSTicket.singleton().get(url));
        } else {
            promises.push(Promise.resolve({}));
        }

        req.renderDataPromise = Promise.all(promises);
    }

    next();
};