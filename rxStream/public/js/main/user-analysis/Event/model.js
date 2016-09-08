// 
define([
		'main/user-analysis/common',
		'main/user-analysis/UserAnalysis',
		'main/user-analysis/AnalysisMain',
		'main/user-analysis/Condition',
		'main/user-analysis/Filter',
		'main/user-analysis/analysis'
	],
	function(AppPage, UserAnalysis, AnalysisMain, Condition, Filter, analysis) {
		
		var Event = analysis.createModel('Event', [UserAnalysis, AnalysisMain, Condition, Filter]);

		// 分析模型
		_.extend(Event.UserAnalysis.prototype, {
			
		});

		// 主体
		_.extend(Event.AnalysisMain.prototype, {
			
		});

		// 条件
		_.extend(Event.Condition.prototype, {
			
		});

		// 筛选器
		_.extend(Event.Filter.prototype, {
			
		});
		
		return Event;

	});