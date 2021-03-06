// 
define([
		'main/user-analysis/Retained/model',
		'main/user-analysis/analysis'
	],
	function(model, analysis) {
		
		var myAnalysis = analysis.initModel(model, '#Retained_analysis');
		
		// 当事件排列顺序发生改变时
		myAnalysis.on('filterEventsOrderChange', function(e){
			this.changeRequestRender();
		});
		
		return myAnalysis;

	});