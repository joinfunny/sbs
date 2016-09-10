var host = require('../runtime/host');
// dev:开发环境, test:开发环境，release:上线环境
host = host[process.env.ENV || 'dev'];
process.env.PORT = host.appPort;

var config = {
  rootPath: host.rootUrl + ':' + host.appPort,
  apiPath: host.apiPath,
  analysisApiPath: host.analysisRemoteHost,
  projectName: 'rxStream',
  dbUser: 'rxStream',
  dbPass: 'rxStream',
  dbAddress: host.dbAddress,
  dbPort: host.dbPort,
  dbName: 'rxStreamSessionDB',
  email: 'webMaster@rongcapital.cn',
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  },
  remoteHost: host.remoteHost,
  metricHost: host.metricHost,
  sdkUrl: host.sdkUrl,
  sdkServerUrl: host.sdkServerUrl,
  appId: host.appId,
  /**
   * Session存储内容属性
   */
  session: {
    /**
     * 登录用户ID
     */
    __USER_ID__: '__USER_ID__',
    /**
     * 登录用户名称
     */
    __USER_NAME__: '__USER_NAME__',
    /**
     * 登录时间
     */
    __LOGIN_TIME__: '__LOGIN_TIME__',
    /**
     * 登录的验证码
     */
    __CAPTCHA__: '__CAPTCHA__',
    /**
     * 登录次数
     */
    __LOGIN_COUNT__: '__LOGIN_COUNT__',
    /**
     * 登录用户对应的APPId
     */
    __APP_ID__:'__APP_ID__'
  },
  /**
   *不需要授权验证的路由
   */
  outAuthRoutes: [
    '/login',
    '/Login',
    '/dologin',
    '/registuser',
    '/regist',
    '/captcha',
    '/introduce',
    '/introduce/index',
  ],
  /**
   *不需要授权验证的服务
   */
  outAuthServices: [
    '/services/user/login',
    '/services/user/signup',
    '/services/user/status'
  ]
};
module.exports = config;