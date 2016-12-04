// 
define([
	    'main/user-analysis/common',
		'main/user-analysis/UserAnalysis',
		'main/user-analysis/AnalysisMain',
		'main/user-analysis/Condition',
		'main/user-analysis/Filter',
		'main/user-analysis/analysis'
	],
	function (AppPage, UserAnalysis, AnalysisMain, Condition, Filter, analysis) {
		
		var Spread = analysis.createModel('Spreed', [UserAnalysis, AnalysisMain, Condition, Filter]);

		// 分析模型
		_.extend(Spread.UserAnalysis.prototype, {
			
			// 验证传播分析事件是否合法
			validRequestActions: function(requestData){ return requestData.actions.length > 0; },
			
			// 传播分析非法请求数据信息提示
			invalidRequestActionsMsg: '请添加一个传播事件！',
			invalidRequestFilterConditionMsg: '筛选条件还有未输入或未选择的项！',
			
		});

		// 主体
		_.extend(Spread.AnalysisMain.prototype, {
			
		});

		// 条件
		_.extend(Spread.Condition.prototype, {
			
		});

		// 筛选器
		_.extend(Spread.Filter.prototype, {
			
			// 判断是否需要关联创建下拉框
			canLinkageSelect: function(deep){
				// 若不为属性筛选器，且不为事件筛选器
				return !this.onlyCondition && (!deep || this.filterType !== 'filterEvents');
			},
			
		});
		
		return Spread;

	});