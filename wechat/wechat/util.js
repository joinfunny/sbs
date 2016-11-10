'use strict'

var xml2js = require('xml2js')
var Promise = require('bluebird')
var tpl = require('./tpl')

exports.parseXMLAsync = function(xml){
	return new Promise(function(resolve,reject){
		xml2js.parseString(xml,{trim:true},function(err,content){
			if(err) reject(err)
			else resolve(content)
		})
	})
}

function formatMessage(result){
	var message = {}

	if(typeof result == 'object'){
		var keys = Object.keys(result) //拿到所有的key,keys是数组对象

		for(var i=0;i<keys.length;i++){
			var item = result[keys[i]]//每个key的值,item还是数组对象
			var key = keys[i]

			if(!(item instanceof Array) || item.length ===0){//如果值是数组或长度为0
				continue
			}

			if(item.length === 1){//如果值只有一个
				var val = item[0]

				if(typeof val === 'object'){
					message[key] = formatMessage(val)
				}else{
					message[key] = (val || '').trim()
				}
			}else{//如果这个item是数组
				message[key] = [] //那么在message里面把这个key也初始化为数组

				for(var j=0;j<item.length;j++){//遍历item，把元素push进message
					message[key].push(formatMessage(item[j]))
				}
			}
		}
	}
	return message
}

exports.formatMessage = formatMessage

exports.tpl = function(content,message){
	var info = {}
	var type = 'text'
	var fromUserName = message.FromUserName
	var toUserName = message.ToUserName
	//console.log('util.js中的：' + content)
	if(Array.isArray(content)){     //如果内容是数组，则把type改为news图文
		type = 'news'
	}
	
	type = content.type || type
	console.log(type)
	info.content = content
	info.creatTime = new Date().getTime()
	info.msgType = type
	info.toUserName = fromUserName
	info.fromUserName = toUserName

	return tpl.compiled(info)
}