'use strict'

var sha1 = require('sha1')
var Wechat = require('./wechat')
var util = require('./util')
var getRawBody = require('raw-body')




//为了能向下传递，所以用promise

module.exports = function(opts,handler){
	var wechat = new Wechat(opts)
	return function *(next){//Koa只接受中间件g.js return回去的生成器函数
		//var that = this
		var token = opts.token
		var signature = this.query.signature
		var nonce = this.query.nonce
		var timestamp = this.query.timestamp
		var echostr = this.query.echostr
		var str = [token,timestamp,nonce].sort().join('')
		var sha = sha1(str)
		
		console.log(signature+ '/n')
		console.log(sha+ '/n')
		console.log(echostr+ '/n')
		
		if(this.method == 'GET'){ //get是微信官方发送请求
			if(sha === signature){
				this.body = echostr + ''
			}else{
				this.body = 'wrong'
			}	
		}else if(this.method == 'POST'){//post是用户发送请求
			if(sha !== signature){
				this.body = 'wrong'
				return false
			}
			var data = yield getRawBody(this.req,{
				length: this.length,
				limit: '1mb',
				encoding: this.charset
			})
			//console.log(data.toString())
			var content = yield util.parseXMLAsync(data)//解析XML

			//console.log(content)
			var message = util.formatMessage(content.xml)//格式化content

			this.weixin = message
			//console.log(this.weixin.MsgType)
			yield handler.call(this, next) //通过call改变执行上下文,next作为参数传递给handler

			wechat.reply.call(this)
		}
	}
}


