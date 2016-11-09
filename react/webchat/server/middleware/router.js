'use strict';

var express = require('express');
var router = express.Router({mergeParams: false});
var config = require('../config.js');
var debug = require('debug');
var _ = require('lodash');
var FrontEnd = require('../components/frontend.js');


// page's route info, pick up from config.js
var pageRoutes = {};

_.each(config.Controllers, function(configs, controllerName) {
    var routes = configs.routes;
    var controller = configs.controller;
    var Controller = require(`../controllers/${controllerName}.js`);

    if(!Array.isArray(routes)) {
        routes = [routes];
    }

    _.flatten(routes).forEach(function(route) {
        route = route.replace(/^\//, '');
        pageRoutes[route] = {
            c: controllerName, // controller文件名
            s: FrontEnd.getHashFileName(configs.stylesheet, 'css'), // css文件名
            l: configs.login, // 是否需要登录态才能访问
            d: configs.d, // 异步是否需要请求数据,
            h: FrontEnd.getHash('pages/'+controllerName, 'js') // js文件hash
        }
    });

    routes.forEach(function(route) {
        router.all(route, function(req, res, next) {
            req.controller = new Controller(req, res);
            req.controllerName = controllerName;
            req.controllerConfig = configs;
            next();
        });
    });
});

debug('general')('generate route for page:');
debug('general')(JSON.stringify(pageRoutes, null, 4));

module.exports = {
    pageRoutes: pageRoutes,
    router: router
};