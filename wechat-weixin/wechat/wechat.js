'use strict'

var Promise = require('bluebird')
var _ = require('lodash')
var request = Promise.promisify(require('request'))
var fs = require('fs')
var util = require('./util')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var douban = 'https://api.douban.com/v2/movie/'
var movie_box =  'http://v.juhe.cn/boxoffice/rank.php?key=1ad01fae9a0af8e1d86e6c2f910a97d9&area=CN'
var api = {
	accessToken : prefix + 'token?grant_type=client_credential',
	temporary :{
		upload : prefix + 'media/upload?',
		fetch : prefix + 'media/get?'
	},
	permanant : {
		upload : prefix + 'material/add_material?',
		fetch : prefix + 'material/get_material?',
		uploadNews : prefix + 'material/add_news?',
		uploadNewsPic : prefix + 'media/uploadimg?',
		del : prefix + 'material/del_material?',
		update : prefix + 'material/update_news?',
		count : prefix + 'material/get_materialcount?',
		batch : prefix + 'material/batchget_material?'
	},
	group : {
		create : prefix + 'groups/create?',
		fetch : prefix + 'groups/get?',
		check : prefix + 'groups/getid?',
		update : prefix + 'groups/update?',
		move : prefix + 'groups/members/update?',
		batchupdate : prefix + '/group/members/batchupdate?',
		del : prefix + 'group/delete?',
	},
	user : {
		remark : prefix + 'user/info/updatemark?',
		fetch : prefix + 'user/info?',
		batchFetch : prefix + 'user/info/batchget?',
		list : prefix + 'user/get?',
		del : prefix + 'message/mass/delete?'

	},
	mass : {
		group : prefix + 'message/mass/sendall?',
		openId : prefix + 'message/mass/send?',
		preview : prefix + 'message/mass/preview?'
	},
	menu : {
		create : prefix + 'menu/create?',
		get : prefix + 'menu/get?',
		del : prefix + 'menu/delete?',
		current : prefix + 'get_current_selfmenu_info?'

 	},
 	ticket : {
 		get : prefix + 'ticket/getticket?'
 	}
	
}
function Wechat(opts){
	var that =this
	this.appID = opts.appID      //将这些值赋给自身属性
	this.appSecret = opts.appSecret
	this.getAccessToken = opts.getAccessToken
	this.saveAccessToken = opts.saveAccessToken
	this.getTicket = opts.getTicket
	this.saveTicket = opts.saveTicket

	this.fetchAccessToken()
}

/*获取ACCESS_TOKEN方法*/
Wechat.prototype.fetchAccessToken = function(data){
	var that = this

	if(this.access_token && this.expires_in){
		if(this.isValidAccessToken(this)){
			return Promise.resolve(this)
		}
	}
	return this.getAccessToken()//调用获取票据函数
	  	.then(function(data){
	  		try{
	  			data = JSON.parse(data)
	  		}
	  		catch(e){
	  			return that.updateAccessToken()//更新票据函数
	  		}

	  		if(that.isValidAccessToken(data)){//判断票据是否有效
	  			return Promise.resolve(data)
	  		}else{
	  			return that.updateAccessToken()//否则更新票据
	  		}
	  	})
	  	.then(function(data){
   	  		

	  		that.saveAccessToken(data)       //保存票据
	  		return Promise.resolve(data)
	  	})
}

/*fetchTicket*/
Wechat.prototype.fetchTicket = function(access_token){
	var that = this

	return this.getTicket()//调用获取票据函数
	  	.then(function(data){
	  		try{
	  			data = JSON.parse(data)
	  		}
	  		catch(e){
	  			return that.updateTicket(access_token)//更新票据函数
	  		}

	  		if(that.isValidTicket(data)){//判断票据是否有效
	  			return Promise.resolve(data)
	  		}else{
	  			return that.updateTicket(access_token)//否则更新票据
	  		}
	  	})
	  	.then(function(data){
   	  		

	  		that.saveTicket(data)       //保存票据
	  		return Promise.resolve(data)
	  	})
}

/*验证Ticket合法性*/
Wechat.prototype.isValidTicket = function(data){
	if(!data || !data.ticket || !data.expires_in){
		return false
	}
	var ticket = data.ticket
	var expires_in = data.expires_in
	var now = (new Date().getTime())

	if(ticket &&　now < expires_in){  //如果now小于过期时间
		return true
	}else{
		return false
	}
	
}

