// 
define([
		__path + '/js/zCool/zCool',
		__path + '/js/zCool/zCool.Form',
		'AppPage'
	],
	function($, $Form,AppPage) {

		var document = window.document,
			HTML = document.documentElement;

		// 类构造函数
		function DropdownList() {}

		// 原型
		DropdownList.prototype = _.create(EventEmitter.prototype, {
			'constructor': DropdownList
		});

		// 原型扩展
		$.extend(DropdownList.prototype, {

			root: null, // 下拉组件根元素
			trigger: null, // 触发下拉组件的元素
			doc: null, // 文档对象
			docRoot: null, // 文档根元素式
			rootClass: 'dropdown-panel',
			listType: 'radio', // 列表单选多选

			// 初始化
			init: function init(root, options) {
				options && $.extend(this, options);
				this.bindHandleEvent();
				this.initRoot(root);
				this.initParts();
				return this;
			},

			// 初始化根元素
			initRoot: function(root) {
				this.root = $(root)[0] || this.createRoot();
				this.doc = document;
				this.docRoot = HTML;
				$(this.root).on('click', this.handleEvent);
			},

			// 初始化各部件
			initParts: function() {
				// 依据role属性设置成员 
				$('[role]', this.root).each(function(elem){
					var role = elem.getAttribute('role');
					this[role] = elem;
				}, this);
			},
			
			// 创建根元素
			createRoot: function() {
				var $root = $('<form class="dropdown-panel"><ul class="dropdown-list" role="dropdownList"></ul></form>');
				return this.root = $root[0];
			},
				
			createListHtml: function(data) {
				
				var checkedValues = [],
					sublistClass = ' class="dropdown-sublist"',
					labelCheckedClass = ' class="label-checked"',
					checked = ' checked',
					
					html = data.map(function(d, i) {
						var children = d.children,
							sc = children ? sublistClass : '',
							selected = d.selected,
							lcc = selected ? labelCheckedClass : '',
							c = selected ? checked : '',
							subListHtml = children ? createListHtml(children) : '';
						
						return [
							'<li' + sc + '><label' + lcc + '>', 
							'<input type="radio" name="' + d.name + '" value="' + d.value + '"' + c + '>', 
							'<span>' + d.label + '</span>', 
							subListHtml, 
							'</label></li>'
						].join('');
					}).join('');

				return html;
			},

			render: function(trigger) {
				document.body.appendChild(this.root);
				this.setPosition();
				$(window).on('resize', this.handleEvent);
			},

			setPosition: function() {
				var body = document.body;
				var bodyWidth = body.clientWidth;
				var bodyHeight = body.clientHeight;
				var triggerCoord = getRectCoord(this.trigger);
				var rootCoord = getRectCoord(this.root);
				var rootHeight = rootCoord.bottom - rootCoord.top;
				var rootWidth = rootCoord.right - rootCoord.left;
				var top = 'auto',
					right = 'auto',
					bottom = 'auto',
					left = 'auto';

				if (bodyWidth > triggerCoord.left + rootWidth) {
					left = triggerCoord.left + 'px';
				} else {
					left = (triggerCoord.right - rootWidth) + 'px';
				}
				if (bodyHeight > triggerCoord.bottom + 1 + rootHeight) {
					top = (triggerCoord.bottom + 1) + 'px';
				} else {
					top = (triggerCoord.top - 1 - rootHeight) + 'px';
				}
				$(this.root).css({
					top: top,
					right: right,
					bottom: bottom,
					left: left
				});
			},

			open: function(trigger) {
				this.trigger = trigger;
				this.render();
				return this;
			},

			// 事件函数统一路由
			handleEvent: function(e) {
				switch (e.type) {
					case 'click':
						this.click(e);
						break;
					case 'mousedown':
						this.mousedown(e);
						break;
					case 'resize':
						this.resize(e);
						break;
					default:
				}
			},

			// 事件委托在窗口
			resize: function(e) {
				this.setPosition();
			},

			// 事件委托在选择器的根元素上
			click: function(e) {
				var role = e.target.getAttribute('role');
				switch (role) {
					case 'tabDateRangePage':
						this.tabDateRangePage(e)
						break;
				}
			},

			rootClick: function(e) {

				var target = e.target;

				if (target.tagName == 'INPUT') {

					switch (target.type) {

						case 'radio':
							$(this.target).focus();
							this.target.value = this.listComplete === 'value' ?
								target.value : $(target).ancestor('label').text().trim();
							$(this.target).blur();
							this.close(e);
							break;

						case 'checkbox':
							this.target.value = $('input[type=checkbox]', this.root).
							filter(function(input) {
								return input.checked;
							}).
							toArray().
							map(function(input) {
								return input.value.trim();
							}).join(',');
							break;

					}
				}
			},

			rootMousedown: function(e) {

				$(this.DOC).no(useFocus ? 'focusout' : 'mousedown', DropdownList.DOCFocusout);
			},

			confirmButtonClick: function(e) {

				//			$('input', this.root).some(function(input){
				//				if(input.checked !== undefined){
				//					this.value === input.value;
				//				}
				//			}, this.target);

				this.close(e);
			},

			// 打开下拉列表
			open: function(target) {

				this.render();

				if (target) {
					this.target = target;
				}

				var complete = this.target.getAttribute('data-list-complete');

				complete && (this.listComplete = complete);

				this.trigger = $.next(target, 'a.DropDownList-trigger');

				var trbl = $.coord(this.target),
					top = trbl.bottom + 1,
					left = trbl.left,
					width = this.target.clientWidth +
					(this.trigger ? this.trigger.offsetWidth : 0);

				$(this.root).addClass(this.listType).css({
					visibility: 'visible',
					top: top + 'px',
					left: left + 'px',
					width: width + 'px'
				});

				this.setChecked();

				$(this.DOC).on(useFocus ? 'focusout' : 'mousedown', this.bind(DropdownList.DOCFocusout));

				return this;

			},

			// 关闭下拉列表
			close: function(e) {

				if (this.emitEvent('close', {
						DOMEvent: e
					})) {
					return;
				}

				this.setChecked();

				$(this.DOC).no(useFocus ? 'focusout' : 'mousedown', DropdownList.DOCFocusout);

				$(this.root).css({
					visibility: '',
					top: '',
					left: '',
					width: ''
				});

				this.destroy();
			},

			setChecked: function() {

				var value = this.target.value.trim();
				var lrcc = $.Form.labelRadioCheckedClass;
				var lccc = $.Form.labelCheckboxCheckedClass;

				switch (this.listType) {

					case 'select-multiple':

						if (value) {
							$('input', this.root).each(function(input) {
								if (this.indexOf(input.value.trim()) > -1) {
									input.checked = true;
									$(input).ancestor('label').addClass(lccc);
								};
							}, value.split(/\s*,\s*/));
						} else {
							$('input', this.root).each(function(input) {
								if (input.checked) {
									input.checked = false;
									$(input).ancestor('label').removeClass(lccc);
								}
							});
						}
						break;

						//case 'select-one':
					default:

						switch (this.listComplete) {

							case 'value':
								$('li input', this.root).some(value ?
									function(input) {
										var $label = $(input).ancestor('label');
										if (value === input.value.trim()) {
											$label.addClass(lrcc);
											return input.checked = true;
										} else {
											$label.removeClass(lrcc);
											return input.checked = false;
										}
									} :
									function(input) {
										if (input.checked) {
											$(input).ancestor('label').removeClass(lrcc);
											input.checked = false;
											return true;
										}
									});
								break;

							case 'label':
								$('li label', this.root).some(value ?
									function(label) {
										var input = $.byTag('input', label)[0];
										if (value === $(label).text().trim()) {
											$(label).addClass(lrcc);
											return input.checked = true;
										} else {
											$(label).removeClass(lrcc);
											return input.checked = false;
										}
									} :
									function(label) {
										var input = $.byTag('input', label)[0];
										if (input.checked) {
											$(label).removeClass(lrcc);
											input.checked = false;
											return true;
										}
									});
								break;

						}

						break;
				}
			}


		});

		// DropdownList新增方法
		$.extend(DropdownList, {
			//
			create: function(root, options) {
				return new DropdownList().init(root, options);
			},
			
			// 触发器选择器数组
			_arrTrigger$: ['button[data-type^="select"]'],
			
			// 触发器选择器
			_trigger$: '', 
			
			setTrigger$: function(){
				DropdownList._trigger$ = DropdownList._arrTrigger$.join(',');
			},
			
			addTrigger$: function(trigger$){
				var arr = DropdownList._arrTrigger$, i;
				if(trigger$ && typeof trigger$ === 'string' && arr.indexOf(trigger$) < 0){
					arr.push(trigger$);
					DropdownList.setTrigger$();
				}
			},
			
			removeTrigger$: function(trigger$){
				var arr = DropdownList._arrTrigger$, i;
				if(trigger$ && typeof trigger$ === 'string' && (i = arr.indexOf(trigger$)) > -1){
					arr.splice(i, 1);
					DropdownList.setTrigger$();
				}
			},

			open: function(trigger, options) {
				return DatePicker.create(null, options).open(trigger);
			},


			// 初始化配置日期选择触发器
			init: function(trigger$) {
				if(!DatePicker._datePicker){
					DatePicker.setTrigger$();
					$(document).on('mousedown focusin', DatePicker.handleEvent);
				}
				DatePicker.addTrigger$(trigger$);
			},

			// 初始化下拉列表输入框，在其后创建一个触发器节点
			init: function(root, selector) {

				root || (root = oe.body);

				selector || (selector = 'input[data-list]');

				$.match(root, selector) && (selector = root);


				$(root.ownerDocument || root).
				click(DropdownList.DOCClick)[useFocus ? 'focusin' : 'mousedown']
					(DropdownList.DOCFocusin);

				return $(selector, root).
				each(function(input) {
					var multipleClass = input.getAttribute('data-list-type') || 'select-one';
					if (!$.next(input, 'a.DropDownList-trigger')) {
						$(input).after('<a title="请选择" class="ico ' + multipleClass + ' DropDownList-trigger" href="javascript:void(0);">请选择</a>');
					}
				}, this);

			},

			createRoot: function(rootId) {

				var urlSet = /^url\(([^)]+)\)(?:\s+(\S+))*$/.exec(rootId),
					url,
					root;

				if (urlSet) {
					url = urlSet[1];

					AppPage.loadApi({
						url: url,
						success: function(data) {
							data = $.decode(data);
							var instance = DropdownList.getInstanceByRoot(root);
							DropdownList.createDataList(data, instance);
						}
					});
				}

				return root = $([
					'<div id="' + rootId + '" class="DropDownList">', '<div class="DropDownList-body">', '<ul class="DropDownList-list ellipsis">', '</ul>', '</div>', '<div class="DropDownList-footer">', '<a class="w-button DropDownList-confirm-button" href="javascript:void(0);">', , '<i class="icons icons-accept"></i>', '<span class="w-button-text" style="display:block;">确 定</span>', '</a>', '</div>', '</div>'
				].join('')).
				appendTo(oe.body)[0];

			},

			// opts 可以是一个实例或类实例，必须包含实例对应的root/body/target/list成员
			createDataList: function(data, opts) {

				var rootId = opts.root.id,
					body = opts.body,
					type = opts.target.getAttribute('data-list-type') || 'radio';

				return $(opts.list).html(data.map(function(data) {
					var value = data.value || data;
					var label = data.label || value;
					return [
						'<li>', '<label title="' + label + '" class="">', '<input type="' + type + '" name="DropDownList_' + rootId + '" value="' + value + '" class=input-"' + type + '" />', '<span class="label-text">' + label + '</span>', '</label>', '</li>'
					].join('');

				}).join(''))[0];

			},

			//		createDataList: function( listId, dataList, listType){ 
			//			
			//			$([
			//					'<div id="' + listId + '" class="DropDownList">'
			//        			,'<div class="DropDownList-body">'
			//        			,'<ul class="choose-group ellipsis">'
			//        			,dataList.map(function( data ) {
			//		    			return [
			//							'<li>'
			//							,'<label title="' + data.label + '" class="label-choose">'
			//							,'<input type="' + listType + '" name="DropDownList_' + listId + '" value="' + data.value + '" class=input-"' + listType + '" />'
			//							,'<span class="label-text">' + data.label + '</span>'
			//							,'</label>'
			//							,'</li>'
			//						].join('');
			//
			//					}).join('')
			//        			,'</ul>'
			//        			,'<div class="tfooter" style="display:none;">'
			//        			,'<div class="thandle">'
			//					,'<a class="w-button DropDownList-confirm-button" href="javascript:void(0);">'
			//        , 			,'<i class="icons icons-add"></i>'
			//					,'<span class="w-button-text">确 定</span>'
			//					,'</a>'
			//					,'</div>'
			//					,'</div>'
			//					,'</div>'
			//				].
			//				join('')).
			//				appendTo(oe.body);
			//			
			//		},

			decodeDataList: function(value) {
				return value.split(/\s*,\s*/).
				map(function(v) {
					var a = v.split('$');
					return {
						value: a[0],
						label: a[1] || a[0]
					};
				});
			},

			//		initDataList: function( input ){
			//			
			//			var listId = input.getAttribute('data-list'),
			//				list = listId && $.byId( listId );
			//				
			//			if( list ){
			//				var value = list.value.trim;
			//				if( value ){
			//				
			//					var TYPE = { 'radio':'radio', 'checkbox':'checkbox' },
			//						listType = TYPE[ input.getAttribute('data-list-type') ] || 'radio',
			//						dataList = this.decodeDataList(value);
			//				
			//					input.setAttribute('data-list', listId = listId + '_' + Date.now());
			//				
			//					this.createDataList(listId, this.decodeDataList(value), listType);
			//				}
			//				else{
			//					var doc = list.ownerDocument, body = doc.body;
			//					if( list.parentNode !== body ){
			//						body.appendChild(list);
			//					}
			//				}
			//			}
			//		},

			// 文档点击事件
			DOCClick: function(e) {

				var target = e.target,
					input;

				if ($.match(target, 'a.DropDownList-trigger')) {
					if (input = $.prev(target, 'input[data-list]')) {
						$(input)[useFocus ? 'focus' : 'mousedown']();
					}
				}
			},

			// 文档焦点捕获事件
			DOCFocusin: function(e) {

				var target = e.target;
				//console.log(e.type)
				switch (target.nodeName) {
					case 'SELECT':
						if ($.match(target, '[data-list]')) {
							DropdownList.createOptions(target);
						}
						break;
					case 'INPUT':
						if ($.match(target, '[data-list]')) {
							DropdownList.open(target, e);
						}
						break;
				}
			},

			createOptions: function(target) {
				var selectId = target.getAttribute('data-list'),
					select = $.byId(selectId),
					urlSet, url;

				if (select) {
					target.options = select.options;
				} else if (urlSet = /^url\(([^)]+)\)(?:\s+(\S+))*$/.exec(selectId)) {
					url = urlSet[1];
					AppPage.loadApi({
						url: url,
						type:'get',
						success: function(data) {
							data = $.decode(data);
							var options = target.options,
								l = options.length;
							options.length = l + data.length;
							data.each(function(opt, i) {
								var option = this[l + i];
								option.value = opt.value;
								option.text = opt.label;
							}, target.options);
						}
					});
				}

				target.removeAttribute('data-list');
			},

			// 文档焦点捕获事件
			DOCFocusout: function(e) {
				//console.log(e.type)
				if (useFocus ||
					(!$.contains(this.target, e.target, true) &&
						!$.contains(this.root, e.target, true))) {

					this.close();
				};

			},

			// 打开一个下拉列表
			open: function(target, e) {

				var datalistBeforeCreate = target.getAttribute('data-list-before-create');

				if (datalistBeforeCreate && (datalistBeforeCreate = $.ns(window, datalistBeforeCreate))) {
					if (datalistBeforeCreate.call(target, e) === false) {
						return;
					}
				}
				var rootId = target.getAttribute('data-list'),
					datalistCreate = target.getAttribute('data-list-create'),
					root = $.byId(rootId) || this.createRoot(rootId),
					instance = new this(root).open(target);

				if (datalistCreate && (datalistCreate = $.ns(window, datalistCreate))) {
					datalistCreate.call(instance);
				}
			},

			// 关闭一个下拉列表
			close: function(target) {

				var listId = target.getAttribute('data-list'),
					list = $.byId(listId);

				if (list) {
					var instance = this.getInstanceByRoot(list);
					if (instance) {
						return instance.close();
					}
				}
			}



		});

		return DropdownList;

	});