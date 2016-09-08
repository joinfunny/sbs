require([
	'jQcss3',
	'dot',
	'main/overview-list'
], function(css3, dot, OverView) {
	var icons = {
		'Event-line': 'diagram',
		'Event-pie': 'piechart',
		'Event-bar': 'histogram',
		'Event-grid': 'diagram',
		'Funnel-funnel': 'funnel',
		'Retained-retained': 'retained',
		'Revisit-piechart': 'piechart',
		'Spread-spread': 'spread'
	};
	var base = new OverView();
	base.init({
		type: '',
		$tmpl: $('#overview-temp'),
		listItemDataFormatter: function(listData) {
			if (listData && listData.length > 0) {

				listData.forEach(function(curOverView) {
					var iconsCount = 9,
						types = {},
						typeIcons = [];
					var modules = curOverView.Modules || [];
					if (modules.length > 0) {
						modules.forEach(function(module, index) {
							if (module.currentChart) {
								module.type = module.type + '-' + module.currentChart;
							}
							types[module.type] = icons[module.type];
						});
						for (var type in types) {
							if (iconsCount <= 9) {
								typeIcons.push('icon-' + types[type]);
							}
							iconsCount--;
						}

					}
					for (; iconsCount > 0; iconsCount--) {
						typeIcons.push('icon-');
					}
					curOverView.typeIcons = typeIcons;
				})
			}
			return listData;
		}
	})
});