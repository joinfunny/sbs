//(__path(?:.(?!\.js|.html))+)(['"])(?=\s*,|\s*])
//$1.js$2
//(__path.+)\.js(['"])(?=\s*,|\s*])
//$1$2
{
	"data": {
		"startDate": "2015-11-10",
		"endDate": "2015-11-12",
		"duration": "12",
		"unit": "month",
		"firstAction": {
			"actions": ["CreateOrder"],
			"filterCondition": {}
		},
		"secondAction": {
			"actions": ["FinishOrder"],
			"filterCondition": {}
		},
		"userFilterCondition": {
			"relation": "FinishOrder",
			"conditions": [{
				"field": "user.cust_name",
				"expression": "notContain",
				"values": ["爱"]
			}]
		},
		"groupField": "event.city",
		"groupAction": "e1"
	}
}

// post 请求
(function(data) {

	var dataStr = 'bas_event=' + encodeURIComponent(JSON.stringify(data));
	return $.ajax({
		url: 'https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.retentions.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json',
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
		url: 'https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.retentions.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json' + '&' + dataStr,
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
	window.fetch('https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.retentions.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json' + '&' + dataStr)
		.then(function(res) {
			console.log(res);
		});

})();


//留存分析
//--retention--
{
	"data": {
		"startDate": "2015-11-10",
		"endDate": "2015-11-12",
		"duration": "12",
		"unit": "month",
		"firstAction": {
			"actions": ["CreateOrder"],
			"filterCondition": {
				"relation": "and",
				"conditions": [{
					"field": "event.city",
					"expression": "equal",
					"values": ["大连市"]
				}]
			}
		},
		"secondAction": {
			"actions": ["FinishOrder"],
			"filterCondition": {
				"relation": "and",
				"conditions": [{
					"field": "event.city",
					"expression": "equal",
					"values": ["大连市"]
				}]
			}
		},
		"userFilterCondition": {
			"relation": "FinishOrder",
			"conditions": [{
				"field": "user.cust_name",
				"expression": "notContain",
				"values": ["爱"]
			}]
		},
		"groupField": "event.city",
		"groupAction": "e1"
	}
}
//yyl
{
	"data": {
		"startDate": "2015-03-01",
		"endDate": "2015-03-13",
		"duration": 7,
		"unit": "day",
		"firstAction": {
			"actions": ["CancelOrder", "PayOrder"]
		},
		"secondAction": {
			"actions": ["FinishOrder"],
			"filterCondition": {
				"conditions": [{
					"field": "event.paid_fee",
					"expression": "equal",
					"values": ["88"]
				}],
				"relation": "and"
			}
		},
		"userFilterCondition": {
			"conditions": [{
				"field": "user.cust_type",
				"expression": "equal",
				"values": ["TB"]
			}],
			"relation": "and"
		},
		"groupField": "event.city",
		"groupAction": "e2"
	}
}

// 请求数据
var data = {
	// 起始日期
	"startDate": "2015-03-01",
	// 结束日期
	"endDate": "2015-03-13",
	// 表示获取往后 N 个单位的留存
	"duration": 7,
	// 留存的单位，可以是 day/week/month
	"unit": "day",
	// 第一个事件的信息
	"first_action": {
		// 事件名
		"actions": ["CancelOrder", "PayOrder"] //虚拟事件时，可能包括一个以上事件,["*"]代表任意
	},
	// 第二个事件的信息
	"second_action": {
		// 事件名
		"actions": ["FinishOrder"], //虚拟事件时，可能包括一个以上事件
		// 事件的筛选条件
		"filterCondition": {
			"conditions": [{
				"field": "event.paid_fee",
				"expression": "equal",
				"values": ["88"]
			}],
			"relation": "and"
		}
	},
	// 用户的筛选条件
	"userFilterCondition": {
		"conditions": [{
			"field": "user.cust_type",
			"expression": "equal",
			"values": ["TB"] //购买平台淘宝
		}],
		"relation": "and"
	},
	// 分组属性，为空时表示“用户行为日期”
	"groupField": "event.city",
	// 当分组属性为事件时，必须需指定分组事件，事件1=e1,事件2=e2；若分组属性为用户，此处为空
	"groupAction": "e2" // groupField为空时，这个也为空
};

var data = {};

// 返回的数据
var result = {
	"bas_events_get_response": {
		"result": {}
	}
};