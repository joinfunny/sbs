//(__path(?:.(?!\.js|.html))+)(['"])(?=\s*,|\s*])
//$1.js$2
//(__path.+)\.js(['"])(?=\s*,|\s*])
//$1$2
{
	// 事件名称
	"actions": ["CancelOrder", "PayOrder"], //虚拟事件时，可能包括一个以上事件,["*"]代表任意
	// 筛选条件
	"filterCondition": {
		"conditions": [
			{
				"field": "event.paid_fee",
				"expression": "equal",
				"values": [
					"88"
				]
			}
		],
		"relation": "and" //且和或
	},
	// 时间单位，可以是 day/week/month
	"unit": "month",
	//按时间/频次 可以是time/frequency
	"type": "time",
	// 起始时间
	"startDate": "2015-04-01",
	// 结束时间
	"endDate": "2015-07-01",
	// 用户的筛选条件
	"userFilterCondition": {
		"conditions": [
			{
				"field": "user.sex",
				"expression": "equal",
				"values": [
					"2" //男
				]
			}
		],
		"relation": "and"
	},
	"groupField": "" //分组属性，为空时表示“用户行为日期”
}


// get 请求
(function(data) {

	var dataStr = 'bas_event=' + encodeURIComponent(JSON.stringify(data));
	return $.ajax({
		url: 'https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.addictions.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json' + '&' + dataStr,
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
	window.fetch('https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.addictions.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json' + '&' + dataStr)
		.then(function(res) {
			console.log(res);
		});

})();


//回访分析
//--revisit--
{
	"data": {
		"startDate": "2015-11-10",
		"endDate": "2015-11-12",
		"actions": ["FinishOrder"],
		"unit": "month",
		"type": "time",
		"filterCondition": {
			"relation": "and",
			"conditions": [{
				"field": "event.city",
				"expression": "equal",
				"values": ["大连市"]
			}]
		},
		"userFilterCondition": {
			"relation": "and",
			"conditions": [{
				"field": "user.cust_name",
				"expression": "notContain",
				"values": ["爱"]
			}]
		},
		"groupField": ""
	}
}
//yyl
{
	"data": {
		"actions": ["CancelOrder", "PayOrder"],
		"filterCondition": {
			"conditions": [{
				"field": "event.paid_fee",
				"expression": "equal",
				"values": ["88"]
			}],
			"relation": "and"
		},
		"unit": "month",
		"type": "time",
		"startDate": "2015-04-01",
		"endDate": "2015-07-01",
		"userFilterCondition": {
			"conditions": [{
				"field": "user.sex",
				"expression": "equal",
				"values": ["2"]
			}],
			"relation": "and"
		},
		"groupField": ""
	}
}
