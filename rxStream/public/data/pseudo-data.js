事件行为分析算法

http: //bas.ruixuesoft.com:8081/bas/services/bas/analysis/runtime/getAnalyzeObject?type=Event

{
	// 请求分析的数据对象
	"data": {
		// 时间段对比的开始时间（时间格式：yyyy-MM-dd），非必须项
		"compareStartDate": "2015-9-11",
 
		// 时间段对比的结束时间（时间格式：yyyy-MM-dd），非必须项
		"compareEndDate": "2015-10-11",
 
		// 开始时间（时间格式：yyyy-MM-dd），必须项
		"startDate": "2015-10-06",
 
		// 结束时间（时间格式：yyyy-MM-dd），必须项
		"endDate": "2015-11-12",
 
		// 聚合时间单位（可选值：hour|day|week|month），必须项
		"unit": "month",
 
		// 分组查看项集合，必须项
        // 若未定义分组，则为空数组（[]），表示按总体查看
		"groupFields": ["b_provice", "u_cust_name"],
 
		// 定义需要求值操作的事件集合，至少包含一个事件，必须项
		"actions": [{
 
			// 事件名称（*代表任意事件），必须项
			"actionName": "*",
 
			// 对事件——指定如何求值操作（可选值：general|unique|average，即：总次数、独立用户数、用户平均次数），必须项
			"operation": "general"
		}, {
			"actionName": "PayOrder",
 
			// 定义事件包含的指标属性（b_前缀），非必须项
			"field": "b_order_money",
 
			// 对事件包含的指标——指定如何求值操作（可选值：sum|avg|max|min|usravg，即：总和、均值、最大值、最小值、人均值），必须项
			"operation": "sum"
		}, {
			"actionName": "PayOrder",
			"operation": "general"
		}, {
			"actionName": "FinishOrder",
			"field": "b_order_money",
			"operation": "usravg"
		}],
 
		// 筛选条件定义对象，若无筛选条件则无此项，非必须项
		"filterCondition": {
 
			// 指定多个筛选条件的关联关系（可选值：and|or）
			"relation": "and",
 
			// 定义需要条件表达的筛选条件集合， 至少包含一个筛选条件，必须项
			"conditions": [{
 
				// 筛选条件字段名（b_前缀代表事件属性，u_前缀代表用户属性），必须项
				"field": "b_city",
 
				// 对筛选条件——指定如何条件表达，必须项
				// 条件表达目前定义分属于四种类型，即：数值型（DOUBLE|LONG|INTEGER）、字符型（STRING）、日期型（DATE）、布尔型（BOOLEAN）
				// 数值型可选值：EQ|LT|GT|BETWEEN，即：等于、大于、小于、区间
				// 字符型可选值：EQ|NQ|LIKE|NLIKE|ISET|NSET，即：等于、不等于、包含、不包含、有值、没有值
				// 日期型可选值：ISET|NSET|DATERB|DATERW|ABSBETWEEN，即：有值、没有值、在N天之前、在N天之内、日期范围
				// 布尔型可选值：TRUE|FALSE|ISET|NSET，即：为真、为假、有值、没有值
				"expression": "NQ",
 
				// 筛选条件的值集合，至少包含一个值，必须项
				"values": ["大连市"]
			}, {
				"field": "b_provice",
				"expression": "EQ",
				"values": ["辽宁省"]
			}, {
				"field": "b_lgst_name",
				"expression": "NQ",
				"values": ["中通速递"]
			}, {
				"field": "u_cust_name",
				"expression": "LIKE",
				"values": ["爱"]
			}]
		}
	}
}
	
漏斗分析算法

http: //bas.ruixuesoft.com:8081/bas/services/bas/analysis/runtime/getAnalyzeObject?type=Funnel

