var express = require('express');
var path = require('path');
//var ejs = require('ejs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require(('express-session'));
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var ioRedis = require('ioredis');

var routerRegister = require('./runtime/registRoutes');
var serviceRegister = require('./runtime/registServices');
var Authentication = require('./runtime/authentication');
var log4js = require('./runtime/log');
global.config = require('./runtime/appConfig');

var app = express();
//配置和缓存

// 指定视图目录
app.set('views', path.join(__dirname, 'views'));

//指定视图引擎
app.engine('.html', require('./runtime/ejs'));

app.set('view engine', 'html');
// 指定网站图标
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//启用log4js记录日志
log4js.configure(path.join(__dirname, "log4js.json"));
app.use(log4js.useLog());

app.use(bodyParser.json());

var log = log4js.logger('app');

var cluster = new ioRedis.Cluster([{
  port: 7000,
  host: '10.200.1.89'
}, {
    port: 7000,
    host: '10.200.1.90'
  }, {
    port: 7000,
    host: '10.200.1.91'
  }, {
    port: 7001,
    host: '10.200.1.89'
  }, {
    port: 7001,
    host: '10.200.1.90'
  }, {
    port: 7001,
    host: '10.200.1.91'
  }]);


app.use(session({
  secret: 'rxStream',
  name: 'rxStream', //这里的name值得是cookie的name，默认cookie的name是：connect.sid
  cookie: {
    maxAge: config.cookie.maxAge //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
  },
  resave: false,
  saveUninitialized: true,
  store: new RedisStore({
    //host: config.dbAddress,
    //port: config.dbPort,
    //db: config.dbName,
    logErrors: true,
    prefix: 'rxStream:',
    unset: 'destroy',
    client: cluster
  })
}));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());

app.use(function (req, res, next) {
  //跨域设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Powered-By', 'RX Stream');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.all('*', Authentication);

//注册路由
routerRegister(app);

//注册服务
serviceRegister(app);

// 404错误处理
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  log.warn('404 Not Found,originalUrl:'+req.originalUrl);
  err.status = 404;
  res.redirect('/error');
});

//开发环境错误提示
if (app.get('env') === 'dev') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    log.error(err.message);
    res.end('error:' + err + ',message:' + err.message);
    /*res.render('error', {
        message: err.message,
        error: err
    });*/
  });
}

//生产环境错误提示
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  log.error(err);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;