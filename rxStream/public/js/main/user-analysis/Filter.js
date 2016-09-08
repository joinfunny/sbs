// 
define([
		'dot',
		'AppPage',
		'AppPage/Widget/DropdownPicker',
		'main/user-analysis/DataConfig',
		'main/user-analysis/FilterDropdown',
		'main/user-analysis/FilterDrag'
	],
	function(dot, AppPage, DropdownPicker, DataConfig, FilterDropdown, FilterDrag) {

		var HTML = document.documentElement;

		// 类构造函数
		function Filter() {}

		// 原型
		Filter.prototype = _.create(EventEmitter.prototype, {
			'constructor': Filter
		});

		// 原型扩展
		_.extend(Filter.prototype, {

			root: null,
			wrapper: null,
			optionList: null,
			optionItem$: '.li-btn-item',
			optionItems: null,
			rootDropHintClass: 'drop-hint',
			rootDropReadyClass: 'drop-ready',
			// 根元素
			rootRect: null,
			//
			hintOption: null,
			hintOptionClass: 'hint-option',
			hintBtn: null,
			hintBtnRect: null,
			dragOption: null,

			onlyCondition: false, // 只显示条件选项，不关联联动选填项

			relatedConditions: null,
			sourceCondition: null,
			hasRelation: false, // 筛选项是否具有关联关系

			// 初始化
			init: function init(root, options) {
				this.bind('dropdownHandleEvent', 'dropdownInitList', 'dropdownListClick', 'dropdownDatalistFetched');
				options && _.extend(this, options);
				this.bindHandleEvent();
				this.initRoot(root);
				this.initParts();
				this.createDrag();
				return this;
			},

			// 初始化根元素
			initRoot: function(root) {
				this.root = $(root)[0];
				this.wrapper = this.root.parentNode; // panel-bottom
				this.doc = document;
				this.docRoot = this.doc.documentElement;
				// 事件委托根元素
				$(this.root).on('mouseenter mouseleave mousedown click focusin', this.handleEvent);
			},

			// 模板选择器
			tmpl$: 'script[type="text/x-dot-template"]',

			// 模板元素
			optionItemTmpl: null,
			subitemTmpl: null,
			selectTmpl: null,

			// 模板函数在下面的步骤中生成
			optionItemTmplFn: null,
			selectTmplFn: null,
			subitemTmplFn: null,

			// 初始化各部件
			initParts: function() {
				// 依据role属性设置成员
				$('[role]', this.root).toArray().forEach(function(elem) {
					var role = elem.getAttribute('role');
					this[role] = elem;
				}, this);
			},

			// 绘制当前分析初始的条件按钮选项
			renderOptions: function() {},

			// 绘制
			render: function() {
				this.renderOptions();
				return this;
			},

			// 获取生成条件选项的模板函数
			getOptionItemTmplFn: function() {
				return this.getTmplFn('optionItemTmpl');
			},

			// 获取生成下拉选框的模板函数
			getSelectTmplFn: function() {
				return this.getTmplFn('selectTmpl');
			},

			// 获取生成子下拉选项的模板函数
			getSubitemTmplFn: function() {
				return this.getTmplFn('subitemTmpl');
			},

			// 获取生成子下拉选项的模板函数
			getLinkageBoxTmplFn: function() {
				return this.getTmplFn('linkageBoxTmpl');
			},

			// 获取下拉选项已选值的模板函数
			getValuesHtmlTmplFn: function() {
				return this.getTmplFn('valuesHtmlTmpl');
			},

			// 通过role名获取相应的模板函数
			// @role
			getTmplFn: function(role) {
				var tmplFn = this[role + 'Fn'];
				if (tmplFn) {
					return tmplFn;
				}
				var tmplNode = this[role],
					tmplStr = tmplNode.text || tmplNode.innerHTML,
					settings = _.extend({}, dot.templateSettings, {
						strip: false
					});

				tmplNode.parentNode.removeChild(tmplNode);
				tmplFn = this[role + 'Fn'] = dot.template(tmplStr, settings);
				return tmplFn;
			},

			// 判断是否可以添加条件选项
			canAddOption: function(value) {
				// 当只显示条件选项，不关联联动选填项
				if (this.onlyCondition) {
					return !this.containsCondition(value);
				}
				return true;
			},

			// 判断是否包含一个筛选条件（值）
			// @conditionValue string
			// return boolean
			containsCondition: function(conditionValue) {
				return _.some($(this.conditionBtn$, this.optionList), function(btn) {
					return btn.value === conditionValue;
				});
			},

			//			// 来源条件注册的事件
			//			conditionHandleEvent: function(e){
			//				switch(e.type){
			//					case 'beforedrag':
			//					break;
			//					case 'startdrag':
			//					break;
			//					case 'dragging':
			//					break;
			//				}
			//			},

			// 提示添加条件选项（来源条件选项准备开始拖拽）
			hintAddOption: function() {

				var dragBtnData = this.sourceCondition.dragBtnData,
					dataConfig,
					tmplFn;

				// 若不能添加条件
				if (!this.canAddOption(dragBtnData.value)) {
					return;
				}
				dataConfig = this.getDataConfigByBid(dragBtnData.bid);
				tmplFn = this.getTmplFn('optionItemTmpl');

				dragBtnData._initial = this.parent.initialMap[dataConfig.bname];
				this.hintOption = $(tmplFn(dragBtnData)).addClass(this.hintOptionClass).prependTo(this.optionList)[0];
				delete dragBtnData._initial;

				this.hintBtn = $(':first-child', this.hintOption)[0];

				this.setOptionsRelationShow();
				this.clearFiltersActived();
				// 注册动画结束事件
				$(this.root).addClass(this.rootDropHintClass).on('transitionend', this.handleEvent);
				$(this.wrapper).removeClass(this.parent.filterAllStateWrapperClasses).addClass(this.wrapperHintClass);
				this.setWrapperMaxHeight();
			},

			// 设置筛选器的父容器的最大限制高度
			setWrapperMaxHeight: function() {
				this.wrapper.style.height = this.getWrapperLimitMaxHeight() + 'px';
			},

			// 还原筛选器的父容器的高度
			resetWrapperHeight: function() {
				this.wrapper.style.height = '';
			},

			// 获取筛选器的父容器的最大限制高度
			getWrapperLimitMaxHeight: function() {
				return window.innerHeight - this.parent.analysisMain.headerPanel.offsetHeight - 1;
			},

			// 添加条件选项就绪（来源条件选项拖拽到位）
			readyAddOption: function(ready) {
				var method = ready ? 'addClass' : 'removeClass';
				$(this.root)[method](this.rootDropReadyClass);
			},

			// 取消添加条件选项（来源条件选项取消拖拽）
			cancelAddOption: function() {
				$(this.root).removeClass(this.rootDropHintClass).off('transitionend', this.handleEvent);
				$(this.hintOption).remove();
				this.resetOption();
			},

			// 重置包装元素
			resetWrapper: function() {
				$(this.wrapper).removeClass(this.parent.filterAllStateWrapperClasses);
				this.resetWrapperHeight();
			},

			// 确定添加条件选项
			ensureAddOption: function( /*optionsData, label, value*/ ) {
				var optionItem = this.hintOption;
				this.setActived();
				this.setWrapperActived();
				$(this.wrapper).on('transitionend', this.handleEvent);
				this.resetWrapperHeight();
				this.linkageSelect();
				this.resetOption();

				this.setActionAttrsCondition();
				this.changeRequestRender();
			},

			// 
			removeOptionBtn$: '[role=removeOptionBtn]',
			// 关联创建下拉选框
			linkageSelect: function() {
				var bid;
				// 若需要关联创建下拉框器
				if (this.canLinkageSelect()) {
					bid = this.sourceCondition.dragBtnData.bid;
					this.createSelectByBid(bid);
				}
			},

			// 判断是否需要关联创建下拉框
			canLinkageSelect: function() {
				// 若不为属性筛选器
				return !this.onlyCondition;
			},

			// 下拉选框选择器
			dropdownSelect$: '.dropdown-select',
			dropdownSubitem$: '.dropdown-subitem',

			// 清除条件分支
			clearConditionBranch: function(optionItem) {
				if (this.filterType !== 'filterEvents') return;
				var lastBranchBtn = !this.canLinkageSelect(true) ? optionItem.querySelector('button') :
					optionItem.querySelector(this.dropdownSubitem$) || optionItem.querySelector(this.dropdownSelect$),

					dataConfigKit = this.getDataConfigKitByBid(lastBranchBtn.dataset.bid),
					branch = dataConfigKit.branch,
					rootBranch = dataConfigKit.rootBranch;
				//
				dataConfigKit.clearBranchSelected(true);
				switch (this.parent.analysisType) {
					case 'Event':
					case 'Worth':
						this.setSourceDragBtnDragdisable(rootBranch, dataConfigKit.condition);
						break;
				}
			},

			// 设置条件来源按钮是否可用
			setSourceDragBtnDragdisable: function(rootBranch, sourceCondition) {

				// 通过分支已全部选中，设置来源拖拽按钮是否可拖拽
				sourceCondition.setDragBtnDragdisable(rootBranch.bid, DataConfig.isBranchAllSelected(rootBranch));
			},

			linkageDataConfig: null,
			linkageBranch: null,

			// 通过数据项的bid创建下拉框
			createSelectByBid: function(bid) {
				var that = this,
					dataConfigKit = this.getDataConfigKitByBid(bid),
					dataConfig = dataConfigKit.dataConfig,
					branch = dataConfigKit.branch,
					branches = branch.children,
					selectBranch,
					subitemBranch,
					linkageBoxBranch,
					linkageBox,
					dropdownSelect,
					dropdownSubitem,
					dropdownLinkageBox,
					childrenUnselectedMinIndex = -1,
					$removeOptionBtn = $(this.removeOptionBtn$, this.hintOption);

				// 当筛选条件具备关联关系（或/与）
				// 条件筛选器
				if (this.filterType === 'filterConditions') {
					selectBranch = branches[0];
					if (selectBranch.inputType || selectBranch.childrenType) {
						linkageBoxBranch = selectBranch;
					}

					// 若包含需要选中的选项
					if (selectBranch) {
						dropdownSelect = this.createDropdownSelectHtml(selectBranch);

						// 若包含需要关联的子选项
						if (linkageBoxBranch) {
							linkageBox = this.createLinkageBoxHtml(linkageBoxBranch);
							$removeOptionBtn.before(dropdownSelect).before(linkageBox);
						} else {
							$removeOptionBtn.before(dropdownSelect);
						}
					}
				}
				// 事件筛选器
				//this.filterType === 'filterEvents'
				else {
					// 标识分支选中的筛选项（包含后代子孙选项）
					branch.selected = true;
					//console.log('前');
					if (!this.canLinkageSelect(true)) return;
					//console.log('后');

					if (branches) {
						// 查找未选中的数据分支项并创建下拉选框
						branches.some(function(b) {
							if (!b.selected) {
								selectBranch = b;
								if (b.children) {
									subitemBranch = b.children[0];
								}
								return true;
							}
						});

						// 若已没有可选中的数据分支项
						if (!selectBranch) {
							// 筛选，在包含的子分支项中查找
							branches.filter(function(b) {
								//findDropdownSubitemBranch(b)
								if (b.children) {
									b.children.some(function(c, i) {
										if (!c.selected) {
											// 记录未选中的数据子分支项的索引
											if (childrenUnselectedMinIndex < 0 || i < childrenUnselectedMinIndex) {
												childrenUnselectedMinIndex = i;
												subitemBranch = c;
												selectBranch = b;
											}
											return true;
										}
									});
									return true;
								}
							});
						}
					}

					// 若包含需要选中的选项
					if (selectBranch) {

						//dropdownSelect = createDropdownSelect(selectBranch);

						dropdownSelect = $(this.createDropdownSelectHtml(selectBranch))[0];
						selectBranch.selected = true;

						// 若包含需要选中的子选项
						if (subitemBranch) {
							dropdownSubitem = createdDropdownSubitemHtml(subitemBranch);
							subitemBranch.selected = true;
							//							console.log(selectBranch);
							//							dropdownSelect.name = selectBranch.name;
							//							dropdownSelect.value = selectBranch.value;
							$('span', dropdownSelect).text([selectBranch.label, subitemBranch.label].join('的'));
							$removeOptionBtn.before(dropdownSelect).before(dropdownSubitem);
						} else {
							$removeOptionBtn.before(dropdownSelect);
						}
						// 通过分支已全部选中，设置来源拖拽按钮是否可拖拽
						this.setSourceDragBtnDragdisable(dataConfigKit.rootBranch, dataConfigKit.condition);
					}

				}

				// 创建下拉子选项框
				function createdDropdownSubitemHtml(subitemBranch, subitemTmplFn) {
					subitemTmplFn || (subitemTmplFn = that.getTmplFn('subitemTmpl'));
					dropdownSubitem = subitemTmplFn(subitemBranch);
					return dropdownSubitem;
				}
			},

			// 创建下拉框的 HTML
			createDropdownSelectHtml: function(selectBranch, selectTmplFn) {

				selectTmplFn || (selectTmplFn = this.getTmplFn('selectTmpl'));

				// 临时加入全局命名空间（渲染模板）
				selectBranch.dropdownInitList = this.NS + '.dropdownInitList';
				selectBranch.dropdownListClick = this.NS + '.dropdownListClick';

				var sHtml = selectTmplFn(selectBranch);

				delete selectBranch.dropdownInitList;
				delete selectBranch.dropdownListClick;

				return sHtml;
			},

			// 通过bid获取数据树套件
			getDataConfigKitByBid: function(bid) {
				var dataConfigKit;
				this.relatedConditions.some(function(sc) {
					var dtk = sc.getDataConfigKitByBid(bid);
					if (dtk) {
						dataConfigKit = dtk;
						return true;
					}
				});
				return dataConfigKit;
			},

			// 通过bid获取数据树
			getDataConfigByBid: function(bid) {
				var dataConfigKit = this.getDataConfigKitByBid(bid);
				return dataConfigKit && dataConfigKit.dataConfig;
			},

			// 重置选项
			resetOption: function() {
				this.setOptionsRelationShow();
				//$(this.wrapper).removeClass(this.wrapperHintClass);
				$(this.root).removeClass(this.rootDropHintClass + ' ' + this.rootDropReadyClass);
				$(this.hintOption).removeClass(this.hintOptionClass);
				delete this.rootRect;
				delete this.optionItemRectKits;
				delete this.hintOption;
				delete this.hintBtn;
			},

			// 获取加入筛选条件的数据集
			getOptionsData: function() {},

			// 处理事件路由
			handleEvent: function(e) {
				switch (e.type) {
					case 'mouseenter':
						this.mouseenter(e);
						break;
					case 'mouseleave':
						this.mouseleave(e);
						break;
					case 'mousedown':
						this.mousedown(e);
						break;
					case 'click':
						this.click(e);
						break;
					case 'focusin':
						this.focusin(e);
						break;
					case 'change':
						this.change(e);
						break;

					default:
						type = e.type.toLowerCase();
						if (type.indexOf('transitionend') > -1) {
							e.w3ctype = 'transitionend';
							this.transitionend(e);
						}
				}
			},

			// 过滤条件值（选中项的值或只输入项的值）集合的名称 name
			conditionValuesName: 'values',
			// 过滤条件文本（选中项的文本或只输入项的文本）集合的名称 name
			conditionValuesZhName: 'values_zh',
			// 过滤条件可填可选项的输入文本集合的名称 name
			conditionLabelsName: 'names',

			// 聚焦判断是哪个筛选器及其触发事件的元素，关联动作
			focusin: function(e) {
				var target = e.target;
				if (this.actived) {} else {
					this.setActived();
					this.setWrapperMaxHeihgt();
					this.setWrapperActived();
				}
				if ((this.filterType === 'filterConditions' && target.name === this.conditionValuesName) || $(target).hasClass('dropdown-select')) {
					$(target).off('change', this.handleEvent).on('change', this.handleEvent);
				}
			},

			actived: false,

			// 鼠标进入筛选器
			mouseenter: function(e) {
				var activedFilter;
				if (this.actived) {} else {
					activedFilter = this.getActivedFilter();
					if (activedFilter) {} else {
						this.setMouseenter();
					}
				}
			},

			// 设置鼠标进入
			setMouseenter: function() {
				this.setMouseenterWrapper();
				this.setWrapperMaxHeihgt();
			},

			// 设置鼠标进入
			setMouseenterWrapper: function() {
				$(this.wrapper).addClass(this.wrapperMouseenterClass);
			},

			resetMouseenterWrapper: function() {
				$(this.wrapper).removeClass(this.wrapperMouseenterClass);
			},

			// 鼠标离开筛选器
			mouseleave: function(e) {
				var activedFilter;
				if (this.actived) {} else {
					activedFilter = this.getActivedFilter();
					if (activedFilter) {} else {
						if (!$.contains(this.wrapper, e.relatedTarget)) {
							this.resetWrapperHeight();
						}
						this.resetMouseenterWrapper();
					}
				}
			},

			// 清除所有筛选器的激活状态
			clearFiltersActived: function() {
				this.getFilters().some(function(filter) {
					//if(filter.actived){
					$(filter.doc).off('mousedown', filter.handleEvent);
					delete filter.actived;
					//return true;
					//}
				}, this);
			},

			// 判断是否有激活的筛选器
			getActivedFilter: function() {
				var filters = this.getFilters();
				return filters[0].actived ? filters[0] :
					filters[1].actived ? filters[1] :
					filters[2].actived ? filters[2] : null;
			},

			// 获取所有筛选器
			getFilters: function() {
				var filters = [
					this.parent.filterEvents,
					this.parent.filterAttrs,
					this.parent.filterConditions
				];
				return filters;
			},

			// 获取筛选器的内容高度差的最大值
			getFiltersMaxDiffHeight: function() {
				var filtersDiffHeights = this.getFilters().map(function(filter) {
					return filter.panelBody.scrollHeight - filter.panelBody.clientHeight;
				});
				return Math.max.apply(Math, filtersDiffHeights);
			},

			// 设置父容器最大高度
			setWrapperMaxHeihgt: function() {
				//				var activedFilter = this.getActivedFilter();
				//				// 若已存在激活的筛选器，不作操作
				//				if(activedFilter){
				//					return;
				//				}
				var filtersMaxDiffHeight = this.getFiltersMaxDiffHeight(),
					maxLimitHeight,
					wrapperHeight;
				// 若筛选器的内容高度差的最大值大于0
				if (filtersMaxDiffHeight > 0) {
					maxLimitHeight = this.getWrapperLimitMaxHeight();
					wrapperHeight = this.wrapper.offsetHeight + (filtersMaxDiffHeight > 0 ? filtersMaxDiffHeight + 28 : filtersMaxDiffHeight);
					this.wrapper.style.height = (wrapperHeight < maxLimitHeight ? wrapperHeight : maxLimitHeight) + 'px';
				}
			},

			// 激活当前筛选器
			setActived: function() {
				if (this.actived) {} else {
					this.getFilters().some(function(filter) {
						if (filter.actived) {
							delete filter.actived;
							return true;
						}
					}, this);
					this.actived = true;
				}
			},

			mousedown: function(e) {
				switch (e.currentTarget) {
					case this.root:
						this.rootMousedown(e);
						break;
				}
			},

			rootMousedown: function(e) {
				if (this.actived) {} else {
					this.setActived();
					this.setWrapperActived();
					this.setWrapperMaxHeihgt();
				}
			},

			setWrapperActived: function() {
				$(this.wrapper).removeClass(this.parent.filterAllStateWrapperClasses).addClass(this.wrapperActivedClass);
			},

			// change事件
			change: function(e) {
				this.changeRequestRender();
			},

			// 
			transitionend: function(e) {
				$(e.currentTarget).off('transitionend', this.handleEvent);

				switch (e.currentTarget) {
					case this.root:
						this.getPartRects();
						break;
					case this.wrapper:
						this.setWrapperMaxHeihgt();
						break;
				}
			},

			// 条件选项坐标集
			optionItemRectKits: null,

			// 获取元素的区域坐标范围
			getPartRects: function() {
				this.rootRect = this.root.getBoundingClientRect();
				//this.hintBtnRect = this.hintBtn.getBoundingClientRect();
				this.getOptionItemRectKits(this.hintOption);
			},

			// 获取选项的区域坐标范围集合
			getOptionItemRectKits: function(excludeOption) {
				var before = true;
				this.optionItemRectKits = [];
				_.forEach(this.optionList.querySelectorAll(this.optionItem$), function(optionItem) {
					if (optionItem !== excludeOption) {
						this.optionItemRectKits.push({
							// 区分是否为拖拽之前的元素
							before: before,
							element: optionItem,
							rect: optionItem.getBoundingClientRect()
						});
					} else {
						before = false;
					}
				}, this);
				return this.optionItemRectKits;
			},

			// 比较筛选条件坐标并插入元素
			compareInsertHintOption: function(e) {
				this.compareInsertOption(e, this.hintOption);
			},

			// 比较筛选条件坐标并插入元素
			compareInsertOption: function(e, element) {
				var enterRectKit = this.compare2EnterRectKit(e);
				if (enterRectKit) {
					$(enterRectKit.element)[enterRectKit.after ? 'after' : 'before'](element);
					delete enterRectKit.after;
					return true;
				}
				return false;
			},

			// 比较坐标，返回最低的元素坐标
			compare2EnterRectKit: function(e) {

				var rectKits = this.optionItemRectKits;

				return rectKits[0] && (function compare2EnterRectKit(rectKits, y) {
					var length = rectKits.length,
						median,
						rectKit,
						bottom,
						after;
					if (length > 1) {
						median = Math.ceil(length / 2);
						rectKit = rectKits[median];
						rect = rectKit.rect;
						// 看比较区域坐标的元素是否位于拖拽元素之前，下同
						after = y > rect.top - 8; // +margin-top

						return after ? compare2EnterRectKit(rectKits.slice(median), y) : compare2EnterRectKit(rectKits.slice(0, median), y);
					} else {
						rectKit = rectKits[0];
						rect = rectKit.rect;
						after = rectKit.before ? y > rect.bottom : y > rect.top - 8;

						if (rectKit.after !== after) {
							rectKit.after = after;
							return rectKit;
						}
					}
				})(rectKits, e.clientY);

			},

			// click事件路由
			click: function(e) {
				var role;

				switch (e.target) {

					case this.optionsRelationBtn:
						this.switchOptionsRelation(e);
						break;

					case this.thumbtack:
						this.toggleThumbtack(e);
						break;

					default:
						role = e.target.getAttribute('role');
						switch (role) {
							case 'removeOptionBtn':
								this.removeOption(e);
								break;
							default:
						}
				}

				this.rootClick(e);
			},

			// 切换设置筛选项的关联关系（设置：或/且）
			switchOptionsRelation: function(e) {
				var orb = this.optionsRelationBtn;
				if (orb.value === 'and') {
					orb.value = 'or';
					$(orb).text('或');
				} else {
					orb.value = 'and';
					$(orb).text('且');
				}
				this.changeRequestRender();
			},

			// 点击拔除图钉
			toggleThumbtack: function(e) {
				if (this.actived) { //console.log(this.thumbtack)
					this.clearFiltersActived();
					this.resetWrapper();
					this.setMouseenter();
				}
			},

			// 父元素总控激活样式
			rootClick: function(e) {},

			// 删除选项（点击删除按钮）
			removeOption: function(e) {
				var optionItem = $.getAncestor(e.target, this.optionItem$);

				$(optionItem).remove();

				$(this.wrapper).on('transitionend', this.handleEvent);
				this.resetWrapperHeight();

				// 清除条件分支
				this.clearConditionBranch(optionItem);
				this.setOptionsRelationShow();

				this.setActionAttrsCondition();
				this.changeRequestRender();
			},

			//			selectedOptionsValueHash: {},

			// 设置事件属性条件是否关联可见
			setActionAttrsCondition: function() {
				if (this.filterType === 'filterEvents') {
					this.parent.setAttrsConditionsUnfixedBtnItems();
				}
			},

			// 过滤关联选项
			filterOptions: function(values) {
				var $optionItems = $(this.optionItem$, this.optionList);
				$optionItems.remove().filter(function() {
						var btn = this.querySelector('button'); //console.log(values.indexOf(btn.value) > -1)
						return values.indexOf(btn.value) > -1;
					})
					.appendTo(this.optionList);
				this.setOptionsRelationShow();
			},

			// ***********************************************
			//以下为获取请求数据，由父组件负责拼装发起请

			conditionBtn$: '.condition-btn',

			// 获取漏斗集
			getActions: function() {
				var actions = [];

				$(this.conditionBtn$, this.optionList).each(function() {
					var action = {},
						// this.name === 'actionName'
						name = this.name,
						value = this.value;

					action[name] = value;
					action.actions = [value];
					action[name + '_zh'] = $(this).text();

					actions.push(action);
				});
				return actions;
			},

			// 获取查看项套件
			// return object
			getGroupFieldsKit: function() {
				var groupFields = [],
					groupFields_zh = [];

				$(this.conditionBtn$, this.optionList).each(function() {
					groupFields.push(this.value);
					groupFields_zh.push($(this).text());
				});
				return {
					groupFields: groupFields,
					groupFields_zh: groupFields_zh
				};
			},

			// 获取查看项
			// return string array
			getGroupFields: function() {
				return _map($(this.conditionBtn$, this.optionList), function(btn) {
					return btn.value;
				});
			},

			// 用户触发UI组件变动，请求数据重绘图表
			changeRequestRender: function() {
				this.parent.changeRequestRender();
			},

			// 图表刷新
			chartRestore: function() {
				this.parent.chartRestore();
			},

			// 获取筛选条件的或/且关系
			getRelation: function() {
				return this.optionsRelationBtn.value || 'and'; // or
			},

			hasOption: function() {
				return $(this.optionItem$, this.optionList).length > 0;
			},

			// 获取筛选条件（集合和关系）
			getFilterCondition: function() {

				var conditions = [],
					inputName = this.conditionValuesName,
					inputNameZh = this.conditionValuesZhName,
					labelName = this.conditionLabelsName,
					// 有空值的筛选条件，不保存，只做程序处理
					hasEmptyValueFilterCondition = false;

				$(this.optionItem$, this.optionList).each(function() {
					var condition = {},
						dropdownWrapper = this.querySelector('.dropdown-wrapper'),
						linkageBox;

					$('>button', this).each(function() {
						condition[this.name] = this.value;
					});

					// 若包含可选可填项
					if (dropdownWrapper) {
						setSelectCondition(condition, dropdownWrapper, 'input[type=hidden][name="' + inputName + '"]');
					}
					// 若包含输入项
					else if (linkageBox = this.querySelector('.linkage-box')) {
						setCondition(condition, linkageBox, '[name="' + inputName + '"]');
					} else {
						conditions.push(condition);
					}
				});
				//console.log(hasEmptyValueFilterCondition);

				//if (conditions.length > 0) {
				return {
					conditions: conditions,
					relation: this.getRelation(),
					hasEmptyValueFilterCondition: hasEmptyValueFilterCondition
				};
				//}

				// 查找和筛选条件（已选项）
				function setSelectCondition(condition, dropdownWrapper, inputHiddenSelector) {
					var $inputHiddenSelector = $(inputHiddenSelector, dropdownWrapper);

					$inputHiddenSelector.each(function() {
						var value = this.value,
							label = $(this.parentNode).text().trim(),
							dimensionId;

						// 若值不为空字符串
						if (value) {
							if (condition[inputName]) {
								condition[inputName].push(value);
								condition[inputNameZh].push(label);
							} else {
								condition[inputName] = [value];
								condition[inputNameZh] = [label];
							}
						} else {
							if (condition[labelName]) {
								condition[labelName].push(label);
							} else {
								condition[labelName] = [label];
							}
						}
					});

					// 若有值则放入筛选条件数组
					if (condition[inputName] || condition[labelName]) {
						if (dimensionId = getDimensionId()) {
							condition.dimensionId = dimensionId;
						}
						conditions.push(condition);
					} else {
						hasEmptyValueFilterCondition = true;
					}

					function getDimensionId() {
						var input = dropdownWrapper.querySelector('input[type=text][name="' + inputName + '"]'),
							dataListAttr = input && input.dataset.list,
							execResult = dataListAttr && (/^ns\(.+\.([^.]+)\)$/.exec(dataListAttr) || /^url\(.+=([^=]+)\)$/.exec(dataListAttr)),
							dimensionId = execResult && execResult[1];

						return dimensionId;
					}
				}

				// 查找和筛选条件
				function setCondition(condition, linkageBox, inputSelector) {
					var $inputSelector = $(inputSelector, linkageBox);

					$inputSelector.each(function() {
						var value = this.value,
							label = value;

						if (condition[inputName]) {
							condition[inputName].push(value);
							condition[inputNameZh].push(label);
						} else {
							condition[inputName] = [value];
							condition[inputNameZh] = [label];
						}
					});

					// 若有值则放入筛选条件数组
					if (condition[inputName]) {
						if (condition[inputName].every(function(v) {
								return v
							})) {
							conditions.push(condition);
						} else {
							hasEmptyValueFilterCondition = true;
						}
					} else if ($inputSelector.length > 0) {
						hasEmptyValueFilterCondition = true;
					}
				}
			},

			//{
			//	"actions": [{
			//		"actionName": "PayOrder",
			//		"operation": "sum",
			//		"field": "event.order_money"
			//	}],
			//	"unit": "day",
			//	"filterCondition": {
			//		"relation": "or",
			//		"conditions": [{
			//			"field": "event.provice",
			//			"expression": "notequal",
			//			"values": ["辽宁省"]
			//		}]
			//	},
			//	"groupFields": ["event.provice"],
			//	"bucketConditions": [],
			//	"startDate": "2015-11-10",
			//	"endDate": "2015-11-12"
			//}
			// 设置原始数据渲染
			setOriginalData: function(requestData, requestZhData) {
				switch (this.filterType) {
					case 'filterEvents':
						this.setFilterBehaviors(requestData.actions);
						break;
					case 'filterAttrs':
						this.setFilterAttrs(requestData.groupFields);
						break;
					case 'filterConditions':
						this.setFilterConditions(requestData.filterCondition, requestZhData.filterCondition);
						break;
				}
				this.setActionAttrsCondition();
			},

			// 跨层级连词
			dropdownSelectCrossLevelHyphen: '的',

			// 设置事件筛选器
			setFilterBehaviors: function(actions) { //console.log(JSON.stringify(actions));
				if (actions.length < 1) {
					return;
				}
				var that = this,
					relatedConditions = this.relatedConditions,
					optionItemTmplFn = this.getTmplFn('optionItemTmpl'),
					selectTmplFn = this.getTmplFn('selectTmpl'),
					subitemTmplFn = this.getTmplFn('subitemTmpl'),
					initialMap = this.parent.initialMap,
					html = actions.map(function(action) {
						var bHtml = '',
							sHtml = '',
							selectLabel = '',
							i,
							branches = [],
							optionItemBranch,
							selectBranch,
							subitemBranch,
							actionName = action.actionName,
							operation = action.operation,
							field = action.field;
						//	"actions": [{
						//		"actionName": "PayOrder",
						//		"operation": "sum",
						//		"field": "event.order_money"
						//	}],
						relatedConditions.some(function(relatedCondition) {
							return relatedCondition.dataConfigs.some(function(dt) {

								var _initial = initialMap[dt.bname];

								return dt.children.some(function(b) {
									if (b.value === actionName) {
										optionItemBranch = b;
										optionItemBranch._initial = _initial;
										b.selected = true;

										if (b.children) {

											if (field) {
												b.children.some(function(c) {
													if (c.value === field) {
														selectBranch = c;
														c.selected = true;

														c.children.some(function(f) {
															if (f.value === operation) {
																subitemBranch = f;
																f.selected = true;
																return true;
															}
														});

														return true;
													}
												});
											} else {
												b.children.some(function(c) {
													if (c.value === operation) {
														selectBranch = c;
														c.selected = true;
														return true;
													}
												});
											}

										}
										relatedCondition.setDragBtnDragdisable(b.bid, DataConfig.isBranchAllSelected(b));
										return true;
									}
								});
							});
						});
						
						if(!optionItemBranch){
							return bHtml;
						}

						bHtml = optionItemTmplFn(optionItemBranch);
						delete optionItemBranch._initial;

						if (selectBranch) {

							selectLabel = selectBranch.label;
							selectBranch.label = subitemBranch ? selectLabel + '的' + subitemBranch.label : selectLabel;

							sHtml = this.createDropdownSelectHtml(selectBranch, selectTmplFn);

							selectBranch.label = selectLabel;

							// 若包含下拉子分支
							if (subitemBranch) {
								sHtml += subitemTmplFn(subitemBranch);
							}

							i = bHtml.indexOf('<i');
							bHtml = bHtml.slice(0, i) + sHtml + bHtml.slice(i);
						}

						return bHtml;

					}, this).join('');

				$(html).prependTo(this.optionList);
				this.setActionAttrsCondition();
			},

			// 设置属性筛选器
			setFilterAttrs: function(groupFields) {
				if (groupFields.length < 1) {
					return;
				}
				var optionItemTmplFn = this.getTmplFn('optionItemTmpl'),
					rcs = this.relatedConditions,
					initialMap = this.parent.initialMap,

					html = groupFields.map(function(field) {
						var branch, bHtml;

						rcs.some(function(rc) {
							return rc.dataConfigs.some(function(dt) {

								var _initial = initialMap[dt.bname];

								return dt.children.some(function(b) {
									if (b.value === field) {
										branch = b;
										branch._initial = _initial;
										return true;
									}
								});
							});
						});

						bHtml = optionItemTmplFn(branch);
						delete branch._initial;

						return bHtml;

					}).join('');

				$(html).prependTo(this.optionList);
			},

			// 设置条件筛选器
			setFilterConditions: function(filterCondition, filterConditionZh) {
				if (!filterCondition) {
					return;
				}
				var relatedConditions = this.relatedConditions,
					optionItemTmplFn = this.getTmplFn('optionItemTmpl'),
					selectTmplFn = this.getTmplFn('selectTmpl'),
					linkageBoxTmplFn = this.getTmplFn('linkageBoxTmpl'),
					selectedOptionTmplFn = DropdownPicker.getTmplFn('selectedOptionTmpl'),
					selecteOneTypeTmplFn = DropdownPicker.getTmplFn('selecteOneTypeTmpl'),
					inputSelectTypeTmplFn = DropdownPicker.getTmplFn('inputSelectTypeTmpl'),
					relation = filterCondition.relation,
					conditions = filterCondition.conditions,
					conditionsZh = filterConditionZh.conditions,
					initialMap = this.parent.initialMap,

					html = conditions.map(function(condition, i) {
						var bHtml = '',
							sHtml = '',
							i,
							branches = [],
							optionItemBranch,
							selectBranch,
							linkageBoxBranch,
							field = condition.field,
							expression = condition.expression,
							operation = condition.operation,
							values = condition[this.conditionValuesName],
							valuesZh = conditionsZh[i][this.conditionValuesZhName],
							labels = condition[this.conditionLabelsName],
							selectedOptions = values.map(function(value, i) {
								var option = {};
								option[this.dimensionDataNameKey] = valuesZh[i];
								option[this.dimensionDataValueKey] = value;
								return option;
							}, this);

						labels && (selectedOptions = selectedOptions.concat(labels.map(function(label, i) {
							var option = {};
							option[this.dimensionDataNameKey] = label;
							option[this.dimensionDataValueKey] = '';
							return option;
						}, this)));

						//	"filterCondition": {
						//		"relation": "or",
						//		"conditions": [{
						//			"field": "event.provice",
						//			"expression": "notequal",
						//			"values": ["辽宁省"]
						//		}]
						//	},
						relatedConditions.some(function(relatedCondition) {
							return relatedCondition.dataConfigs.some(function(dt) {

								var _initial = initialMap[dt.bname];

								return dt.children.some(function(b) {
									if (b.value === field) {
										optionItemBranch = b;
										optionItemBranch._initial = _initial;

										b.children.some(function(c) {
											if (c.value === expression) {
												selectBranch = c;
												return true;
											}
										});

										return true;
									}
								});
							});
						});

						sHtml = this.createDropdownSelectHtml(selectBranch, selectTmplFn);

						// 若包含下拉子分支
						if ((selectBranch.dataType || selectBranch.childrenDataType) !== 'boolean') {
							linkageBoxBranch = selectBranch;
							sHtml += this.createLinkageBoxHtml(linkageBoxBranch, linkageBoxTmplFn, selectedOptions, selectedOptionTmplFn, inputSelectTypeTmplFn, selecteOneTypeTmplFn);
						}

						bHtml = optionItemTmplFn(optionItemBranch);
						delete optionItemBranch._initial;

						i = bHtml.indexOf('<i');
						bHtml = bHtml.slice(0, i) + sHtml + bHtml.slice(i);

						return bHtml;
					}, this).join('');

				$(html).prependTo(this.optionList);
				this.setOptionsRelationValue(relation);
				this.setOptionsRelationShow();
			},

			// 显示筛选条件关联关系样式（拖入两个或以上筛选条件是显示）
			rootShowRelationClass: 'show-options-relation',

			// 设置是否显示筛选条件的关联关系
			setOptionsRelationShow: function() {
				// 筛选条件具备关联关系（显示：或/且）
				if (this.hasRelation) {
					$(this.root)[$('li', this.optionList).length > 1 ? 'addClass' : 'removeClass'](this.rootShowRelationClass);
				}
			},

			// 设置筛选项的关联关系（设置：或/且）
			setOptionsRelationValue: function(value) {
				var orb = this.optionsRelationBtn;
				orb.value = value;
				$(orb).text(value === 'and' ? '且' : '或');
			},

			// 维度字典url
			dimensionDataUrl: __api_path + '/services/metadata/dimension',
			// 维度显示选项数量
			dimensionShowCount: 100,

			// 获取维度字典url（加入字段id）
			getDimensionDataUrl: function(id) {
				var dimensionDataUrl = this.dimensionDataUrl + '?fieldName=' + id + '&showCount = ' + this.dimensionShowCount;
				return dimensionDataUrl;
			},
			// 维度字典数据的值键
			dimensionDataValueKey: 'value',
			// 维度字典数据的名称键
			dimensionDataNameKey: 'label',

			// 创建关联选项
			createLinkageBoxHtml: function(linkageBoxBranch, linkageBoxTmplFn, selectedOptions, selectedOptionTmplFn, inputSelectTypeTmplFn, selecteOneTypeTmplFn) {
				var that = this,
					html,
					triggerName = this.conditionValuesName,
					dataType = linkageBoxBranch.dataType || linkageBoxBranch.childrenDataType,
					type = linkageBoxBranch.inputType || linkageBoxBranch.childrenType,
					value = linkageBoxBranch.value,
					branch = {
						name: triggerName,
						//values: ['', ''],
						value: '',
						label: '',
						dataType: '',
						type: 'text',
						pattern: '',
						datasetList: '',
						datasetListFetched: '',
						selectedOptionsHtml: '',
						dropdownBeforeInitList: '',
						dropdownInitList: '',
						dropdownListClick: '',
					};

				//values && (linkageBoxBranch.values = values);
				//console.log(linkageBoxBranch);console.log(type);
				switch (dataType) {
					case 'STRING':
						switch (type) {
							case 'select-one':
								setStringBranch();
								branch.value = selectedOptions ? selectedOptions[0][this.dimensionDataValueKey] || selectedOptions[0] : '';
								branch.label = selectedOptions ? selectedOptions[0][this.dimensionDataNameKey] || branch.value : '请选择';
								selecteOneTypeTmplFn || (selecteOneTypeTmplFn = DropdownPicker.getTmplFn('selecteOneTypeTmpl'));
								html = selecteOneTypeTmplFn(branch);
								return html;
							case 'select-multiple':
							case 'input-select-one':
							case 'input-select-multiple':
								setStringBranch();
								if (selectedOptions) {
									selectedOptionTmplFn || (selectedOptionTmplFn = DropdownPicker.getTmplFn('selectedOptionTmpl'));
									branch.selectedOptionsHtml = selectedOptions.map(function(option) {
										var o = {
											name: triggerName,
											value: option[this.dimensionDataValueKey],
											label: option[this.dimensionDataNameKey]
										};
										return selectedOptionTmplFn(o);
									}, this).join('');
								}
								inputSelectTypeTmplFn || (inputSelectTypeTmplFn = DropdownPicker.getTmplFn('inputSelectTypeTmpl'));
								html = inputSelectTypeTmplFn(branch);
								return html;
							case 'input':
								branch.value = selectedOptions ? selectedOptions[0][this.dimensionDataValueKey] || selectedOptions[0] : '';
								setStringBranch();
								break;
							default:
						}
						break;

					case 'INTEGER':
						setNumberBranch();
						branch.pattern = '^\\-?\\d{0,10}$';
						break;
					case 'DOUBLE':
						setNumberBranch();
						branch.pattern = '^\\-?\\d{0,10}(?:\\.\\d{0,10})$';
						break;
					case 'LONG':
						setNumberBranch();
						branch.pattern = '^\\-?\\d{0,10}$';
						break;

					case 'DATE':
						setDateBranch();
						break;
				}
				//console.log(linkageBoxBranch)
				linkageBoxTmplFn || (linkageBoxTmplFn = this.getTmplFn('linkageBoxTmpl'));

				html = linkageBoxTmplFn(branch);

				return html;

				// 字符串类型
				function setStringBranch() {
					if (type === 'input') {
						branch.dataType = 'text';
						branch.type = 'input';
						return;
					} else {
						branch.dataType = type;
						branch.type = 'text';
					}
					// 维度表id
					var id = linkageBoxBranch.dimensionId || linkageBoxBranch.children,
						dimensionDataUrl,
						datasetList;

					if (!id) {
						return;
					}

					datasetList = that.definedDropdownDatalistNS(id);
					//dimensionDataUrl = '/data/dimensionData.json';
					//branch.datasetList = DropdownPicker.stringifyHtml(linkageBoxBranch.children);

					if (datasetList) {
						branch.datasetList = datasetList;
					} else {
						dimensionDataUrl = that.getDimensionDataUrl(id);
						datasetList = 'url(' + dimensionDataUrl + ')';
						branch.datasetList = datasetList;
						branch.datasetListFetched = that.definedDropdownDatalistFetchedNS();
					}
					branch.optionNameKey = that.dimensionDataNameKey;
					branch.optionValueKey = that.dimensionDataValueKey;

					branch.dropdownBeforeInitList = that.NS + '.dropdownBeforeInitList';
					//branch.dropdownInitList = that.NS + '.dropdownInitList';
					//branch.dropdownListClick = that.NS + '.dropdownListClick';

				}

				// 数值类型分支
				function setNumberBranch() {

					if (value === 'BETWEEN') {
						branch.values = getValues();
						branch.dataType = 'number-range';
					} else {
						branch.dataType = 'number';
					}
					branch.type = dataType;
				}

				// 日期类型分支
				function setDateBranch() {
					if (type === 'date-range') {
						branch.values = getValues();
						branch.dataType = 'date-range';
						branch.type = 'text';
					} else {
						branch.dataType = 'date';
						branch.type = 'date';
					}
				}

				// 获取值集合
				function getValues() {
					var values = selectedOptions ? selectedOptions.map(function(o) {
						return o[this.dimensionDataValueKey];
					}, that) : [];
					return values;
				}
			},

			// 清空所有筛选项
			clearAnalysis: function() {
				$(this.optionList).empty();
			}

		});

		_.extend(Filter.prototype, FilterDropdown);
		_.extend(Filter.prototype, FilterDrag);

		return Filter;

	});