/*Wechat函数验证票据合法*/
Wechat.prototype.isValidAccessToken = function(data){
	if(!data || !data.access_token || !data.expires_in){
		return false
	}
	var access_token = data.access_token
	var expires_in = data.expires_in
	var now = (new Date().getTime())

	if(now < expires_in){       //如果now小于过期时间
		return true
	}else{
		return false
	}
	
}

/*更新ticket方法*/
Wechat.prototype.updateTicket = function(access_token){
	
	var url = api.ticket.get + '&access_token=' + access_token + '&type=jsapi' 

	return new Promise(function(resolve,reject){
		/*request方法库，向某url发送请求*/
		request({url:url,json:true}).then(function(response){
			var data = response.body
			var now = (new Date().getTime())
			var expires_in = now + (data.expires_in - 20) * 1000

			data.expires_in = expires_in
			//console.log(data)
			resolve(data)
		})
	})
}

/*豆瓣获取电影数据*/
Wechat.prototype.getMovie = function(type){
	
	var url = douban + type

	return new Promise(function(resolve,reject){
		/*request方法库，向某url发送请求*/
		request({url:url,json:true}).then(function(response){
			var data = response.body
			console.log(data)
			var rank = []
			var title = []
			var box = []
			var _subject = []
			console.log(data)
			var content = {
				rank : '',
				title : '',
				box : ''
			}
			var subjects = data.subjects
			console.log(subjects)
			subjects.forEach(function(item){
				rank.push(item.rank)
				box.push(item.box)
				_subject.push(item.subject)
			})
			console.log('rank: ' + rank)
			console.log('box: ' + box)
			_subject.forEach(function(item){
				title.push(item.title)
			})
			console.log('title: ' + title)
			
			content = {
				rank : rank,
				title : title,
				box : box
			}			
			resolve(content)
		
		})
	})
}

/*聚合数据平台查电影票房*/
Wechat.prototype.getMovieBox = function(access_token){
	
	var url = 'http://v.juhe.cn/boxoffice/rank.php?key=1ad01fae9a0af8e1d86e6c2f910a97d9&area=CN'

	return new Promise(function(resolve,reject){
		/*request方法库，向某url发送请求*/
		request({url:url,json:true}).then(function(response){
			var data = response.body
			var rank = []
			var title = []
			var box = []
			var content = {
				rank : '',
				title : '',
				box : ''
			}
			var result = data.result
			result.forEach(function(item){
				rank.push(item.rid)
				title.push(item.name)
				box.push(item.wboxoffice)
			})
			content = {
				rank : rank,
				title : title,
				box : box
			}
			console.log(content)
			resolve(content)
		})
	})
}

/*周边电影*/
// Wechat.prototype.getMovie = function(){
	
// 	var url = 'http://op.juhe.cn/onebox/movie/pmovie?dtype=&city=湘潭&key=5da7ef714f8e9201ec01554e2a9f9af6'

// 	return new Promise(function(resolve,reject){
// 		/*request方法库，向某url发送请求*/
// 		request({url:url,json:true}).then(function(response){
// 			var data = response.body
// 			console.log(data)
// 			// var rank = []
// 			// var title = []
// 			// var box = []
// 			// var content = {
// 			// 	rank : '',
// 			// 	title : '',
// 			// 	box : ''
// 			// }
// 			// var result = data.result
// 			// result.forEach(function(item){
// 			// 	rank.push(item.rid)
// 			// 	title.push(item.name)
// 			// 	box.push(item.wboxoffice)
// 			// })
// 			// content = {
// 			// 	rank : rank,
// 			// 	title : title,
// 			// 	box : box
// 			// }
// 			// console.log(content)
// 			// resolve(content)
// 		})
// 	})
// }










