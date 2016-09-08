var express = require('express');
var crypto = require('crypto');
var config = global.config || require('../runtime/appConfig');

/**
 * 如果Session验证失败，跳回Login页面
 * 如果Session验证成功，继续执行
 */
function Authentication(req, res, next) {
  var outAuthRoutes = config.outAuthRoutes;
  var outAuthServices = config.outAuthServices;

  if (outAuthRoutes.indexOf(req.path) >= 0) {
    next();
    return;
  }

  if (req.session[config.session.__USER_ID__]) {
    console.log(req.session[config.session.__USER_NAME__] + " has login.\r\n");
    next();
  } else {
    //服务授权验证
    if (/^\/services\//.test(req.path)) {
      if (outAuthServices.indexOf(req.path) >= 0) {
        next();
        return;
      }
      res.status(200).json({
        success: false,
        msg: 'Not authorized.'
      });
      res.end();
    } else {
      //路由授权验证
      console.log("un-login,redirect to login\r\n");
      //res.redirect('/login?' + Date.now());
      res.redirect('/introduce');
    }

  }

}

module.exports = Authentication;