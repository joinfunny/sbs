'use strict'

var ejs = require('ejs')
var heredoc = require('heredoc')
var crypto = require('crypto')


var tpl = heredoc(function(){/*
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="initial-scale=1,minimum-scale=1,maximum-scale=1">
		<title>语音搜电影</title>
		<style>
		body{padding:0; margin:0;font-family:"Helvetica Neue",Helvetica,Arial,"Microsoft Yahei","Hiragino Sans GB","Heiti SC","WenQuanYi Micro Hei",sans-serif}
		.content{width:320px; margin:10px auto}
		h1{text-align: center; border-bottom:1px solid #b9b9b9; padding-bottom:5px; font-weight:normal;width:320px;margin:5px auto}
		#poster img{margin:0 auto}
		</style>
		
	</head>
	<body>
		<h1>点我可以识别声音哦</h1>
				
			<p  class="content" id="title"></p>
			<p  class="content" id="genres"></p>
			<p 	class="content" id="year"></p>
			<p 	class="content" id="director"></p>
			<p 	class="content" id="rating"></p>
			<div class="content" id="poster"></div>
		
		
		<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
		<script src="http://zeptojs.com/zepto-docs.min.js"></script>
		<script>
			wx.config({
			    debug: false,
			    appId: 'wx5029c5f778bbe57b', 
			    timestamp: '<%= timestamp %>', 
			    nonceStr: '<%= noncestr %>', 
			    signature: '<%= signature %>',
			    jsApiList: [
					'startRecord',
					'stopRecord',
					'onVoiceRecordEnd',
					'translateVoice',
					'onMenuShareTimeline',
					'onMenuShareAppMessage',
					'onMenuShareQQ',
					'onMenuShareWeibo',
					'onMenuShareQZone',
					'previewImage'

			    ] 
			})
			wx.ready(function(){
				wx.checkJsApi({
				    jsApiList: ['translateVoice'], 
				    success: function(res) {
				     	//alert(JSON.stringify(res))
				    }
				})
				
				//分享到朋友圈
				
				var slides
				$('#poster').on('tap',function(){
					
					wx.previewImage(slides)
				})
				//点击开始录音
				var isRecording = false
				$('h1').on('tap',function(){
					if(!isRecording){
						$('h1').html('点我停止录音')
						isRecording = true
						wx.startRecord({
							cancel : function(){
								alert('这样你就不懂搜了哦')
							}
						})
						return
					}
					
					isRecording = false
					wx.stopRecord({
					    success: function (res) {
					        var localId = res.localId
							  //得到localId后识别音频
							wx.translateVoice({
							   localId: localId, 
							    isShowProgressTips: 1, 
							    success: function (res) {
							    	alert(res.translateResult)
							    	$('h1').html('点我可以识别声音哦')
							    	var result = res.translateResult
									
							        //利用ajax搜索豆瓣电影
							        $.ajax({
										type : 'get',
										url : 'https://api.douban.com/v2/movie/search?q=' + result,
										dataType : 'jsonp',
										jsonp : 'callback',
										success : function(data){
			
											
											var subject =data.subjects[0]	
														
											$('#rating').html('评分：'+ subject.rating.average)					
											$('#title').html('电影名称：' + subject.title)
											$('#year').html('上映年份：' + subject.year + '年')
											$('#director').html('导演：' + subject.directors[0].name)
											$('#genres').html('电影类型：' + subject.genres)
											$('#poster').html('<img src=" '+ subject.images.large +' " />')
											

											slides = {
												current: subject.images.large, 
												urls: []
											}
											data.subjects.forEach(function(item){
												slides.urls.push(item.images.large)
											})
											
										}
							        })

							    },
							    fail : function(res){
							    	$('h1').html('点我可以识别声音哦')
									alert(JSON.stringify(res))
							    }
							})

					    }					
					})									
				})
			})
			
			
			
		</script>
	</body>
	</html>
*/})

/*生成随机字符串*/
var createNonce = function(){
	return Math.random().toString(36).substr(2,15)
}
/*生成时间戳*/
var createTimestamp = function(){
	return parseInt(new Date().getTime() / 1000,10) + ''
}

/*crypto模块加密算法*/
var _sign = function(noncestr,ticket,timestamp,url){
	var params = [
		'noncestr=' + noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' + timestamp,
		'url=' + url
	]
	var str = params.sort().join('&')
	var shasum = crypto.createHash('sha1')

	shasum.update(str)

	return shasum.digest('hex')
}
/*生成signature方法*/
function sign(ticket,url){
	var noncestr = createNonce()
	var timestamp = createTimestamp()
	var signature = _sign(noncestr,ticket,timestamp,url)

	return {
		noncestr : noncestr,
		timestamp : timestamp,
		signature : signature
	}
}

var wx = require('../../wx/index')

exports.movie = function *(next){
	var wechatApi = wx.getWechat()
	//var wechatApi = new Wechat(config.wechat)
	var data = yield wechatApi.fetchAccessToken()
	var access_token = data.access_token
	var ticketData = yield wechatApi.fetchTicket(access_token)
	var ticket = ticketData.ticket
	var url = this.href.replace(':8000', '')
	var params = sign(ticket,url)

	this.body = ejs.render(tpl,params)
}