/*聚合数据平台查附近影讯*/
Wechat.prototype.nearbyMovie = function(location){
	console.log(location)
	var key = '5da7ef714f8e9201ec01554e2a9f9af6'
    var url = 'http://op.juhe.cn/onebox/movie/pmovie?dtype=&city=' + location + '&key=' + key 
	console.log(url)
	var _url = encodeURI(url)
	console.log(_url)
	return new Promise(function(resolve,reject){
		/*request方法库，向某url发送请求*/
		request({url:_url,json:true}).then(function(response){
			
			var data = response.body
			//console.log(data)
			var result = data.result	
			var error_code = data.error_code	
			var _data = result.data
			//console.log(_data)
			var subjects = _data[0].data
			//console.log(subjects)
			//console.log(subjects[0].story.data.storyBrief)
			var title = []
			var description = []
			var picUrl = []
			var url = []
			var playDate = []
			var content = {
				title : '',
				description : '',
				picUrl : '',
				url : '',
				playDate :  '',
				error_code : error_code
			}
		    subjects.forEach(function(item){
		    	title.push(item.tvTitle)
		    	description.push(item.story.data.storyBrief)
		    	picUrl.push(item.iconaddress)
		    	url.push(item.story.data.storyMoreLink)
		    	playDate.push(item.playDate.data2)
		    })
		    content = {
		    	title : title,
		    	description : description,
		    	picUrl : picUrl,
		    	url : url,
		    	playDate : playDate,
		    	error_code : error_code
		    }
		    console.log(content)
		    resolve(content)
		})
	})
}
/*Wechat更新票据方法*/
Wechat.prototype.updateAccessToken = function(){
	var appID = this.appID
	var appSecret = this.appSecret
	var url = api.accessToken + '&appid=' + appID + '&secret=' +appSecret

	return new Promise(function(resolve,reject){
		/*request方法库，向某url发送请求*/
		request({url:url,json:true}).then(function(response){
			var data = response.body
			var now = (new Date().getTime())
			var expires_in = now + (data.expires_in - 20) * 1000

			data.expires_in = expires_in
			console.log(data)
			resolve(data)
		})
	})
}



/*上传临时素材方法*/
Wechat.prototype.uploadMaterial = function(type,material,permanant){
	var that = this
	var form = {}
	var uploadUrl = api.temporary.upload

	if(permanant){
		uploadUrl = api.permanant.upload

		_.extend(form,permanant)
	}

	if(type === 'pic'){
		uploadUrl = api.permanant.uploadNewsPic
	}
	if(type == 'news'){
		uploadUrl = api.permanant.uploadNews
		form = material
	}else{
		form.media = fs.createReadStream(material) //创建一个可读流
	}
	

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = uploadUrl + 'access_token=' + data.access_token 
			
			if(!permanant){	//如果不是永久素材，则在url后加type
				url += '&type=' + type
			}else{
				form.access_token = data.access_token
			}
			console.log('永久素材url:' + url)
			var options = {
				method : 'POST',
				url : url,
				json : true,
			}
			if(type === 'news'){
				options.body = form
			}else{
				options.formData = form
			}
			//console.log(options)
			
			request(options).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
				console.log('看这里mediaId:' + JSON.stringify(_data))
				if(_data){
					resolve(_data)
				}else{
					throw new Error('uploadMaterial Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })
		
	})
}

/*获取素材方法*/
Wechat.prototype.fetchMaterial = function(mediaId,type,permanant){
	var that = this
	var form = {}
	var fetchUrl = api.temporary.fetch

	if(permanant){
		fetchUrl = api.permanant.fetch
	}

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = fetchUrl + 'access_token=' + data.access_token 
			var form = {}
			var options = {method:'POST',url:url,json:true}
			
			if(permanant){
				form.media_id = mediaId
				form.access_token = data.access_token
				options.body = form
			}else{
				if(type === 'video'){
					url = url.replace('https://','http://')
				}
				url += '&media_id' + mediaId
			}

			if(type === 'news' || type === 'video'){
				request(options).then(function(response){
					var _data = response.body 
					if(_data){
						resolve(_data)
					}else{
						throw new Error('fetch material failed')
					}
				})
				.catch(function(err){
					reject(err)
				})	
			}else{
				resolve(url)
			}
		
		  })		
	})
}
/*删除永久素材方法*/
Wechat.prototype.deleteMaterial = function(mediaId,type,permanant){
	var that = this
	var form = {
		media_id : media_id
	}

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = api.permanant.del + 'access_token=' + data.access_token + '&media_id=' + mediaId
			
			if(!permanant && type === 'video'){
				url = url.replace('https://','http://')
				url += '&type=' + type
			}

			request({method:'POST',url:url,body:form,json:true}).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
				console.log('mediaId:' + _data.media_id)
				if(_data){
					resolve(_data)
				}else{
					throw new Error('DeleteMaterial Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })		
	})
}
/*更新永久素材方法*/
Wechat.prototype.updateMaterial = function(mediaId,news){
	var that = this
	var form = {
		media_id : media_id
	}

	_.extend(form,news)

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = api.permanant.update + 'access_token=' + data.access_token + '&media_id=' + mediaId
			
			if(!permanant && type === 'video'){
				url = url.replace('https://','http://')
				url += '&type=' + type
			}

			request({method:'POST',url:url,body:form,json:true}).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
				console.log('mediaId:' + _data.media_id)
				if(_data){
					resolve(_data)
				}else{
					throw new Error('DeleteMaterial Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })		
	})
}

