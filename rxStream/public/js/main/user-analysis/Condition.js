//
define([
		'jQcss3',
		'dot',
		'AppPage',
		'AppPage/Widget/DOMDrag',
		'main/user-analysis/DataConfig'
	],
	function(css3, dot,AppPage, DOMDrag, DataConfig) {

		// 类构造函数
		function Condition() {}

		// 原型
		Condition.prototype = _.create(EventEmitter.prototype, {
			'constructor': Condition
		});


		// 原型扩展
		$.extend(Condition.prototype, {
			// 分析条件模块的名称集
			conditionNames: ['eventAttrs'], // |subjectAttrs|objectAttrs

			root: null,
			btnItemList: null,
			btnItems: null,
			btns: null,
			dataConfigs: null,
			dragBtn: null,
			dragBtnItem: null,
			myDrag: null,
			dragBtnData: null,
			dragBtnNeedMoveOut: false, // 拖拽按钮时必须移出
			btnItem$: '.li-btn-item',
			dragBtnItemClass: 'drag-btn-item',

			dragable$: '.dom-dragable', // 匹配拖拽目标元素的样式选择器
			dragableClass: 'dom-dragable', // 拖拽目标元素的样式类
			dragdisable$: '.dom-dragdisable', // 匹配取消拖拽目标源元素的样式选择器
			dragdisableClass: 'dom-dragdisable', // 取消拖拽目标源元素的样式

			// 关联的筛选器（数组，可多个）
			relatedFilters: null,
			// 拖拽进入的筛选器
			entererFilter: null,

			// 设置拖拽按钮是否可拖拽（用样式类控制）
			setDragBtnDragdisable: function(bid, disable){
				var dragBtn = this.btnItemList.querySelector('button[data-bid=' + bid + ']');
				$(dragBtn)[disable ? 'addClass' : 'removeClass'](this.dragdisableClass);
			},

			// 清空所有选中项
			clearAnalysis: function(){
				this.dataConfigs.forEach(function(dataConfig){
					dataConfig.clearAllSelected();
				});
				$(this.dragdisable$, this.btnItemList).removeClass(this.myDrag.dragdisableClass);
			},

			// 初始化实例
			init: function init(root, options) {
				options && $.extend(this, options);
				this.bindHandleEvent();
				this.initRoot(root);
				this.initParts();
				$(this.panelH).on('click', this.handleEvent);
				$(window).on('resize', this.handleEvent);
				return this;
			},

			// 初始化实例根元素
			initRoot: function(root) {
				this.root = $(root)[0];
				this.doc = document;
				this.docRoot = this.doc.documentElement;
			},

			// 模板选择器
			tmpl$: 'script[type="text/x-dot-template"]',

			// 模板元素
			btnItemTpl: null,

			// 模板函数在下面的步骤中生成
			btnItemTplFn: null,

			// 初始化各部件
			initParts: function() {
				var elems = this.root.getElementsByTagName('*');
				// 依据role属性设置成员
				_.forEach(elems, function(elem){
					var role = elem.getAttribute('role');
					if(role){
						this[role] = elem;
					}
				}, this);
			},

			// 创建拖拽实例
			createDrag: function() {
				var dragSettings = {
					limitRect: this.parent.root,
					dragable$: this.dragable$,
					dragableClass: this.dragableClass,
					dragdisable$: this.dragdisable$,
					dragdisableClass: this.dragdisableClass
				};
				this.bind('dragHandleEvent');
				this.myDrag = DOMDrag.create(this.btnItemList, dragSettings);
				this.myDrag.on('beforedrag startdrag dragging drop', this.dragHandleEvent);
			},

			// 拖拽处理事件路由
			dragHandleEvent: function(dragEvent, domEvent) {
				var type;
				switch (dragEvent.type) {
					case 'beforedrag':
						this.beforedrag(dragEvent, domEvent);
						break;
					case 'startdrag':
						this.startdrag(dragEvent, domEvent);
						break;
					case 'dragging':
						this.dragging(dragEvent, domEvent);
						break;
					case 'drop':
						this.drop(dragEvent, domEvent);
						break;
				}
			},

			// 拖拽前事件
			beforedrag: function(dragEvent, domEvent) {
				// this.myDrag 即dragEvent.target
				this.dragBtn = this.myDrag.dragTarget = this.myDrag.target;
				this.dragBtnItem = $.getAncestor(this.dragBtn, this.btnItem$);
				this.getDragBtnData();
				this.initCloneBtn();
				//this.emit('beforedrag', dragEvent, domEvent);
			},

			// 获取拖拽按钮项的数据
			getDragBtnData: function() {
				var bid = this.dragBtn.dataset.bid;

				this.dataConfigs.some(function(dataConfig){
					var branch = dataConfig.getBranchByBid(bid);
					if(branch){
						this.dragBtnData = branch;
						return true;
					}
				}, this);
			},

			// 开始拖拽
			startdrag: function(dragEvent, domEvent) {
				//this.emit('startdrag', dragEvent, domEvent);
			},

			// 拖拽中
			dragging: function(dragEvent, domEvent) {
				var entererFilter = this.getEnteredFilter(domEvent);
				// 若鼠标进入的目标筛选器
				if (entererFilter) {
					if (this.entererFilter && entererFilter !== this.entererFilter) {
						this.entererFilter.readyAddOption(false);
					}
					this.entererFilter = entererFilter;
					entererFilter.readyAddOption(true);
				} else if (this.entererFilter) {
					this.entererFilter.readyAddOption(false);
					delete this.entererFilter;
				}
				//this.emit('dragging', dragEvent, domEvent);
			},

			// 目标元素放下
			drop: function(dragEvent, domEvent) {
				var entererFilter = this.getEnteredFilter(domEvent);
				// 若鼠标进入的目标筛选器
				if (entererFilter) {
					this.relatedFiltersCancelAddOption = function(){
						this.relatedFilters.forEach(function(filter) {
							if (filter !== entererFilter) {
								filter.cancelAddOption();
							}
						});
						delete this.relatedFiltersCancelAddOption;
						return true;
					}

					entererFilter.sourceCondition = this;
					this.entererFilter = entererFilter;
				}
				// 不在目标筛选器范围内
				else {
					this.relatedFilters.forEach(function(filter) {
						filter.resetWrapper();
						filter.cancelAddOption();
					});
					delete this.entererFilter;
				}
				this.resetCloneBtn();
				//this.emit('drop', dragEvent, domEvent);
			},

			// 获取生成按钮项的模板函数
			getBtnItemTplFn: function() {
				return this.getTmplFn('btnItemTmpl');
			},

			// 通过role名获取相应的模板函数
			getTmplFn: function(role) {
				var tmplFn = this[role + 'Fn'];
				if(tmplFn){
					return tmplFn;
				}

				var tmplNode = this[role],
					tmplStr = tmplNode.text || tmplNode.innerHTML,
					settings = $.extend({}, dot.templateSettings, {
						strip: false
					});

				tmplNode.parentNode.removeChild(tmplNode);
				tmplFn = this[role + 'Fn'] = dot.template(tmplStr, settings);
				return tmplFn;
			},

			// 绘制
			render: function() {
				this.createDrag();
				this.renderBtnItemList();
				return this;
			},

			// 重绘
			reRender: function() {
				return this;
			},

			// 绘制条件按钮选项列表
			renderBtnItemList: function() {

				this.parent.conditionsDataDefer.then(function(res){
					var data = res.dataObject || res;
					this.dataConfigs = this.conditionNames.map(function(name){
						var conditions = data[name],
							dataConfig = DataConfig.create(conditions, {bname: name});
						this.unfold(false);
						this.setDataConfigNS(dataConfig);
						this.renderBtnItems(conditions, name);
						return dataConfig;
					}, this);
					//console.log(data)
					return this.dataConfigs;

				}.bind(this));
			},
			
			getOtherAttrsConditions: function(){
				return [
					this.parent.eventAttrs,
					this.parent.subjectAttrs,
					this.parent.objectAttrs
				]
				.filter(function(condition){ return condition !== this; }, this);
			},
			
			// 是否已展开
			unfolded: false,
			
			// 展开
			unfold: function(b){
				if(!b && !this.unfolded){
					return;
				}
				var parent = this.root.parentNode,
					parentHeight = parent.clientHeight,
					panelHsHeight = this.getOtherAttrsConditions()
						.reduce(function(prev, condition){
							$(condition.root).removeClass('unfold');
							condition.unfolded = false;
							condition.root.style.height = '';
							return prev + condition.panelH.offsetHeight;
						}, 0);
				this.root.style.height = parentHeight - panelHsHeight + 'px';
				$(this.root).addClass('unfold');
				this.unfolded = true;
			},

			// 设置数据树到指定的命名空间（指定前缀 + 当前分析类型 + 数据树命名）
			setDataConfigNS: function(dataConfig){
				dataConfig.NS = [this.NS, dataConfig.bname].join('.'); // 如：AppPage.UserAnalysis.behavior.userEvents.actions
				Object.ns(dataConfig.NS, dataConfig);
			},

			// 固定显示的属性对应的列表项
			fixedBtnItems: [],
			// 固定显示的属性对应的字段值
			fixedBtnItemsValues: [],
			// 非固定显示的属性对应的列表项
			unfixedBtnItems: [],
			// 非固定显示的属性对应的hash集合（字段值：列表项）
			unfixedBtnItemsValueHash: {},

			// 绘制条件按钮列表选项集
			renderBtnItems: function(conditions, bname){
				var tmplFn = this.getTmplFn('btnItemTmpl'),
					btnItemListHtml = tmplFn(conditions),
					$conditionLis;

//				this.fixedBtnItems = [];
//				this.fixedBtnItemsValues = [];
//				this.unfixedBtnItems = [];
//				this.unfixedBtnItemsValueHash = {};

				conditions._initial = this.parent.initialMap[bname];
				$conditionLis = $(tmplFn(conditions)).filter(function(){
					return this.nodeType === 1;
				});

				switch(bname){
					case 'events':

					break;
					case 'eventAttrs':
					case 'subjectAttrs':
					case 'objectAttrs':

						conditions.forEach(function(condition, i){
							var value = condition.value,
								li = $conditionLis[i];
							//
							if(this.hasFixedPrefix(value)){
								this.fixedBtnItemsValues.push(value);
								this.fixedBtnItems.push(li);
							}
							else{
								li.style.display = 'none';
								this.unfixedBtnItems.push(li);
								this.unfixedBtnItemsValueHash[value] = li;
							}
						}, this);
					break;
				}

				delete conditions._initial;
				$conditionLis.appendTo(this.btnItemList);
			},
			
			fixedPrefix: 'b_dollar_', // o_dollar_
			// 包含固有属性前缀
			hasFixedPrefix: function(value){
				return value.length > this.fixedPrefix.length && !value.indexOf(this.fixedPrefix); 
			},
			
			// 设置事件属性的非固定按钮选项是否可见
			setUnfixedBtnItems: function(){
				var events = this.parent.conditionsData.events,
					values = this.fixedBtnItemsValues.slice();
				
				// 先设置非固定属性都不可见
				$(this.unfixedBtnItems).css('display', 'none');
				
				events.filter(function(event){
					var fields = [];
					if(!event.selected) return false;
					
					switch(this.conditionType){
						case 'eventAttrs':
							fields = filterMapAttrFields(event.dimensions.concat(event.children));
							break;
						case 'subjectAttrs':
							fields = filterMapAttrFields(event.subjectProps);
							break;
						case 'objectAttrs':
							fields = filterMapAttrFields(event.objectProps);
							break;
					}

					fields.forEach(function(field){
						var btnItem = this.unfixedBtnItemsValueHash[field];
						if(btnItem){
							btnItem.style.display = '';
							if(values.indexOf(field) < 0){
								values.push(field);
							}
						}
					}, this);

				}, this);
				
				function filterMapAttrFields(attrs, valueKey){
					var fields = [];
					if(attrs){
						attrs.forEach(function(attr){
							attr.visible && fields.push(attr[valueKey || 'value']);
						});
					}
					return fields;
				}
				//console.log(values, this.conditionType);
				return values;
				
//				this.parent.filterAttrs.filterOptions(values);
//				this.parent.filterConditions.filterOptions(values);
			},

			// 通过bid获取数据树套件
			getDataConfigKitByBid: function(bid){
				var dataConfigKit;
				this.dataConfigs.some(function(dataConfig){
					var branch = dataConfig.getBranchByBid(bid);
					if(branch){
						dataConfigKit = {
							condition: this,
							dataConfig: dataConfig,
							branch: branch,
							rootBranch: dataConfig.getRootBranch(branch),
							clearBranchSelected: function(whether){
								if(whether || this.branch !== this.rootBranch){
									this.dataConfig.clearBranchSelected(this.branch);
								}
							},
							setBranchSelected: function(whether){
								if(whether || this.branch !== this.rootBranch){
									this.dataConfig.setBranchSelected(this.branch);
								}
							}
						};
						return true;
					}
				}, this);
				return dataConfigKit;
			},

			// 通过bid获取数据树
			getDataConfigByBid: function(bid){
				var dataConfigKit = this.getDataConfigKitByBid(bid);
				return dataConfigKit && dataConfigKit.dataConfig;
			},

			// 通过一组层级values获取DataConfig套件
			getDataConfigKitByValues: function(values){
				var dataConfigKit;
				this.dataConfigs.some(function(dataConfig){
					var cascadeBranches = dataConfig.getCascadeBranchesByValues(values);
					if(branch){
						dataConfigKit = {
							condition: this,
							dataConfig: dataConfig,
							cascadeBranches: cascadeBranches,
							branch: cascadeBranches[values.length - 1],
							rootBranch: cascadeBranches[0],
							clearBranchSelected: function(whether){
								if(whether || this.branch !== this.rootBranch){
									this.dataConfig.clearBranchSelected(this.branch);
								}
							},
							setBranchSelected: function(whether){
								if(whether || this.branch !== this.rootBranch){
									this.dataConfig.setBranchSelected(this.branch);
								}
							}
						};
						return true;
					}
				}, this);
				return dataConfigKit;
			},

			// 通过一组层级values获取一个分支
			getDataConfigByValues: function(values){
				var dataConfigKit = this.getDataConfigKitByValues(values);
				return dataConfigKit && dataConfigKit.dataConfig;
			},

			// 处理事件路由
			handleEvent: function(e) {
				var type;
				switch (e.type) {
					case 'click':
						e.currentTarget === this.panelH && this.unfold(true);
						break;
					case 'resize':
						e.currentTarget === window && this.unfold(false);
						break;
					default:
						type = e.type.toLowerCase();
						if (type.indexOf('transitionend') > -1) {
							e.w3ctype = 'transitionend';
							this.transitionend(e);
						}
				}
			},

			// 预置返回值函数
			relatedFiltersCancelAddOption: EventEmitter.returnFalse,

			// 获取鼠标进入的目标筛选器
			getEnteredFilter: function(domEvent) {
				var entererFilter = null;
				this.relatedFilters.some(function(filter) {
					if (filter.rootRect && this.isEnterRect(filter.rootRect)) {
						filter.compareInsertHintOption(domEvent);
						return entererFilter = filter;
					}
				}, this.myDrag);
				return entererFilter;
			},

			// 被拖拽的按钮界面区域
			dragBtnRect: null,
			// 替换拖拽对象的clone按钮（置于body下）
			cloneBtn: null,
			// 样式类
			cloneBtnClass: 'clone-condition-btn',
			// 拖拽最终确认添加到筛选器时clone按钮的吸附动画样式类
			cloneBtnAddClass: 'add-condition-btn',

			// 初始化拖拽的clone按钮
			initCloneBtn: function() {

				var rect = this.dragBtnRect = this.dragBtn.getBoundingClientRect();
				this.myDrag.dragTarget = this.cloneBtn = this.dragBtn.cloneNode(true);

				$(this.cloneBtn)
					.addClass(this.cloneBtnClass)
					.appendTo('body');

				$(this.dragBtnItem).addClass(this.dragBtnItemClass);

				this.relatedFilters.forEach(function(filter) {
					filter.sourceCondition = this;
					filter.hintAddOption();
				}, this);
			},

			// 重置克隆按钮及其他相关属性、样式等
			resetCloneBtn: function() {
				var rect = this.entererFilter ? this.entererFilter.hintBtn.getBoundingClientRect() : this.dragBtnRect;
				var cloneBtnRect = this.cloneBtn.getBoundingClientRect();

				if (cloneBtnRect.top !== rect.top || cloneBtnRect.left !== rect.left) {
					$(this.cloneBtn)
						.on('transitionend', this.handleEvent)
						.addClass(this.cloneBtnAddClass)
						.css({
							left: rect.left + 'px',
							top: rect.top + 'px'
						});
				} else {
					this.reset();
				}
			},

			// 吸附到目标位置的动画结束后的设置
			transitionend: function(e) {
				this.relatedFiltersCancelAddOption();
				this.entererFilter && this.entererFilter.ensureAddOption();
				this.reset();
			},

			// 充值实例
			reset: function() {
				$(this.dragBtnItem).removeClass(this.dragBtnItemClass);
				$(this.cloneBtn).remove();
				delete this.dragBtnData;
				delete this.entererFilter;
				delete this.cloneBtn;
				delete this.dragBtnRect;
				delete this.dragBtn;
				delete this.dragBtnItem;
			},

			// ***********************************************
			//以下为获取请求数据，由父组件负责拼装发起

			// 获取数据树的选中项
			getActions: function(){

				var actions = [];

				this.dataConfigs.map(function(dataConfig){
					var comboBranches = [];
					getSelectedBranchs(actions, dataConfig.children, comboBranches);
					return comboBranches;
				});

				function getSelectedBranchs(actions, children, comboBranches){
					children.forEach(function(branch){
						var action;
						// 若已选中
						if(branch.selected){
							comboBranches.push(branch);
							// 若包含子分支
							if(branch.children){
								getSelectedBranchs(actions, branch.children, comboBranches);
							}
							// 否则最终组合
							else{
								action = {};
								comboBranches.forEach(function(b){
									action[b.name] = b.value; // 'actionName'
									action[b.name + '_zh'] = b.label;  // 'actionName_zh'
								});
								actions.push(action);
							}
						}
					});
				};
				//console.log(actions)
				return actions;
			},

			// 设置缺省事件为“任意事件的总次数”
			setDefaultActions: function(actions){
				// 若无选中事件，
				if(actions.length < 1){
					this.dataConfigs.forEach(function(dataConfig){
						var action = {},
							branch = dataConfig.children[0],
							firstChildBranch = branch.children[0];
						action[branch.name] = branch.value;
						action[firstChildBranch.name] = firstChildBranch.value;
						action[branch.name + '_zh'] = branch.label;
						action[firstChildBranch.name + '_zh'] = firstChildBranch.label;
						actions.push(action);
					});
				}
			},

			// 设置原始数据渲染
			setOriginalData: function(originalData){
			},

			// 获取数据树的选中项
			getDataConfigSelectedOptions: function(){

				var arr = [];

				this.dataConfigs.forEach(function(dataConfig){
					getSelectedOptions(arr, dataConfig.children);
				});

				function getSelectedOptions(arr, children){
					var parentBranches = _.slice(arguments, 2);
					children.forEach(function(branch){
						var children, pb, o;
						if(branch.selected){
							pb = parentBranches.concat(branch);
							if(children = branch.children){
								getSelectedOptions.apply(null, [arr, children].concat(pb));
							}
							else{
								o = {};
								pb.forEach(function(b){
									o[b.name] = b.value;
									o[b.name + '_zh'] = b.label;
								});
								arr.push(o);
							}
						}
					});
				};

				// 若无选中条件，缺省设置为“任意事件的总次数”
				if(arr.length < 1){
					this.dataConfigs.forEach(function(dataConfig){
						var o = {},
							branch = dataConfig.children[0],
							firstChildBranch = branch.children[0];
						o[branch.name] = branch.value;
						o[firstChildBranch.name] = firstChildBranch.value;
						o[branch.name + '_zh'] = branch.label;
						o[firstChildBranch.name + '_zh'] = firstChildBranch.label;
						arr.push(o);
					});
				}
				//console.log(arr[0]);
				return arr;
			}

		});

		return Condition;

	});