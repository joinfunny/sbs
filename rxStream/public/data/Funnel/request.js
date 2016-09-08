//(__path(?:.(?!\.js|.html))+)(['"])(?=\s*,|\s*])
//$1.js$2
//(__path.+)\.js(['"])(?=\s*,|\s*])
//$1$2
{
	"data": {
		"startDate": "2015-11-10",
		"endDate": "2015-11-12",
		"unit": "minute",
		"duration": "5",
		"funnels": [{
			"actionName": "Creat_Finish_Order",
			"actions": ["FinishOrder"],
			"filterCondition": {
				"relation": "and",
				"conditions": [{
					"field": "event.city",
					"expression": "equal",
					"values": ["大连市"]
				}]
			}
		}, {
			"actionName": "PayOrder",
			"actions": ["FinishOrder"],
			"filterCondition": {
				"relation": "and",
				"conditions": [{
					"field": "event.city",
					"expression": "equal",
					"values": ["大连市"]
				}, {
					"field": "event.city",
					"expression": "equal",
					"values": ["大连市"]
				}]
			}
		}],
		"filterCondition": {
			"relation": "or",
			"conditions": [{
				"field": "event.city",
				"expression": "equal",
				"values": ["大连市"]
			}, {
				"field": "user.cust_name",
				"expression": "notcontain",
				"values": ["爱"]
			}]
		},
		"groupField": ""
	}
}
// post 请求
(function(data) {

	var dataStr = 'bas_event=' + encodeURIComponent(JSON.stringify(data));
	return $.ajax({
		url: 'https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.funnels.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json',
		type: 'POST',
		dataType: 'json',
		data: dataStr,
		crossDomain: true,
		complete: function(res) {
			console.log(res);
		}
	});

})();

// get 请求
(function(data) {

	var dataStr = 'bas_event=' + encodeURIComponent(JSON.stringify(data));
	return $.ajax({
		url: 'https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.funnels.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json' + '&' + dataStr,
		type: 'GET',
		dataType: 'json',
		crossDomain: true,
		complete: function(res) {
			console.log(res);
		}
	});

})();

// fetch 请求
(function(data) {

	var dataStr = 'bas_event=' + encodeURIComponent(JSON.stringify(data));
	window.fetch('https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.funnels.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json' + '&' + dataStr)
		.then(function(res) {
			console.log(res);
		});

})();


//漏斗分析
//--funnel--
{
	"data": {
		"startDate": "2015-11-10",
		"endDate": "2015-11-12",
		"unit": "minute",
		"duration": "5",
		"funnels": [{
			"actionName": "Creat_Finish_Order",
			"actions": ["FinishOrder"],
			"filterCondition": {
				"relation": "and",
				"conditions": [{
					"field": "event.city",
					"expression": "equal",
					"values": ["大连市"]
				}]
			}
		}, {
			"actionName": "PayOrder",
			"actions": ["FinishOrder"],
			"filterCondition": {
				"relation": "and",
				"conditions": [{
					"field": "event.city",
					"expression": "equal",
					"values": ["大连市"]
				}, {
					"field": "event.city",
					"expression": "equal",
					"values": ["大连市"]
				}]
			}
		}],
		"filterCondition": {
			"relation": "or",
			"conditions": [{
				"field": "event.city",
				"expression": "equal",
				"values": ["大连市"]
			}, {
				"field": "user.cust_name",
				"expression": "notcontain",
				"values": ["爱"]
			}]
		},
		"groupField": ""
	}
}
//yyl
{
	"data": {
		"funnels": [{
			"actionName": "Creat_Order",
			"actions": ["CreateOrder"],
			"filterCondition": {
				"conditions": [{
					"field": "event.city",
					"expression": "notequal",
					"values": ["海外"]
				}],
				"relation": "and"
			}
		}, {
			"actionName": "PayOrder",
			"actions": ["PayOrder"],
			"filterCondition": {
				"conditions": [{
					"field": "event.provice",
					"expression": "notequal",
					"values": ["海外"]
				}],
				"relation": "and"
			}
		}, {
			"actionName": "CancelOrder",
			"actions": ["CancelOrder"]
		}],
		"unit": "hour",
		"duration": "1",
		"startDate": "2015-04-17",
		"endDate": "2015-07-16",
		"filterCondition": {
			"conditions": [{
				"field": "user.sex",
				"expression": "equal",
				"values": ["2"]
			}],
			"relation": "and"
		},
		"groupField": "user.sex"
	}
}

// 请求数据
var data = {
	// 漏斗集
	"funnels": [{
		//事件名称
		"actionName": "CreateOrder",
		//实际事件，虚拟事件时包含多个事件
		"actions": ["CreateOrder"],
		"filterCondition": {
			"conditions": [{
				"field": "event.city",
				"expression": "notequal",
				"values": ["海外"]
			}],
			//并和且
			"relation": "and"
		}
	}, {
		"actionName": "PayOrder",
		"actions": ["PayOrder"],
		"filterCondition": {
			"conditions": [{
				"field": "event.provice",
				"expression": "notequal",
				"values": ["海外"]
			}],
			"relation": "and" //并和且
		}
	}, {
		"actionName": "CancelOrder",
		"actions": ["CancelOrder"]
	}], //漏斗，创建订单-拍单-取消订单的漏斗集（转化率）

	// 窗口期:分钟=minute，小时=hour,天=day
	"unit": "hour",
	// N个单位
	"duration": "1",
	// 起始日期
	"startDate": "2015-04-17",
	// 结束日期
	"endDate": "2015-07-16",
	// 筛选条件，无条件就删除filterCondition标签
	"filterCondition": {
		"conditions": [{
			"field": "user.sex",
			"expression": "equal",
			"values": ["2"] //男
		}],
		"relation": "and"
	},
	// 分组属性，可以没有
	"groupField": "user.sex"
};

var data = {};

// 返回的数据
var result = {
	"bas_events_get_response": {
		"result": {}
	}
};