/*批量查询素材接口*/
Wechat.prototype.countMaterial = function(){
	var that = this
	var form = {
		media_id : media_id
	}

	_.extend(form,news)

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = api.permanant.count + 'access_token=' + data.access_token
			
			if(!permanant && type === 'video'){
				url = url.replace('https://','http://')
				url += '&type=' + type
			}

			request({method:'GET',url:url,json:true}).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
			//	console.log('mediaId:' + _data.media_id)
				if(_data){
					resolve(_data)
				}else{
					throw new Error('countMaterial Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })		
	})
}

/*批量获取素材*/
Wechat.prototype.batchMaterial = function(options){
	var that = this
	options.type = options.type || 'image'
	options.offset = options.offset || 0
	options.count = options.count || 1

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = api.permanant.update + 'access_token=' + data.access_token + '&media_id=' + mediaId
			
			if(!permanant && type === 'video'){
				url = url.replace('https://','http://')
				url += '&type=' + type
			}

			request({method:'POST',url:url,body:form,json:true}).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
				//console.log('mediaId:' + _data.media_id)
				if(_data){
					resolve(_data)
				}else{
					throw new Error('batchMaterial Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })		
	})
}

/*创建分组方法*/
Wechat.prototype.createGroup = function(name){
	var that = this

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = api.group.create + 'access_token=' + data.access_token
			
			var form = {
				group : {
					name : name
				}
			}

			request({method:'POST',url:url,body:form,json:true}).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
				//console.log('mediaId:' + _data.media_id)
				if(_data){
					resolve(_data)
				}else{
					throw new Error('createGroup Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })		
	})
}
/*获取分组*/
Wechat.prototype.fetchGroups = function(){
	var that = this

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = api.group.fetch + 'access_token=' + data.access_token
			
			

			request({url:url,json:true}).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
				//console.log('mediaId:' + _data.media_id)
				if(_data){
					resolve(_data)
				}else{
					throw new Error('fetchGroup Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })		
	})
}

Wechat.prototype.checkGroup = function(openId){
	var that = this

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = api.group.check + 'access_token=' + data.access_token
			
			var form ={
				openid:openId
			}

			request({method:'POST',body: form,url:url,json:true}).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
				//console.log('mediaId:' + _data.media_id)
				if(_data){
					resolve(_data)
				}else{
					throw new Error('checkGroup Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })		
	})
}

/*更新分组*/
Wechat.prototype.updateGroup = function(id,name){
	var that = this

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  	
		  	var url = api.group.update + 'access_token=' + data.access_token
			var form = {
				group : {
					id :id,
					name :name
				}
			}
			

			request({url:url,json:true}).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
				//console.log('mediaId:' + _data.media_id)
				if(_data){
					resolve(_data)
				}else{
					throw new Error('updateGroup Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })		
	})
}


/*批量移动*/
Wechat.prototype.moveGroup = function(openIds,to){
	var that = this


	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){  
			  var url
			  var form = {
			  	method : 'POST',
			  	to_groupid : to
			  }
			if( _.isArray(openIds) ){
				url = api.group.batchupdate + 'access_token=' + data.access_token			
				form.openid_list = openIds
				
			}else{
				url = api.group.move + 'access_token=' + data.access_token				
				form.openid = openIds
				
			}
		  	console.log('FORM:' + JSON.stringify(form))
			request({url:url,json:true}).then(function(response){
				var _data = response.body       //response是向url request后返回的数据，这里就包括media_id
			//	console.log('mediaId:' + _data.media_id)
				if(_data){
					resolve(_data)
				}else{
					throw new Error('moveGroup Error')
				}				
			})
			.catch(function(err){
				reject(err)
			})
		  })		
	})
}

