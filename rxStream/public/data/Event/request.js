//(__path(?:.(?!\.js|.html))+)(['"])(?=\s*,|\s*])
//$1.js$2
//(__path.+)\.js(['"])(?=\s*,|\s*])
//$1$2

// 使用
require(
	[
		__path + '/bower_components/lodash/lodash',
		__path + '/js/jquery-amd',
		__path + '/main/user-analysis/Funnel/init',
		__path + '/main/data-overview/js/echarts-ops',
		__path + '/main/data-overview/js/echarts-grid-new',
		__path + '/main/data-overview/js/echarts-switch',
		__echarts,
		__path + '/main/user-analysis/js/transformData',
		__path + '/main/js/analysis-panel'
	],
	function(_, $, myAnalysis, os, grid, switchChart, ec, transformData, AnalysisPanel) {

		// 通过请求数据，跨域获取分析结果，
		// 渲染图形和表格
		// @requestData 请求数据
		// @requestZhData 请求数据中文转述
		// @isCompare
		function requestRender(requestData, requestZhData, isCompare) {
			console.log(requestData);
		}

		// 侦听分析模型的分析请求数据事件：原始分析请求数据已加载、分析请求数据变更
		myAnalysis.on('originalData dataChange', function(e, data) {
			var requestData = data.requestData,
				requestZhData = data.requestZhData
			isCompare = data.isCompare;

			requestRender(requestData, requestZhData, isCompare);
		});

	});
