// 
define([
		'main/user-analysis/Retained/model',
		'main/user-analysis/analysis'
	],
	function(model, analysis) {
		
		var myAnalysis = analysis.initModel(model, '#Retained_analysis');
		
		// ���¼�����˳�����ı�ʱ
		myAnalysis.on('filterEventsOrderChange', function(e){
			this.changeRequestRender();
		});
		
		return myAnalysis;

	});