/*用户列表*/
Wechat.prototype.listUsers = function(openId){
	var that = this

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.user.list + 'access_token=' + data.access_token 
		  	if(openId){
		  		url += '&next_openid=' + openId
		  	}
		  	
		  	request({method: 'GET',url:url,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('List user failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*用户备注*/
Wechat.prototype.remarkUsers = function(openId,remark){
	var that = this

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.user.remark + 'access_token=' + data.access_token 
		  	var form = {
		  		openid : openId,
		  		remark : remark
		  	}
		  	if(openId){
		  		url += '&next_openid=' + openId
		  	}
		  	
		  	request({method: 'GET',url:url,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('remark user failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}
/*获取Users*/
Wechat.prototype.fetchUsers = function(openIds,lang){
	var that = this
	lang = lang || 'zh_CN'
	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  
		  	var options = {
		  		json: true,

		  	}
		  	if(_.isArray(openIds)){
		  		options.url = api.user.batchFetch + 'access_token=' + data.access_token 
		  		options.body = {
			  		user_list : openIds,
			  	}
			  	options.method = 'POST'
		  	}else{
		  		options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' +openIds+ '&lang='+ lang
		  	}
		  	
		  	
		  	
		  	request(options).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('batchFetch user failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*群发消息*/

Wechat.prototype.sendByGroup = function(type,message,groupId){
	var that = this
	var msg = {
		filter : {},
		msgtype : type
	}

	msg[type] = message
	
	if(!groupId){
		msg.filter.is_to_all = true
	}else{
		msg.filter = {
			is_to_all : false,
			group_id : groupId
		}
	}
	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.mass.group + 'access_token=' + data.access_token 

		  	request({method: 'POST',url:url,body:msg,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('sendToGroup user failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*群发消息二*/
Wechat.prototype.sendByOpenId = function(type,message,openIds){
	var that = this
	var msg = {
		touser : openIds,
		msgtype : type
	}
	
	msg[type] = message
	
	
	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.mass.openId + 'access_token=' + data.access_token 

		  	request({method: 'POST',url:url,body:msg,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('sendByOpenId user failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*删除消息*/
Wechat.prototype.deleteMass = function(msgId){
	var that = this

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.mass.del + 'access_token=' + data.access_token 
		  	var form = {
		  		msg_id : msgId
		  	}
		  	request({method: 'POST',url:url,body:form,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('delete  failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*预览图文*/
Wechat.prototype.previewMass = function(type,message,openId){
	var that = this
	var msg = {
		touser : openId,
		msgtype : type
	}
	
	msg[type] = message  //把message参数交给msg的属性type，文档要求

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.mass.preview + 'access_token=' + data.access_token 
		  	
		  	request({method: 'POST',url:url,body:msg,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('preview  failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*创建菜单*/
Wechat.prototype.createMenu = function(menu){
	var that = this	
	
	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.menu.create + 'access_token=' + data.access_token 
		  	
		  	request({method: 'POST',url:url,body:menu,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('createMenu failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*获取菜单方法*/
Wechat.prototype.getMenu = function(){
	var that = this	

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.menu.get + 'access_token=' + data.access_token 
		  	
		  	request({url:url,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('getMenu failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*删除菜单方法*/
Wechat.prototype.deleteMenu = function(){
	var that = this	
	
	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.menu.del + 'access_token=' + data.access_token 
		  	
		  	request({url:url,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('deleteMenu failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*获取*/
Wechat.prototype.getCurrentMenu = function(){
	var that = this	
	

	return new Promise(function(resolve,reject){
		that
		  .fetchAccessToken()
		  .then(function(data){
		  	var url = api.menu.current + 'access_token=' + data.access_token 
		  	
		  	request({url:url,json:true}).then(function(response){
		  		var _data = response.body

		  		if(_data){
		  			resolve(_data)
		  		}else{
		  			throw new Error('getCurrentMenu failed')
		  		}
		  	})
		  	.catch(function(err){
		  		reject(err)
		  	})
		  })
	})

}

/*获取body,通过引用util.tpl生成xml格式，返回给微信服务器*/
Wechat.prototype.reply = function(){ //引用时，上下文已经被改变了（通过call(this)）
	var content = this.body			//得到设定后的回复主体
	var message = this.weixin
    console.log('wechat.js中的this.body: ' + JSON.stringify(content))
	var xml = util.tpl(content, message) //生成XML格式
	this.status = 200
	this.type = 'application/xml'
	this.body = xml
}

module.exports = Wechat