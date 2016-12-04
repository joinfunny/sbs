// 
define([
		'main/user-analysis/Revisit/model',
		'main/user-analysis/analysis'
	],
	function(model, analysis) {
		
		var myAnalysis = analysis.initModel(model, '#Revisit_analysis');
		
		return myAnalysis;

	});