// post 请求
(function(data) {

	var dataStr = 'bas_event=' + encodeURIComponent(JSON.stringify(data));
	return $.ajax({
		url: 'https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.events.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json',
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
		url: 'https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.events.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json' + '&' + dataStr,
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
	window.fetch('https://testapi.open.ruixuesoft.com:30005/ropapi?method=ruixue.bas.events.get&access_token=F894DA74-41C6-417A-838D-921F613F6C64&format=json' + '&' + dataStr)
		.then(function(res) {
			console.log(res);
		});

})();

//事件分析
//hour
{
	"data": {
		"actions": [{
			"actionName": "*",
			"operation": "general"
		}, {
			"actionName": "PayOrder",
			"operation": "sum",
			"field": "event.order_money"
		}, {
			"actionName": "FinishOrder",
			"operation": "sum",
			"field": "event.order_money"
		}],
		"unit": "hour",
		"filterCondition": {
			"relation": "or",
			"conditions": [{
				"field": "event.city",
				"expression": "equal",
				"values": ["大连市"]
			}, {
				"field": "event.provice",
				"expression": "notequal",
				"values": ["辽宁省"]
			}, {
				"field": "event.lgst_name",
				"expression": "equal",
				"values": ["中通速递"]
			}]
		},
		"groupField": ["event.provice"],
		"bucketConditions": [],
		"startDate": "2015-11-10",
		"endDate": "2015-11-12"
	}
}
//day
{
	"data": {
		"actions": [{
			"actionName": "*",
			"operation": "general"
		}, {
			"actionName": "PayOrder",
			"operation": "sum",
			"field": "event.order_money"
		}, {
			"actionName": "PayOrder",
			"operation": "general"
		}, {
			"actionName": "FinishOrder",
			"operation": "usravg",
			"field": "event.order_money"
		}],
		"unit": "day",
		"filterCondition": {
			"relation": "and",
			"conditions": [{
				"field": "event.city",
				"expression": "notequal",
				"values": ["大连市"]
			}, {
				"field": "event.provice",
				"expression": "equal",
				"values": ["辽宁省"]
			}, {
				"field": "event.lgst_name",
				"expression": "notequal",
				"values": ["中通速递"]
			}, {
				"field": "user.cust_name",
				"expression": "contain",
				"values": ["爱"]
			}]
		},
		"groupField": ["event.provice", "user.cust_name"],
		"bucketConditions": [],
		"startDate": "2015-11-06",
		"endDate": "2015-11-12"
	}
}
//week
{
	"data": {
		"actions": [{
			"actionName": "*",
			"operation": "general"
		}, {
			"actionName": "PayOrder",
			"operation": "sum",
			"field": "event.order_money"
		}, {
			"actionName": "FinishOrder",
			"operation": "sum",
			"field": "event.order_money"
		}],
		"unit": "week",
		"filterCondition": {
			"relation": "or",
			"conditions": [{
				"field": "event.city",
				"expression": "equal",
				"values": ["大连市"]
			}, {
				"field": "event.provice",
				"expression": "notequal",
				"values": ["辽宁省"]
			}, {
				"field": "event.lgst_name",
				"expression": "equal",
				"values": ["中通速递"]
			}]
		},
		"groupField": ["event.provice"],
		"bucketConditions": [],
		"startDate": "2015-11-6",
		"endDate": "2015-11-12"
	}
}
//month
{
	"data": {
		"actions": [{
			"actionName": "*",
			"operation": "general"
		}, {
			"actionName": "PayOrder",
			"operation": "sum",
			"field": "event.order_money"
		}, {
			"actionName": "PayOrder",
			"operation": "general"
		}, {
			"actionName": "FinishOrder",
			"operation": "usravg",
			"field": "event.order_money"
		}],
		"unit": "month",
		"filterCondition": {
			"relation": "and",
			"conditions": [{
				"field": "event.city",
				"expression": "notequal",
				"values": ["大连市"]
			}, {
				"field": "event.provice",
				"expression": "equal",
				"values": ["辽宁省"]
			}, {
				"field": "event.lgst_name",
				"expression": "notequal",
				"values": ["中通速递"]
			}, {
				"field": "user.cust_name",
				"expression": "contain",
				"values": ["爱"]
			}]
		},
		"groupField": ["event.provice", "user.cust_name"],
		"bucketConditions": [],
		"startDate": "2015-10-06",
		"endDate": "2015-11-12"
	}
}


// 请求数据
var data = {
	"actions": [{
		// 事件名称，特别的，可以使用 $Anything 表示任意事件
		"actionName": "PayOrder",
		// 聚合操作符，可以是 general(事件触发次数)/unique(独立用户数)/average(用户平均次数)/sum(数值总和)/max(数值最大值)/min(数值最小值)/avg(数值平均值)
		"operation": "SUM",
		// 若operation为sum/max/min/avg，需要field字段，即聚合的字段名
		"field": "event.order_money"
	}],
	// 时间单位，可以是 hour/day/week/month
	"unit": "day",
	// 筛选条件
	"filterConditions": {
		"relation": "and",
		"conditions": [{
			"field": "event.city",
			"expression": "notequal",
			"values": [
				"沈阳市"
			]
		}, {
			"field": "event.provice",
			"expression": "equal",
			"values": [
				"辽宁省"
			]
		}]
	},
	// 分组属性，可以有零个或者多个
	"groupFields": [
		"event.city",
		"event.country"
	],
	// 分桶条件
	"bucketConditions": {},
	// 起始日期
	"startDate": "2015-10-07",
	// 结束日期
	"endDate": "2015-10-13"
};

var data = {
	"actions": [{
		"actionName": "*",
		"operation": "general"
	}, {
		"actionName": "PayOrder",
		"operation": "sum",
		"field": "event.order_money"
	}, {
		"actionName": "FinishOrder",
		"operation": "sum",
		"field": "event.order_money"
	}],
	"unit": "day",
	"filterConditions": {
		"relation": "or",
		"conditions": [{
			"field": "event.city",
			"expression": "equal",
			"values": ["大连市"]
		}, {
			"field": "event.provice",
			"expression": "notequal",
			"values": ["辽宁省"]
		}, {
			"field": "event.lgst_name",
			"expression": "equal",
			"values": ["中通速递"]
		}]
	},
	"groupFields": ["event.provice"],
	"bucketConditions": [],
	"startDate": "2015-11-10",
	"endDate": "2015-11-12"
};

// 返回的数据
var result = {
	"bas_events_get_response": {
		"result": {
			"groupFields": ["event.provice"],
			"lines": [{
				"group_values": ["上海"],
				"values": ["60", "5298.75", "2971.63"]
			}, {
				"group_values": ["云南省"],
				"values": ["25", "945", "1741"]
			}, {
				"group_values": ["内蒙古自治区"],
				"values": ["19", "1137.98", "1954"]
			}, {
				"group_values": ["北京"],
				"values": ["84", "4869.5", "6376"]
			}, {
				"group_values": ["吉林省"],
				"values": ["29", "1417", "1184"]
			}, {
				"group_values": ["四川省"],
				"values": ["52", "2751.66", "2673"]
			}, {
				"group_values": ["天津"],
				"values": ["18", "732.92", "1207"]
			}, {
				"group_values": ["宁夏回族自治区"],
				"values": ["3", "123", "434"]
			}, {
				"group_values": ["安徽省"],
				"values": ["41", "2947.6", "2426.44"]
			}, {
				"group_values": ["山东省"],
				"values": ["81", "4039.9", "4553"]
			}, {
				"group_values": ["山西省"],
				"values": ["27", "1437.31", "1273"]
			}, {
				"group_values": ["广东省"],
				"values": ["108", "5408.77", "7903.99"]
			}, {
				"group_values": ["广西壮族自治区"],
				"values": ["45", "1742.52", "2389.6"]
			}, {
				"group_values": ["新疆维吾尔自治区"],
				"values": ["17", "1602", "543.01"]
			}, {
				"group_values": ["江苏省"],
				"values": ["104", "5907.98", "4176.22"]
			}, {
				"group_values": ["江西省"],
				"values": ["19", "2041.73", "500"]
			}, {
				"group_values": ["河北省"],
				"values": ["58", "3388.62", "2356.11"]
			}, {
				"group_values": ["河南省"],
				"values": ["60", "3062.48", "2899"]
			}, {
				"group_values": ["浙江省"],
				"values": ["109", "6178.36", "5487"]
			}, {
				"group_values": ["海南省"],
				"values": ["7", "254", "602"]
			}, {
				"group_values": ["湖北省"],
				"values": ["50", "3858.8", "2246"]
			}, {
				"group_values": ["湖南省"],
				"values": ["49", "2797.4", "1948"]
			}, {
				"group_values": ["甘肃省"],
				"values": ["9", "252", "1217"]
			}, {
				"group_values": ["福建省"],
				"values": ["53", "3753", "2266.5"]
			}, {
				"group_values": ["贵州省"],
				"values": ["16", "843", "576"]
			}, {
				"group_values": ["辽宁省"],
				"values": ["2", "59", "118"]
			}, {
				"group_values": ["重庆"],
				"values": ["7", "324.9", "364"]
			}, {
				"group_values": ["陕西省"],
				"values": ["23", "844.8", "1704.9"]
			}, {
				"group_values": ["青海省"],
				"values": ["4", "498", "89"]
			}, {
				"group_values": ["黑龙江省"],
				"values": ["19", "642.5", "1589.5"]
			}, {
				"group_values": ["上海"],
				"values": ["77", "8227.48", "1912.22"]
			}, {
				"group_values": ["云南省"],
				"values": ["39", "2803.45", "1846"]
			}, {
				"group_values": ["内蒙古自治区"],
				"values": ["27", "2400", "1024"]
			}, {
				"group_values": ["北京"],
				"values": ["135", "13581.44", "5316.82"]
			}, {
				"group_values": ["吉林省"],
				"values": ["40", "2345.89", "1131"]
			}, {
				"group_values": ["四川省"],
				"values": ["84", "6884.91", "4018"]
			}, {
				"group_values": ["天津"],
				"values": ["32", "2907.71", "894"]
			}, {
				"group_values": ["宁夏回族自治区"],
				"values": ["3", "256", "123"]
			}, {
				"group_values": ["安徽省"],
				"values": ["55", "4784.16", "1545.88"]
			}, {
				"group_values": ["山东省"],
				"values": ["97", "7695.28", "3182.11"]
			}, {
				"group_values": ["山西省"],
				"values": ["43", "2276.75", "1781.22"]
			}, {
				"group_values": ["广东省"],
				"values": ["176", "14762.34", "7115.61"]
			}, {
				"group_values": ["广西壮族自治区"],
				"values": ["47", "3053.81", "1783.11"]
			}, {
				"group_values": ["新疆维吾尔自治区"],
				"values": ["12", "800", "828"]
			}, {
				"group_values": ["江苏省"],
				"values": ["143", "12430.29", "4672.84"]
			}, {
				"group_values": ["江西省"],
				"values": ["38", "2883.07", "1016"]
			}, {
				"group_values": ["河北省"],
				"values": ["82", "5532.5", "1706.92"]
			}, {
				"group_values": ["河南省"],
				"values": ["66", "5674.7", "1970"]
			}, {
				"group_values": ["浙江省"],
				"values": ["152", "11618.31", "4601.94"]
			}, {
				"group_values": ["海南省"],
				"values": ["7", "1061", null]
			}, {
				"group_values": ["湖北省"],
				"values": ["67", "5884.92", "3107.91"]
			}, {
				"group_values": ["湖南省"],
				"values": ["64", "4026.44", "2566.9"]
			}, {
				"group_values": ["甘肃省"],
				"values": ["21", "2379", "226"]
			}, {
				"group_values": ["福建省"],
				"values": ["79", "7031.06", "2518"]
			}, {
				"group_values": ["贵州省"],
				"values": ["19", "1342.76", "526"]
			}, {
				"group_values": ["辽宁省"],
				"values": ["5", "512.9", null]
			}, {
				"group_values": ["重庆"],
				"values": ["17", "2678", "505"]
			}, {
				"group_values": ["陕西省"],
				"values": ["33", "2639.61", "1099"]
			}, {
				"group_values": ["青海省"],
				"values": ["4", "365", null]
			}, {
				"group_values": ["黑龙江省"],
				"values": ["28", "1807.98", "1104"]
			}, {
				"group_values": ["上海"],
				"values": ["61", "5507.8", "4017.61"]
			}, {
				"group_values": ["云南省"],
				"values": ["23", "1228.23", "993"]
			}, {
				"group_values": ["内蒙古自治区"],
				"values": ["19", "1048.98", "2162"]
			}, {
				"group_values": ["北京"],
				"values": ["83", "5644.43", "6597.11"]
			}, {
				"group_values": ["吉林省"],
				"values": ["26", "1142.85", "1225"]
			}, {
				"group_values": ["四川省"],
				"values": ["48", "2155.56", "2837.11"]
			}, {
				"group_values": ["天津"],
				"values": ["16", "950.92", "970"]
			}, {
				"group_values": ["宁夏回族自治区"],
				"values": ["2", null, "356"]
			}, {
				"group_values": ["安徽省"],
				"values": ["35", "2969.6", "1988"]
			}, {
				"group_values": ["山东省"],
				"values": ["97", "7479.09", "4594.9"]
			}, {
				"group_values": ["山西省"],
				"values": ["33", "1231.21", "1615"]
			}, {
				"group_values": ["广东省"],
				"values": ["104", "5959.42", "5587.91"]
			}, {
				"group_values": ["广西壮族自治区"],
				"values": ["39", "1308.68", "2203.6"]
			}, {
				"group_values": ["新疆维吾尔自治区"],
				"values": ["18", "1488", "760.02"]
			}, {
				"group_values": ["江苏省"],
				"values": ["124", "6807.01", "6600.22"]
			}, {
				"group_values": ["江西省"],
				"values": ["31", "2935.05", "785.11"]
			}, {
				"group_values": ["河北省"],
				"values": ["55", "3530.21", "1539.11"]
			}, {
				"group_values": ["河南省"],
				"values": ["62", "2764.67", "3008"]
			}, {
				"group_values": ["浙江省"],
				"values": ["119", "7864.53", "5505"]
			}, {
				"group_values": ["海南省"],
				"values": ["7", "186", "692"]
			}, {
				"group_values": ["湖北省"],
				"values": ["62", "4066.45", "3087"]
			}, {
				"group_values": ["湖南省"],
				"values": ["47", "2388.3", "1874"]
			}, {
				"group_values": ["甘肃省"],
				"values": ["8", "217", "1085"]
			}, {
				"group_values": ["福建省"],
				"values": ["47", "3250.1", "2647.5"]
			}, {
				"group_values": ["贵州省"],
				"values": ["17", "803", "462"]
			}, {
				"group_values": ["辽宁省"],
				"values": ["3", "128", "118"]
			}, {
				"group_values": ["重庆"],
				"values": ["9", "373.4", "727"]
			}, {
				"group_values": ["陕西省"],
				"values": ["29", "1317.94", "1479.01"]
			}, {
				"group_values": ["青海省"],
				"values": ["4", "552", "89"]
			}, {
				"group_values": ["黑龙江省"],
				"values": ["16", "452.8", "1368.5"]
			}],
			"sequences": ["2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-10", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-11", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12", "2015-11-12"],
			"total_lines": 90
		}
	}
};