{
    // 请求分析的数据对象
    "data": {
  
        // 开始时间（时间格式：yyyy-MM-dd），必须项
        "startDate": "2015-10-06",
  
        // 结束时间（时间格式：yyyy-MM-dd），必须项
        "endDate": "2015-11-12",
  
        // 窗口期时间单位（可选值：minute|hour|day），必须项
        "unit": "day",
  
        // 窗口期时间值（可选值：页面选项定义的自然数，如：7天、5分钟、1小时等等），必须项
        "duration": 7,
  
        // 分组查看项，必须项
        // 若未定义分组，则为空字符串（""），表示按总体查看
        "groupField": "b_provice",
  
        // 事件漏斗层集合（可定义每层漏斗事件的筛选条件），至少包含一个事件，必须项
        "funnels": [{
  
            // 事件名称（*代表任意事件），必须项
            "actionName": "*",
  
            // 若为实际事件，则只包含这个实际事件，若为虚拟事件，可能会包含对应的多个实际事件，必须项
            "actions": ["*"]
        }, {
        	
            // 事件名称，必须项
            "actionName": "PayOrder",
            
            // 若为实际事件，则只包含这个实际事件，若为虚拟事件，可能会包含对应的多个实际事件，必须项
            "actions": ["PayOrder"],
  
            // 对该漏斗层事件——指定筛选条件定义对象，若无筛选条件则无此项，非必须项
            // 注：该漏斗层事件筛选条件只能包含其对应的事件属性（b_前缀）
            "filterCondition": {
  
            	// 指定多个筛选条件的关联关系（可选值：and|or）
            	"relation": "and",
            	
            	// 定义需要条件表达的筛选条件集合， 至少包含一个筛选条件，必须项
            	"conditions": [{
  
                	// 筛选条件字段名，只能是该漏斗层事件对应的事件属性（b_前缀），必须项
                	"field": "b_order_money",
  
                	// 对筛选条件——指定如何条件表达，必须项
                	"expression": "EQ",
  
                	// 筛选条件的值集合，至少包含一个值，必须项
                	"values": ["100"]
            	}
            }
        }],
  
        // 筛选条件定义对象，若无筛选条件则无此项，非必须项
        "filterCondition": {
  
            // 指定多个筛选条件的关联关系（可选值：and|or）
            "relation": "and",
  
            // 定义需要条件表达的筛选条件集合， 至少包含一个筛选条件，必须项
            "conditions": [{
  
                // 筛选条件字段名（b_前缀代表事件属性，u_前缀代表用户属性），必须项
                "field": "b_city",
  
                // 对筛选条件——指定如何条件表达，必须项
                // 条件表达目前定义分属于四种类型，即：数值型（DOUBLE|LONG|INTEGER）、字符型（STRING）、日期型（DATE）、布尔型（BOOLEAN）
                // 数值型可选值：EQ|LT|GT|BETWEEN，即：等于、大于、小于、区间
                // 字符型可选值：EQ|NQ|LIKE|NLIKE|ISET|NSET，即：等于、不等于、包含、不包含、有值、没有值
                // 日期型可选值：ISET|NSET|DATERB|DATERW|ABSBETWEEN，即：有值、没有值、在N天之前、在N天之内、日期范围
                // 布尔型可选值：TRUE|FALSE|ISET|NSET，即：为真、为假、有值、没有值
                "expression": "NQ",
  
                // 筛选条件的值集合，至少包含一个值，必须项
                "values": ["大连市"]
            }]
        }
    }
}
	
留存分析算法

http: //bas.ruixuesoft.com:8081/bas/services/bas/analysis/runtime/getAnalyzeObject?type=Retained

{
    // 请求分析的数据对象
    "data": {
  
        // 开始时间（时间格式：yyyy-MM-dd），必须项
        "startDate": "2015-10-06",
  
        // 结束时间（时间格式：yyyy-MM-dd），必须项
        "endDate": "2015-11-12",
  
        // 留存期时间单位（可选值：day|week|month），必须项
        "unit": "day",
  
        // 留存期时间值（可选值：页面选项定义的自然数，如：7天、12周、6个月等等），必须项
        "duration": 7,
  
        // 分组查看项，必须项
        // 若未定义分组，则为空字符串（""），表示按总体查看
        "groupField": "b_provice",
        
        // 若定义了分组查看项、且该分组为事件属性（b_前缀），此时必须要指定分组项是初始行为的（e1）还是后续行为的（e2） 
        // 否则为空字符串（""）
        "groupAction": "e2" 
  
        // 初始行为事件（可定义该事件的筛选条件），必须项
        "firstAction": {
  
            // 事件名称（*代表任意事件），必须项
            // 若为实际事件，则只包含这个实际事件，若为虚拟事件，可能会包含对应的多个实际事件，必须项
            "actions": ["*"]
        }, 
  
        // 后续行为事件（可定义该事件的筛选条件），必须项
        "secondAction": {
            
            // 事件名称，必须项
            // 若为实际事件，则只包含这个实际事件，若为虚拟事件，可能会包含对应的多个实际事件，必须项
            "actions": ["PayOrder"],
  
            // 对该事件——指定筛选条件定义对象，若无筛选条件则无此项，非必须项
            // 注：该事件筛选条件只能包含其对应的事件属性（b_前缀）
            "filterCondition": {
  
            	// 指定多个筛选条件的关联关系（可选值：and|or）
            	"relation": "and",
            	
            	// 定义需要条件表达的筛选条件集合， 至少包含一个筛选条件，必须项
            	"conditions": [{
  
                	// 筛选条件字段名，只能是该事件对应的事件属性（b_前缀），必须项
                	"field": "b_order_money",
  
                	// 对筛选条件——指定如何条件表达，必须项
                	"expression": "EQ",
  
                	// 筛选条件的值集合，至少包含一个值，必须项
                	"values": ["100"]
            	}
            }
        },
  
        // 用户属性筛选条件定义对象，若无筛选条件则无此项，非必须项
        "userFilterCondition": {
  
            // 指定多个筛选条件的关联关系（可选值：and|or）
            "relation": "and",
  
            // 定义需要条件表达的筛选条件集合， 至少包含一个筛选条件，必须项
            "conditions": [{
  
                // 筛选条件字段名（只能包含用户属性，u_前缀代表用户属性），必须项
                "field": "u_city",
  
                // 对筛选条件——指定如何条件表达，必须项
                // 条件表达目前定义分属于四种类型，即：数值型（DOUBLE|LONG|INTEGER）、字符型（STRING）、日期型（DATE）、布尔型（BOOLEAN）
                // 数值型可选值：EQ|LT|GT|BETWEEN，即：等于、大于、小于、区间
                // 字符型可选值：EQ|NQ|LIKE|NLIKE|ISET|NSET，即：等于、不等于、包含、不包含、有值、没有值
                // 日期型可选值：ISET|NSET|DATERB|DATERW|ABSBETWEEN，即：有值、没有值、在N天之前、在N天之内、日期范围
                // 布尔型可选值：TRUE|FALSE|ISET|NSET，即：为真、为假、有值、没有值
                "expression": "NQ",
  
                // 筛选条件的值集合，至少包含一个值，必须项
                "values": ["大连市"]
            }]
        }
    }
}
	
回访分析算法

http: //bas.ruixuesoft.com:8081/bas/services/bas/analysis/runtime/getAnalyzeObject?type=Revisit

{
    // 请求分析的数据对象
    "data": {
  
        // 开始时间（时间格式：yyyy-MM-dd），必须项
        "startDate": "2015-10-06",
  
        // 结束时间（时间格式：yyyy-MM-dd），必须项
        "endDate": "2015-11-12",
  
        // 时间单位，可选值： day|week|month，即：天、周、月，必须项
        "unit": "day",
  
        // 记次方式，可选值：time|frequency，即：按时间单位记次、按次数记，必须项
        "type": "time",
  
        // 分组查看项，必须项
        // 若未定义分组，则为空字符串（""），表示按“用户行为日期”查看
        "groupField": "b_provice",
  
        // 事件名称（*代表任意事件），必须项
        // 若为实际事件，则只包含这个实际事件，若为虚拟事件，可能会包含对应的多个实际事件，必须项
        "actions": ["*"]
  
        // 事件属性筛选条件定义对象，若无筛选条件则无此项，非必须项
        "filterCondition": {
  
            // 指定多个筛选条件的关联关系（可选值：and|or）
            "relation": "and",
  
            // 定义需要条件表达的筛选条件集合， 至少包含一个筛选条件，必须项
            "conditions": [{
  
                // 筛选条件字段名（只能包含事件属性，b_前缀代表用户属性），必须项
                "field": "b_city",
  
                // 对筛选条件——指定如何条件表达，必须项
                // 条件表达目前定义分属于四种类型，即：数值型（DOUBLE|LONG|INTEGER）、字符型（STRING）、日期型（DATE）、布尔型（BOOLEAN）
                // 数值型可选值：EQ|LT|GT|BETWEEN，即：等于、大于、小于、区间
                // 字符型可选值：EQ|NQ|LIKE|NLIKE|ISET|NSET，即：等于、不等于、包含、不包含、有值、没有值
                // 日期型可选值：ISET|NSET|DATERB|DATERW|ABSBETWEEN，即：有值、没有值、在N天之前、在N天之内、日期范围
                // 布尔型可选值：TRUE|FALSE|ISET|NSET，即：为真、为假、有值、没有值
                "expression": "NQ",
  
                // 筛选条件的值集合，至少包含一个值，必须项
                "values": ["大连市"]
            }]
        }
  
        // 用户属性筛选条件定义对象，若无筛选条件则无此项，非必须项
        "userFilterCondition": {
  
            // 指定多个筛选条件的关联关系（可选值：and|or）
            "relation": "and",
  
            // 定义需要条件表达的筛选条件集合， 至少包含一个筛选条件，必须项
            "conditions": [{
  
                // 筛选条件字段名（只能包含用户属性，u_前缀代表用户属性），必须项
                "field": "u_city",
  
                // 对筛选条件——指定如何条件表达，必须项
                // 条件表达目前定义分属于四种类型，即：数值型（DOUBLE|LONG|INTEGER）、字符型（STRING）、日期型（DATE）、布尔型（BOOLEAN）
                // 数值型可选值：EQ|LT|GT|BETWEEN，即：等于、大于、小于、区间
                // 字符型可选值：EQ|NQ|LIKE|NLIKE|ISET|NSET，即：等于、不等于、包含、不包含、有值、没有值
                // 日期型可选值：ISET|NSET|DATERB|DATERW|ABSBETWEEN，即：有值、没有值、在N天之前、在N天之内、日期范围
                // 布尔型可选值：TRUE|FALSE|ISET|NSET，即：为真、为假、有值、没有值
                "expression": "NQ",
  
                // 筛选条件的值集合，至少包含一个值，必须项
                "values": ["大连市"]
            }]
        }
    }
}