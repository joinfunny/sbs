define([
	'dot',
	'materialize',
	'main/data-access/dataGrid',
	'main/data-access/eventBaseData',
], function(dot, materialize, Grid, BaseData) {

	function etpDropdownList() {}
	etpDropdownList.prototype = _.create(EventEmitter.prototype, {
		'constructor': etpDropdownList
	});

	_.extend(etpDropdownList.prototype, {
		$root: null,
		$tpl: null,
		trigger: null,
		$rootTpl: '<ul id="{{=it}}" class="dropdown-content"></ul>',
		$tplSelector: '#tpl_eventTypeProperties',
		triggerEvent: 'click.etpDropdownList',
		triggerActivateProp: 'data-activates',
		/**
		 * 初始化
		 * @return {[type]} [description]
		 */
		init: function(opts) {
			var that = this,
				oldTrigger;

			if (that.trigger) {
				oldTrigger = that.trigger[0];
			}

			if (opts.trigger) {
				that.trigger = opts.trigger;
			}

			that.triggerActivate = that.trigger.attr(that.triggerActivateProp);
			var $root = $('#' + that.triggerActivate);
			that.$root = $root.length > 0 ? $root : $(dot.template(that.$rootTpl)(that.triggerActivate)).appendTo(document.body)
			that.$tpl = $(that.$tplSelector);
			if (opts.data) {
				that.data = opts.data;
				that.loadData(that.data);
			}
			that.trigger.dropdown();
			that.bindHandleEvent();
			that.$root.on('click', that.handleEvent);
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
			this.select.call(this, e);
		},
		/**
		 * 选中
		 * @param  {[type]} item [description]
		 * @return {[type]}      [description]
		 */
		select: function(e) {
			var target = $(e.target);
			if (target.closest('li').hasClass('disabled'))
				return;
			var name = target.data('name');
			var selectedData = _.find(this.data, function(item) {
				return item.name == name;
			});
			this.trigger.val(selectedData.name);
			this.emit('afterSelectedMenuItem', e, selectedData);
		},
		open: function() {
			this.trigger.dropdown('open');
		},
		close: function() {
			this.trigger.dropdown('close');
		},
		/**
		 * 禁用
		 * @param  {[type]} item [description]
		 * @return {[type]}      [description]
		 */
		disable: function(item) {

		},
		/**
		 * 获取数据
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		setData: function(data) {
			this.data = data;
		},
		getData: function() {
			return this.data;
		},
		loadData: function(data) {
			this.setData(data);
			if (data && data.length > 0) {
				var tpl = dot.template(this.$tpl.text());
				this.$root.html(tpl(data));
			}
		},
		/**
		 * 客户端过滤
		 * @param  {[type]} title [description]
		 * @return {[type]}       [description]
		 */
		filter: function(title) {

		}
	});
	return etpDropdownList;
});