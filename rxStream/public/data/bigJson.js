/* 事件、事件属性、用户属性  */
{
	"events": [],
	"eventAttrs": [],
	"userAttrs": []
}


/* 下例，事件对象定义的数组数据结构  */
"events": [{
	"label": "任意事件",
	"name": "actionName",
	"value": "*"
}, {
	"label": "创建订单",
	"name": "actionName",
	"value": "CreateOrder",

	"children": [{ // 事件的属性合集
		"label": "订单金额",
		"name": "field", // 在行为分析模型中，需要关联求值的事件属性
		"value": "b_order_money",
		"dataType": "DOUBLE",
		"operation": true // 定义是否对该事件的属性求值
	}, {
		"label": "订单类型",
		"name": "field",
		"value": "b_order_type"
	}],
	// 所有该事件关联的事件属性和用户属性合集
	"fields": ["b_order_money", "b_order_type", "u_name"]
}, {
	"label": "取消订单",
	"name": "actionName",
	"value": "CancelOrder",
	"children": [{
		"label": "支付金额",
		"name": "field",
		"value": "b_paid_fee",
		"dataType": "DOUBLE",
		"operation": true
	}, {
		"label": "快递费",
		"name": "field",
		"value": "b_lgst_fee",
		"dataType": "DOUBLE",
		"operation": true
	}],
	"fields": ["b_paid_fee", "b_lgst_fee", "b_order_money", "b_order_type", "u_name"]
}]


/* 下例，事件属性对象定义的数组数据结构  */
"eventAttrs": [{
	"label": "订单来源",
	"name": "field",
	"value": "b_order_source",
	"dataType": "STRING",
	"inputType": "input"
}, {
	"label": "支付金额",
	"name": "field",
	"value": "b_paid_fee",
	"dataType": "DOUBLE",
	"inputType": "input"
}, {
	"label": "收货人省份",
	"name": "field",
	"value": "b_provice"
	"dataType": "STRING",
	"inputType": "input-select-multip", // 若定义了输入类型为可选，则必须包含一个维度表（id）
	"dimensionId": "abcdefghijklmnopqrstuvwxyz1234567890"
}, {
	"label": "发货日期",
	"name": "field",
	"value": "b_provice"
	"dataType": "DATE",
	"inputType": "input-select-multip"
}]


/* 下例，用户属性对象定义的数组数据结构  */
"userAttrs": [{
	"label": "性别",
	"name": "field",
	"value": "u_sex",
	"dataType": "STRING",
	"inputType": "selec-one", // 若定义了输入类型为可选，则必须包含一个维度表（id）
	"dimensionId": "abcdefghijklmnopqrstuvwxyz1234567890"
}, {
	"label": "年龄",
	"name": "field",
	"value": "b_paid_fee",
	"dataType": "DOUBLE",
	"inputType": "input"
}, {
	"label": "省份",
	"name": "field",
	"value": "u_provice"
	"dataType": "STRING",
	"inputType": "input-select-multip", // 若定义了输入类型为可选，则必须包含一个维度表（id）
	"dimensionId": "abcdefghijklmnopqrstuvwxyz1234567890"
}, {
	"label": "出生日期",
	"name": "field",
	"value": "b_provice"
	"dataType": "DATE",
	"inputType": "input"
}]




/* 配置数据：事件、事件属性、用户属性 
        求值定义：
 * */
{
	"config": { // 配置
		"events": [],
		"eventAttrs": [],
		"userAttrs": []
	},
	"operation": { // 求值
		"events": {
			"event": [],
			"eventAttr": []
		},
		// 事件属性和用户属性，根据 dataType 定义求值
		"eventAttrs": {
			"BOOLEAN": [],
			"DOUBLE": [],
			"LONG": [],
			"INTEGER": [],
			"STRING": [],
			"DATE": []
		},
		"userAttrs": {
			"BOOLEAN": [],
			"DOUBLE": [],
			"LONG": [],
			"INTEGER": [],
			"STRING": [],
			"DATE": []
		}
	}
}


