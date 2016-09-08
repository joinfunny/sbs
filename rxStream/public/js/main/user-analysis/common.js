//
define([
		'AppPage',
		'AppPage/Widget/DatePicker',
		'AppPage/Widget/DropdownPicker'
	],
	function(AppPage, DatePicker, DropdownPicker) {

		DatePicker.init();
		DropdownPicker.init();

		// 匹配事件属性前缀
		var rBehaviorPrefix = /^(?:event\.|b_)/;

		// /main/user-analysis 目录下公用方法配置
		Object.ns(AppPage, 'UserAnalysis', {

			// 分析数据的url（从服务层获取）
			conditionsUrl: __api_path + '/services/metadata/config',
			// 获取分析模型原始数据url
			originalDataUrl: __api_path + '/services/analysis/get',
			// 维度字典url
			dimensionDataUrl: __api_path + '/services/metadata/dimension',
			// 维度字典数据的值键
			dimensionDataValueKey: 'value',
			// 维度字典数据的名称键
			dimensionDataNameKey: 'label',
			// 过滤条件值的名称name
			conditionValuesName: 'values',
			// 匹配事件属性前缀
			rBehaviorPrefix: rBehaviorPrefix,
			// 判断是否为事件属性
			isBehaviorAttr: function(attr) {
				return rBehaviorPrefix.test(attr);
			},
			// 分析请求url
			analysisUrl: __api_path + '/services/analysis/getAnalyzeObject',
			// 保存分析数据url
			analysisDataUrl: __api_path + '/services/analysis/saveAnalysis',

			// 筛选行为分析模型中事件关联的属性
			filterConditionActionsData: function(actions, schema) {
				var numericHash = {
					INTEGER: 1,
					LONG: 1,
					DOUBLE: 1
				};
				// 将“任意事件”（*）排序在最前面
				actions.sort(function(a, b) {
						return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
					})
					.forEach(function(action, i, thisArr) {
						var actionName = action.value,
							arrActionAttr = this[actionName];
						if (arrActionAttr && action.children) {
							action.children = action.children.filter(function(actionChild) {
								if (!actionChild.children) {
									//actionChild.notlist = true;
									return true;
								} else {
									if (this[actionChild.value]) {
										//actionChild.notlist = true;
										return true;
									} else {
										return false;
									}
								}
							}, arrActionAttr);
						} else {
							action.children && action.children.forEach(function(actionChild) {
								if (actionChild.children && (!numericHash[actionChild.dataType] || actionChild.value.indexOf('b_dollar') === 0)) {
									actionChild.isEmpty = true;
								}
							});
						}
					}, schema || AppPage.UserAnalysis.getConditionActionsSchema());
			},

			// 获取用户事件关联属性的定义
			getConditionActionsSchema: function() {
				// 获取存储用户名
				var userName = localStorage.getItem('bas_userName').toUpperCase(),
					conditionActionsSchema = AppPage.UserAnalysis.conditionActionsSchemas[userName] || {};
				//console.log(conditionActionsSchema);
				return conditionActionsSchema;
			},

			// 事件关联属性的定义
			conditionActionsSchemas: {
				"电商": {
					"*": {},
					"ViewHomePage": { //任意事件
						"b_ShopName": !0, //店铺名称
					},
					"SearchProduct": { //搜索商品
						"b_ProductName": 2, //产品名称
						"b_KeyWord": 2, //关键词
						"b_ShopName": 2, //店铺名称
					},
					"ViewProduct": { //浏览商品
						"b_ProductName": 2, //产品名称
						"b_ProductAllowanceType": 2,
						"b_ShopName": 2, //店铺名称,
						"b_ProductPrice": 1, //产品价格
						"b_ProductAllowanceAmount": 1, //产品补贴金额
					},
					"Signup": { //登录
						"b_LoginMethod": 2, //登录方式
					},
					"Login": { //注册
						"b_signup_type": 2, //注册类型
					},
					"SubmitOrder": { //提交订单
						"b_ProductName": 2, //产品名称
						"b_AllowanceType": 2, //补贴类型
						"b_SupplyMethod": 2, //快递方式
						"b_ShopName": 2, //店铺名称,
						"b_ProductPrice": 1, //产品价格,
						"b_ShipPrice": 1, //运费
						"b_ProductAllowanceAmount": 1, //产品补贴金额
					},
					"SubmitOrderDetail": { //提交订单的商品细节
						"b_ProductName": 2, //产品名称
						"b_AllowanceType": 2, //补贴类型
						"b_SupplyMethod": 2, //快递方式
						"b_ShopName": 2, //店铺名称,
						"b_ProductPrice": 1, //产品价格,
						"b_ProductTotalPrice": 1, //产品总价
						"b_ProductAmount": 1, //产品数量
						"b_ProductAllowanceAmount": 1, //产品补贴金额
					},
					"PayOrder": { //支付订单节
						"b_ProductName": 2, //产品名称
						"b_AllowanceType": 2, //补贴类型
						"b_PaymentMethod": 2, //支付方式
						"b_SupplyMethod": 2, //快递方式
						"b_ShopName": 2, //店铺名称,
						"b_PaymentAmount": 1, //支付金额
						"b_AllowanceAmount": 1, //补贴金额
						"b_OrderTotalPrice": 1, //订单总价
						"b_ShipPrice": 1, //运费
						"b_ProductAllowanceAmount": 1, //产品补贴金额
					},
					"PayOrderDetail": { //支付订单的商品细节
						"b_ProductName": 2, //产品名称
						"b_AllowanceType": 2, //补贴类型
						"b_PaymentMethod": 2, //支付方式
						"b_SupplyMethod": 2, //快递方式
						"b_ShopName": 2, //店铺名称,
						"b_ProductUnitPrice": 1, //产品单价
						"b_ProductTotalPrice": 1, //产品总价
						"b_ProductAmount": 1, //产品数量
						"b_PaymentAmount": 1, //支付金额
						"b_AllowanceAmount": 1, //补贴金额
						"b_ProductAllowanceAmount": 1, //产品补贴金额
					},
					"CancelOrder": { //取消订单
						"b_ProductName": 2, //产品名称
						"b_AllowanceType": 2, //补贴类型
						"b_PaymentMethod": 2, //支付方式
						"b_SupplyMethod": 2, //快递方式
						"b_ShopName": 1, //店铺名称,
						"b_OrderTotalPrice": 1, //订单总价
						"b_ShipPrice": 1, //运费
					},
					"CancelOrderDetail": { //取消订单的商品详情
						"b_ProductName": 2, //产品名称
						"b_AllowanceType": 2, //补贴类型
						"b_PaymentMethod": 2, //支付方式
						"b_SupplyMethod": 2, //快递方式
						"b_ShopName": 2, //店铺名称,
						"b_ProductUnitPrice": 1, //产品单价
						"b_ProductTotalPrice": 1, //产品总价
						"b_ProductAmount": 1, //产品数量
					},
					"ReceiveProduct": { //收到商品
						"b_ProductName": 2, //产品名称
						"b_ProductAllowanceType": 2,
						"b_SupplyMethod": 2, //快递方式
						"b_ShopName": 2, //店铺名称,
						"b_SupplyTime": 2, //配送时间
						"b_ProductUnitPrice": 1, //产品单价
						"b_ProductTotalPrice": 1, //产品总价
						"b_ProductAmount": 1, //产品数量
						"b_PaymentAmount": 1, //支付金额
						"b_AllowanceAmount": 1, //补贴金额
					},
					"ServiceAfterSale": { //售后服务
						"b_ProductName": 2, //产品名称
						"b_ServiceContent": 2, //售后内容
						"b_ProductAllowanceType": 2,
						"b_SupplyMethod": 2, //快递方式
						"b_ShopName": 2, //店铺名称,
						"b_ProductUnitPrice": 1, //产品单价
						"b_ProductTotalPrice": 1, //产品总价
						"b_ProductAmount": 1, //产品数量
						"b_PaymentAmount": 1, //支付金额
						"b_AllowanceAmount": 1, //补贴金额
					}
				},

				"BAS": {
					"*": {},
					"clickMenu": {},
					"fullPageStayTime": {
						"b_page_index": !0
					},
					"signUp": {},
					"signIn": {},
					"homePageView": {},
					"useAnalysis": {},
					"useAnalysisAttribute": {},
					"useAnalysisAttributeFilter": {},
					"useAnalysisCompare": {},
					"useAnalysisDatePicker": {},
					"useAnalysisChart": {
						"b_stay_time": !0
					},
					"useAnalysisModifyTitle": {},
					"createOverview": {
						"b_analysis_count": !0
					},

					"visitOverview": {
						"b_analysis_count": !0
					},
					"deleteOverview": {},
					"overviewListSearch": {},
					"overviewListOptionSelect": {},
					"overviewListCheckAll": {}
				}
			}
		});

		return AppPage;

	});