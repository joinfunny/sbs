define([
		'jQcss3'
	],
	function(css3) {
		'use strict';

		var document = window.document;
		var HTML = document.documentElement;

		// 类构造函数
		function Grid() {
			var options={};
			this.getOptions=function(){
				return options;
			}
			this.setOptions=function(opts){
				options=$.extend({},options,opts);
			}
		}

		// 原型
		Grid.prototype = _.create(EventEmitter.prototype, {
			'constructor': Grid
		});

		var defaultOptions = {

		};

		function optionFormatter(target, formatter) {
			var returnValue = '';
			if (formatter) {
				if (formatter instanceof Function) {
					var args = Array.prototype.slice.call(arguments, 2);
					returnValue = formatter.apply(target, args);
				} else if (typeof formatter == 'string') {
					returnValue = formatter;
				}
			}
			return returnValue;
		}

		// 原型扩展
		_.extend(Grid.prototype, {
			root: null,
			table: null,
			thead: null,
			tbody: null,
			theadColumnClass: 'head',
			// 初始化
			init: function(root, options) {
				this.root = $(root)[0] || HTML;
				this.root.innerHTML = '';
				this.setOptions(options);
				return this;
			},
			render: function() {
				this.table = this.table || $('<table class="table table-striped grid-table"></table>').appendTo($(this.root));
				this.thead = this.thead || $('<thead></thead>').appendTo(this.table);
				this.tbody = this.tbody || $('<tbody></tbody>').appendTo(this.table);
				this.renderHeader();
				this.renderBody();
			},
			/*columns:[{'name':'title','title':'标题',checkbox:true,styler:func||'',formatter:func||'',}]*/
			renderHeader: function() {
				var me = this;
				var opts = this.getOptions(),
					columns = opts.columns && opts.columns.length > 0 ? opts.columns : [],
					headerStr = '';
				if (columns.length > 0) {
					headerStr = '<tr>';
					columns.forEach(function(column, index) {
						headerStr += '<th class="' + me.theadColumnClass + '">' + (column.title || '&nbsp;') + '</th>';
					});
					headerStr += '</tr>';
				}
				headerStr && (this.thead.html(headerStr));
			},
			renderBody: function() {
				var me = this;
				var opts = this.getOptions();
				this.data || (this.data = []);
				var data = this.data;
				var rows = [],
					rowStr = '';
				data instanceof Array && (data = this.data = {
					rows: data,
					total: data.length
				});

				if (data && data.total > 0) {
					data.rows.forEach(function(row, index) {
						rowStr = '<tr>';
						if (row instanceof Array) {
							row.forEach(function(value, i) {
								rowStr += '<td>' + value + '<td>';
							})
						} else {
							var columns = opts.columns,
								tdValue,
								tdStyle,
								tdCls;
							columns.forEach(function(column, i) {
								tdValue = row[column.name] || '';
								tdStyle = '';
								if (column.formatter && column.formatter instanceof Function) {
									tdValue = column.formatter.call(this, tdValue, row, i);
								}
								tdStyle = optionFormatter(me, column.styler, tdValue, row, i);
								tdCls = optionFormatter(me, column.cls, tdValue, row, i);
								rowStr += '<td style="' + tdStyle + '" class="' + tdCls + '">' + tdValue + '</td>';
							})
						}
						rowStr += '</tr>';
						rowStr && (rows.push(rowStr));
					});

					this.tbody.html(rows.join(''));
				}
			},
			loadData: function(data) {
				this.data = data;
				this.render();
			}
		});

		// 静态扩展
		_.extend(Grid, {
			create: function create(root, options) {
				return new Grid().init(root, options);
			}
		});

		return Grid;

	});