/* 下例，由前端补充所有事件的求值和UI交互定义 
"inputType": "select-one", */
"event": [{
	"label": "总次数",
	"name": "operation",
	"value": "general"
}, {
	"label": "独立用户数",
	"name": "operation",
	"value": "unique"
}, {
	"label": "用户平均次数",
	"name": "operation",
	"value": "average"
}]


/* 下例，由前端补充所有事件属性的求值和UI交互定义 
"inputType": "select-one", */
"eventAttr": [{
	"label": "总和",
	"name": "operation",
	"value": "sum"
}, {
	"label": "均值",
	"name": "operation",
	"value": "avg"
}, {
	"label": "最大值",
	"name": "operation",
	"value": "max"
}, {
	"label": "最小值",
	"name": "operation",
	"value": "min"
}]


/* 下例，由前端补充定义数值类型求值（DOUBLE|LONG|INTEGER） 
"inputType": "input", */
// 双精度浮点类型（在各系统和数据库定义可能会一致）
"DOUBLE": [{
	"label": "等于",
	"name": "expression",
	"value": "EQ"
}, {
	"label": "小于",
	"name": "expression",
	"value": "LT"
}, {
	"label": "大于",
	"name": "expression",
	"value": "GT"
}, {
	"label": "区间",
	"name": "expression",
	"value": "BETWEEN"
}]

// 长整型
"LONG": [{
	"label": "等于",
	"name": "expression",
	"value": "EQ"
}, {
	"label": "小于",
	"name": "expression",
	"value": "LT"
}, {
	"label": "大于",
	"name": "expression",
	"value": "GT"
}, {
	"label": "区间",
	"name": "expression",
	"value": "BETWEEN"
}]

// 整型
"INTEGER": [{
	"label": "等于",
	"name": "expression",
	"value": "EQ"
}, {
	"label": "小于",
	"name": "expression",
	"value": "LT"
}, {
	"label": "大于",
	"name": "expression",
	"value": "GT"
}, {
	"label": "区间",
	"name": "expression",
	"value": "BETWEEN"
}]

/* 下例，由前端补充定义字符类型求值  
"inputType": "select-one", */
"STRING": [{
	"label": "等于",
	"name": "expression",
	"value": "EQ"
}, {
	"label": "不等于",
	"name": "expression",
	"value": "NE"
}, {
	"label": "包含",
	"name": "expression",
	"value": "LIKE"
}, {
	"label": "不包含",
	"name": "expression",
	"value": "NLIKE"
}, {
	"label": "有值",
	"name": "expression",
	"value": "ISET",
	"dataType": "boolean"
}, {
	"label": "没有值",
	"name": "expression",
	"value": "NSET",
	"dataType": "boolean"
}]

/* 下例，由前端补充定义日期类型求值  
"inputType": "select-one", */
"DATE": [{
	"label": "有值",
	"name": "expression",
	"value": "ISET",
	"dataType": "boolean"
}, {
	"label": "没有值",
	"name": "expression",
	"value": "NSET",
	"dataType": "boolean"
}, {
	"label": "在N天之前",
	"name": "expression",
	"value": "DATERB",
	"dataType": "INTEGER",
	"inputType": "input"
}, {
	"label": "在N天之内",
	"name": "expression",
	"value": "DATERW",
	"dataType": "INTEGER",
	"inputType": "input"
}, {
	"label": "日期范围",
	"name": "expression",
	"value": "ABSBETWEEN",
	"dataType": "data-range",
	"inputType": "input"
}]


/* 下例，由前端补充定义布尔类型求值  
"inputType": "select-one", */
"BOOLEAN": [{
	"label": "为真",
	"name": "expression",
	"value": "TRUE",
	"dataType": "boolean"
}, {
	"label": "为假",
	"name": "expression",
	"value": "FALSE",
	"dataType": "boolean"
}, {
	"label": "有值",
	"name": "expression",
	"value": "ISET",
	"dataType": "boolean"
}, {
	"label": "没有值",
	"name": "expression",
	"value": "NSET",
	"dataType": "boolean"
}]
