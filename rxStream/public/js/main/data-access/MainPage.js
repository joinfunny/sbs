define([
	'AppPage',
	'main/data-access/eventBaseData'
], function(AppPage, EventBaseData) {

	function MainPage() {}

	MainPage.prototype = _.create(EventEmitter.prototype, {
		'constructor': MainPage
	});

	_.extend(MainPage.prototype, {
		root: null,
		options: null,
		init: function(opts) {
			var that = this;
			$.extend(true, that, opts);
			that.main = $('#main');
			that.bindHandleEvent();
			if (that.onInited && _.isFunction(that.onInited)) {
				that.onInited();
			}
			that.root.on('click', that.handleEvent);
			return that;
		},
		// 事件函数统一路由
		handleEvent: function(e) {
			switch (e.type) {
				case 'click':
					this.click(e);
					break;
				default:
					break;
			}
		},

		click: function(e) {
			var role = e.target.getAttribute('data-role');
			var func = this[role];
			if (func && _.isFunction(func)) {
				func.call(this, e);
			}
		}
	});

	return MainPage;
});