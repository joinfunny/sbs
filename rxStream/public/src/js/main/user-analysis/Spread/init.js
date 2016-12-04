// 
define([
		'main/user-analysis/Spread/model',
		'main/user-analysis/analysis'
	],
	function(model, analysis) {
		
		var myAnalysis = analysis.initModel(model, '#Spread_analysis');
		
		return myAnalysis;

	});