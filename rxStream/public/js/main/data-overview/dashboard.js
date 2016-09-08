/*
（1）拖动某元素时，该阶段会依次触发下列事件（该阶段的事件目标--即target或srcElement都是这个被拖动元素）：　　
	1>dragstart——鼠标移入目标元素并且按下左键触发。
	2>drag——dragstart触发后移动鼠标连续触发该事件（类似mousemove事件）
	3>dragend——拖动停止时触发（无论此时拖动元素在有效位置还是无效位置）。

（2）当元素被拖动到一个有效的放置目标上时，触发下列事件（该阶段的事件目标--即target或srcElement都是这个目标元素）：
	1>dragenter——只要有元素被拖动到放置目标上，就触发dragenter事件（类似mouseover）
	2>dragover——触发dragenter后在有效目标范围内移动时连续触发该事件
	3>dragleave——被拖动元素从目标范围内被拖出到目标范围外时触发
	4>drop——被拖动元素被放到了目标范围内（即在有效目标范围内松口鼠标左键）
	
	注意：这里dragleave和drop二者只能触发其一！
*/

// 
define([
		'jQcss3'
	],
	function(css3) {
		'use strict';

		var document = window.document;
		var HTML = document.documentElement;
		var transitionends = css3.EventTypes.transitionend;
		var transitionCss = 'all .38s ease-out 0s';
		var tanslate3d0Css = 'translate3d(0px,0px,0px)';
		
		// 筛除一个包含的元素
		_.exclude = function exclude(collections, elem) {
			var that = collections,
				l = that.length,
				i = 0,
				arr = [];

			for (; i < l; i++) {
				if (i in that && that[i] !== elem) {
					arr.push(that[i]);
				}
			}
			return arr;
		}

		// 筛除一组包含的元素
		_.excludes = function exclude(collections) {
			var that = collections,
				l = that.length,
				i = 0,
				arr = [],
				args = _.toArray(arguments).slice(1),
				L = args.length,
				j = 0;

			outer: for (; i < l; i++) {
				if (i in that) {
					inner: for (j = 0; j < L; j++) {
						if (that[i] === args[j]) {
							continue outer;
						}
					}
					arr.push(that[i]);
				}
			}
			return arr;
		}

		// 从自身向上查找，获取匹配的某个祖先元素（包含自身）
		function getIAncestor(target, selector, root) {
			root || (root = document)
			while (target && target !== root) {
				if (target.matches(selector)) {
					return target;
				}
				target = target.parentNode;
			}
			return null;
		}
		
		// 类构造函数
		function Dashboard() {}

		// 原型
		Dashboard.prototype = _.create(EventEmitter.prototype, {
			'constructor': Dashboard
		});

		// 原型扩展
		_.extend(Dashboard.prototype, {

			root: null,
			
			// 标识已开始拖拽
			dragStarted: false,

			// 可拖拽的widget元素的父元素
			fromWidgetWrapper: null,

			// 可拖拽的widget元素的占位蒙层
			placeholderMask: null,

			// 可拖拽的widget元素
			fromWidget: null,

			// 拖拽到的目标widget元素
			toWidget: null,

			// 所有widget可拖拽的元素集
			allWidgets: null,

			// 所有未触发widget可拖拽的元素集
			otherWidgets: null,

			// 触发widget可拖拽的元素
			dragableTrigger: null,

			// widget可拖拽时父元素样式类
			fromWidgetWrapperClass: 'dragstart-sortable',

			// widget父元素选择器（包装）
			widgetWrapperSelector: '.dashboard-widget-wrapper',

			// 可拖拽的widget元素选择器
			widgetSelector: '.dashboard-widget',

			// 触发widget可拖拽的元素选择器
			dragableTriggerSelector: '.dashboard-widget-header',

			// 占位蒙层选择器（相对于widget父元素）
			placeholderMaskSelector: '.placeholder-mask',

			// 获取触发widget可拖拽的元素
			getDragableTrigger: function getDragableTrigger(target) {
				return this.dragableTrigger = getIAncestor(target, this.dragableTriggerSelector, this.root);
			},

			// 获取触发的可拖拽的widget元素
			getFromWidget: function getFromWidget(target) {
				return this.fromWidget = getIAncestor(target, this.widgetSelector, this.root);
			},

			// 获取widget父元素（包装）
			getFromWidgetWrapper: function getFromWidgetWrapper(target) {
				return this.fromWidgetWrapper = getIAncestor(target || this.fromWidget, this.widgetWrapperSelector, this.root);
			},

			// 获取拖拽到的widget父元素（包装）
			getToWidgetWrapper: function getToWidgetWrapper(target) {
				return this.toWidgetWrapper = getIAncestor(target || this.toWidget, this.widgetWrapperSelector, this.root);
			},

			// 获取占位蒙层
			getPlaceholderMask: function getPlaceholderMask() {
				return this.placeholderMask = this.fromWidgetWrapper.querySelector(this.placeholderMaskSelector);
			},

			// 获取widget集合（数组）
			getOtherWidgets: function getOtherWidgets(target) {
				this.allWidgets = _.toArray(this.root.querySelectorAll(this.allWidgetselector));
				return this.otherWidgets = _.exclude(this.allWidgets, target || this.fromWidget);
			},

			// 获取widget集合（数组）
			getAllWidgets: function getAllWidgets() {
				return this.allWidgets = _.toArray(this.root.querySelectorAll(this.widgetSelector));
			},

			// 初始化
			init: function init(root, options) {
				this.root = $(root)[0] || HTML;
				this.bindHandleEvent();
				$(this.root).on('mousedown', this.handleEvent);
				$([this.root].concat(this.getAllWidgets())).on('dragenter dragover', this.handleEvent);
				return this;
			},

			// 事件函数统一路由
			handleEvent: function(e) {
				var type;
				switch (e.type) {
					case 'mousedown':
						this.mousedown(e);
						break;
					case 'dragstart':
						this.dragstart(e);
						break;
					case 'drag':
						this.drag(e);
						break;
					case 'dragend':
						this.dragend(e);
						break;
					case 'dragenter':
						this.dragenter(e);
						break;
					case 'dragover':
						this.dragover(e);
						break;
					case 'dragleave':
						this.dragleave(e);
						break;
					case 'drop':
						this.drop(e);
						break;
					default:
						type = e.type.toLowerCase();
						if(type.indexOf('transitionend') > -1){
							e.w3ctype = 'transitionend';
							this.transitionend(e);
						}
						else if(type.indexOf('transitionstart') > -1){
							e.w3ctype = 'transitionstart';
							this.transitionstart(e);
						}
				}
			},

			// 文档中鼠标按下
			mousedown: function mousedown(e) {
				var target = e.target;
				if (this.getDragableTrigger(target)) {
					if (this.getFromWidget(this.dragableTrigger)) {
						this.fromWidget.draggable = true;
						$(this.fromWidget).on('dragstart', this.handleEvent);
					}
				}
			},

			// 开始拖动
			dragstart: function dragstart(e) {
				this.setEventEffect(e);
				var currentTarget = this.fromWidget = e.currentTarget;
				
				//console.log(e.originalEvent);
				//e.originalEvent.dataTransfer.setDragImage(this,0,0);
				//console.log(e.originalEvent.dataTransfer);
				//console.log(e.originalEvent);
				//oe.dataTransfer.setDragImage(currentTarget, oe.offsetX, oe.offsetY);
				
				this.afterDragstart();
			},

			// 开始拖动后延时渲染
			afterDragstart: function afterDragstart() {
				var that = this;
				setTimeout(function(){
					$(that.fromWidget).on('dragend', that.handleEvent);
					$(that.getFromWidgetWrapper()).addClass(that.fromWidgetWrapperClass);
					//this.getPlaceholderMask();
					that.dragStarted = true;
				})
			},
			
			// 设置拖拽事件的效果
			setEventEffect: function setEventEffect(e){
				var oe = e.originalEvent || e;
				switch(e.type){
					case 'dragstart':
						oe.dataTransfer.dropEffect = "move";
						break;
					case 'dragenter':
					case 'dragover':
						e.preventDefault();
            			oe.dataTransfer.effectAllowed = "move";
						break;
				}
			},

			// 拖动过程中
			drag: function drag(e) {},

			// 拖动结束
			dragend: function dragend(e) {
				this.reset(e);
			},

			// 鼠标进入拖拽到的元素
			dragenter: function dragenter(e) {
				this.setEventEffect(e);
				var currentTarget = e.currentTarget;
				if(currentTarget !== this.root){
					if(currentTarget !== this.fromWidget){
						this.toWidget = currentTarget;
						this.getToWidgetWrapper(currentTarget);
						this.sort(e);
					}
					else{}
				}
			},

			// 鼠标在拖拽到的元素上移动
			dragover: function dragover(e) {
				this.setEventEffect(e); 
			},

			// 鼠标离开拖拽到的元素
			dragleave: function dragleave(e) {},

			// 鼠标在拖拽到的元素上松开
			drop: function drop(e) {
				//this.reset(e);
			},

			// 重置
			reset: function reset(e) {
				var currentTarget = e.currentTarget;
				$(this.fromWidget).css('transform', tanslate3d0Css);
				$(this.fromWidgetWrapper).removeClass(this.fromWidgetWrapperClass);
				$(this.fromWidget).off('dragstart dragend', this.handleEvent);
				this.fromWidget.dragable = false;
				
				delete this.fromWidget;
				delete this.toWidget;
				delete this.fromWidgetWrapper;
				delete this.toWidgetWrapper;
				delete this.dragableTrigger;
				delete this.otherWidgets;
				//delete this.placeholderMask;
			},


			// 立即对widgets排序（当鼠标进入拖拽到的元素）
			sort: function sort(e) {
				var fromRect, toRect, fromLeft, fromTop, toLeft, toTop, fromTanslate3dCss, toTanslate3dCss;
				
				fromRect = this.fromWidget.getBoundingClientRect();
				this.fromLeft = fromRect.left;
				this.fromTop = fromRect.top;
				
				toRect = this.toWidget.getBoundingClientRect();
				this.toLeft = toRect.left;
				this.toTop = toRect.top;

				// 拖拽父元素排在之前
				if (this.fromWidgetWrapper.compareDocumentPosition(this.toWidgetWrapper) == 4) {
					$(this.toWidgetWrapper).after(this.fromWidgetWrapper);
				}
				// 排在之后
				else {
					$(this.toWidgetWrapper).before(this.fromWidgetWrapper);
				}
				
				fromRect = this.fromWidget.getBoundingClientRect();
				fromLeft = fromRect.left;
				fromTop = fromRect.top;
				toRect = this.toWidget.getBoundingClientRect();
				toLeft = toRect.left;
				toTop = toRect.top;
				
				fromTanslate3dCss = css3.tanslate3d2Css(this.fromLeft - fromRect.left, this.fromTop - fromRect.top);
				//console.log(fromTanslate3dCss)
				$(this.fromWidget).css('transform', fromTanslate3dCss);
				 console.log(this.fromWidget.style.cssText)
				toTanslate3dCss = css3.tanslate3d2Css(this.toLeft - toRect.left, this.toTop - toRect.top);
				//console.log(toTanslate3dCss)
				$(this.toWidget).css('transform', toTanslate3dCss);
				
				var that = this;
				
				clearTimeout(this.sortTimeoutId);
				delete this.sortTimeoutId;
				
				this.sortTimeoutId = setTimeout(function(){
					
					$([that.fromWidget, that.toWidget])
					.on('transitionend', that.handleEvent)
					.css('transition', transitionCss)
					.css('transform', tanslate3d0Css);
				});

			},
			
			sortTimeoutId: null,
			
			transitionend: function(e){
				if(e.target === e.currentTarget){
					$(e.currentTarget)
					.off('transitionend', this.handleEvent)
					.css('transition', 'none');
				}
			},
			
			transitionstart: function(e){
				if(e.target === e.currentTarget){
					//console.log(e.w3ctype)
					$(e.currentTarget)
					.off('transitionstart', this.handleEvent)
					.css('transition', 'none');
				}
			}

		});

		// 静态扩展
		_.extend(Dashboard, {
			create: function create(root, options) {
				return new Dashboard().init(root, options);
			}
		});


		//
		var exports = this;

		// Expose the class either via AMD, CommonJS or the global object
		if (typeof define === 'function' && define.amd) {
			define(function() {
				return Dashboard;
			});
		} else if (typeof module === 'object' && module.exports) {
			module.exports = Dashboard;
		} else {
			exports.Dashboard = Dashboard;
		}

		return Dashboard;

	});