require([
		'jQcss3',
		'dot',
		'main/overview-list'
	], function(css3, dot,OverView) {
	var base = new OverView();
	base.init({
		type: 'Funnel',
		$tmpl: $('#overview-temp'),
		listItemDataFormatter: function(listData) {
			if (listData && listData.length > 0) {
				listData.forEach(function(curOverView) {
					var analysisType = curOverView.AnalysisType;
					var config = curOverView.Config||{};
					var currentChart = config.currentChart;
					 analysisType = analysisType + "-" + currentChart;
					var requestData = config.requestData||{},
						actionLen = requestData.funnels?requestData.funnels.length:0,
						groupLen = requestData.groupField ? 1 : 0;
					curOverView.features = OverView.numToZhFormatter(actionLen) + "指标" + OverView.numToZhFormatter(groupLen) + "维度";
					curOverView.startDate = requestData.startDate?requestData.startDate.replace(/-/g, '.'):'';
					curOverView.endDate = requestData.endDate?requestData.endDate.replace(/-/g, '.'):'';
				})

			}
			return listData;
		}
	})
});