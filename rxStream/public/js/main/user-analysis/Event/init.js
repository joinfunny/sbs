// 
define([
		'main/user-analysis/Event/model',
		'main/user-analysis/analysis'
	],
	function(model, analysis) {
		
		var myAnalysis = analysis.initModel(model, '#Event_analysis');
		
		return myAnalysis;

	});