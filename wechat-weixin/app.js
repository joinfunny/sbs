'use strict'

var Koa = require('koa')
var path = require('path')
var fs = require('fs')
var mongoose = require('mongoose')
// var wechat = require('./wechat/g')
// var reply = require('./wx/reply')

var dbUrl = 'mongodb://localhost/imooc'

// 数据库初始化
mongoose.connect(dbUrl)

var models_path = __dirname + '/app/models'
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}

walk(models_path)



var menu = require('./wx/menu')
var wx = require('./wx/index.js')
var wechatApi = wx.getWechat()
//构建一个新实例
// var status = true
wechatApi.deleteMenu().then(function(){
	return wechatApi.createMenu(menu)
})
.then(function(msg){
	console.log(msg)
})

var app = new Koa()
var Router = require('koa-router')
var router = new Router()
var game = require('./app/controllers/game')
var wechat = require('./app/controllers/wechat')

var views = require('koa-views')

app.use(views(__dirname + '/app/views', {
  extension: 'jade'
}))

router.get('/movie', game.movie)
router.get('/wx', wechat.hear)
router.post('/wx', wechat.hear)

// app.use(wechat(wx.wechatOptions.wechat,reply.reply))  //第二个参数，在中间件handler

app
	.use(router.routes())
	.use(router.allowedMethods())



app.listen(1234)
console.log('listening 1234')