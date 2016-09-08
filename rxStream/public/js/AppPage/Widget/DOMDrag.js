// 
define([
	],
	function() {

		var document = window.document,
			HTML = document.documentElement,
			extend = EventEmitter.extend,
			rSpaces = EventEmitter.rSpaces,
			addEvent = eventListener('add'),
			removeEvent = eventListener('remove'),
			matches = HTML.matches ? function matches(elem, selector){ return elem.matches(selector) } :
			HTML.matchesSelector ? function matchesSelector(elem, selector){ return elem.matchesSelector(selector) } :
			HTML.webkitMatchesSelector ? function webkitMatchesSelector(elem, selector){ return elem.webkitMatchesSelector(selector) } :
			HTML.mozMatchesSelector ? function mozMatchesSelector(elem, selector){ return elem.mozMatchesSelector(selector) } :
			HTML.msMatchesSelector ? function msMatchesSelector(elem, selector){ return elem.msMatchesSelector(selector) } :
			function matches(elem, selector){
				var parent = elem.parentNode,
					elems, l;
				if(parent){
					elems = parent.querySelectorAll(selector);
					if(l = elems.lenght){
						while(l--){
							if(elems[l] === elem) return true;
						}
					}
					return false;
				}
				else{
					parent = document.createElement('div');
					parent.appendChild(elem);
					return parent.querySelector(selector) === parent.removeChild(elem);
				}
			};

		function eventListener(sHandle, useCapture) {
			sHandle += 'EventListener';
			useCapture = !!useCapture;
			return function(element, eventType, handleEvent, useCapture){
				eventType.split(rSpaces).forEach(function(eventType) {
					element[sHandle](eventType, handleEvent, useCapture);
				})
			}
		}

		// 类构造函数
		function DOMDrag() {};
		
		// 继承给指定类
		EventEmitter.inherito(DOMDrag, {
			
			// 动态属性
			eOriginalX: 0, // 鼠标拖拽起点x坐标
			eOriginalY: 0, // 鼠标拖拽起点y坐标
			eMoveX: 0, // 鼠标移动点与拖拽起点x坐标差
			eMoveY: 0, // 鼠标移动点与拖拽起点y坐标差
			target: null, // 触发拖拽的目标元素
			dragTarget: null, // 拖拽目标元素（默认为target，可在'beforedrag'事件里自定义替换）
			dragTargetStyle: null, // 拖拽目标元素style属性
			targetOriginalRect: null, // 目标元素原始矩形区域
			dragTargetOriginalRect: null, // 拖拽元素原始矩形区域
			dragTargetOriginalLeft: 0, // 拖拽元素起点left坐标
			dragTargetOriginalTop: 0, // 拖拽元素起点top坐标
			dragTargetLeft: 0, // 拖拽元素实时left坐标
			dragTargetTop: 0, // 拖拽元素实时top坐标
			dragTargetMoveX: 0, // 被拖拽目标元素的x向移动距离
			dragTargetMoveY: 0, // 被拖拽目标元素的y向移动距离
			limitMove: null, // 拖拽距离限制值范围（与limitRect对应dragTarget的rect计算出自动）
			
			// 以下为设置属性
			xAxialEnabled: true, // x轴向可移动
			yAxialEnabled: true, // y轴向可移动
			eStartDragOffsetX: 0, // 定义鼠标x坐标偏移量大于该值时开始拖拽
			eStartDragOffsetY: 0, // 定义鼠标y坐标偏移量大于该值时开始拖拽
			limitRect: null, // 被拖拽目标元素的限制范围
			root: null, // 检索是否包含拖拽目标元素的委托元素
			doc: null, // 文档对象
			docRoot: null, // 文档根元素
			
			dragTargetClass: 'dom-drag-target',
			draggingDocRootClass: 'dom-dragging', // 拖拽时文档根元素附加的样式
			dragable$: '.dom-dragable', // 匹配拖拽目标元素的样式选择器
			dragableClass: 'dom-dragable', // 拖拽目标元素的样式类
			dragdisable$: '.dom-dragdisable', // 匹配取消拖拽目标源元素的样式选择器
			dragdisableClass: 'dom-dragdisable', // 取消拖拽目标源元素的样式
			draggingPageMaskClass: 'dom-dragging-mask', // 拖拽时创建插入一个元素遮盖页面的样式

			// 初始化
			init: function init(root, options) {
				options && extend(this, options);
				//this.bindHandleEvent();
				this.initRoot(root);
				this.render();
				return this;
			},

			// 设置委托元素
			initRoot: function(root) {
				this.root = root ? typeof root === 'string' ? document.querySelector(root) || document :
					root.nodeType ? root : document : document;
				this.doc = document;
				this.docRoot = HTML;
				addEvent(this.root, 'mousedown', this);
			},

			render: function() {},

			// 事件函数统一路由
			handleEvent: function(e) {
				switch (e.type) {
					case 'mousedown':
						this.mousedown(e);
						break;
					case 'mousemove':
						this.mousemove(e);
						break;
					case 'mouseup':
						this.mouseup(e);
						break;
					default:
				}
			},

			// 事件委托在初始化的根元素上
			mousedown: function(e) {
				if (this.getDragTarget(e.target)) {
					this.captureEvents();
					this.initDrag(e);
				}
			},

			// 文档注册事件
			mousemove: function(e) {
				this.move(e);
			},

			// 文档注册事件
			mouseup: function(e) {
				this.drop(e);
				this.releaseEvents();
			},

			// 获取拖拽目标元素
			getDragTarget: function(target) {
				
				var dragTarget = target;
				
				if(!this.dragdisable$){
					this.target = target;
					return this.dragTarget = this.root;
				}

				do {
					if (matches(dragTarget, this.dragdisable$)) {
						return ;
					}
					if (matches(dragTarget, this.dragable$)) {
						this.target = target;
						return this.dragTarget = dragTarget;
					}
				}
				while (dragTarget !== this.root && (dragTarget = dragTarget.parentNode));
			},

			// 获取遮罩元素
			getMaskLayer: function(setClass) {
				if (!DOMDrag._maskLayer) {
					DOMDrag._maskLayer = this.doc.createElement('div');
					setClass = true;
				}
				if (setClass) {
					DOMDrag._maskLayer.className = this.draggingPageMaskClass;
				}
				return DOMDrag._maskLayer;
			},

			// 遮罩页面
			maskPage: function() {
				this.doc.body.appendChild(this.getMaskLayer(true));
			},

			// 撤销遮罩页面
			unmaskPage: function() {
				this.doc.body.removeChild(this.getMaskLayer());
			},

			// 初始化拖拽
			initDrag: function(e) {
				var currentStyle,
					top,
					left, 
					limitRect, 
					limitMove,
					originalRect;
					
				this.DOMEvent = e;
				
				this.emit('beforedrag', e);
				
				this.eOriginalX = e.screenX;
				this.eOriginalY = e.screenY;
				
				this.docRoot.classList.add(this.draggingDocRootClass);
				
				if(this.dragTarget){
					
					this.dragTarget.classList.add(this.dragTargetClass);
					this.dragTargetStyle = this.dragTarget.style;
					this.dragTargetOriginalRect = this.targetOriginalRect = this.target.getBoundingClientRect();
					
					if(this.target !== this.dragTarget){
						
						currentStyle = getComputedStyle(this.dragTarget);
						top = parseInt(currentStyle.top) || 0;
						left = parseInt(currentStyle.left) || 0;
					
						this.dragTargetOriginalRect = this.dragTarget.getBoundingClientRect();
					
						this.dragTargetStyle.top = (this.dragTargetOriginalTop = this.targetOriginalRect.top - this.dragTargetOriginalRect.top + top) + 'px';
						this.dragTargetStyle.left = (this.dragTargetOriginalLeft = this.targetOriginalRect.left - this.dragTargetOriginalRect.left + left) + 'px';
					
						this.dragTargetOriginalRect = this.dragTarget.getBoundingClientRect();
					}
				}
				
				this.initLimitRect();
				this.maskPage();
				addEvent(this.doc, 'mousemove mouseup', this);
			},

			// 鼠标移动
			move: function(e) {
				if (Math.abs(e.screenX - this.eOriginalX) > this.eStartDragOffsetX || Math.abs(e.screenY - this.eOriginalY) > this.eStartDragOffsetY) {
					this.startdrag(e);
				}
			},

			// 开始拖拽事件
			startdrag: function(e) {
				this.DOMEvent = e;
				this.emit('startdrag', e);
				this.move = this.dragging; // 方法move切换到dragging
				this.move(e);
			},

			// 拖拽中
			dragging: function(e) {
				var moveX = this.eMoveX = e.screenX - this.eOriginalX,
					moveY = this.eMoveY = e.screenY - this.eOriginalY,
					limitRect,
					limitMoveLeft,
					limitMoveRight,
					limitMoveTop,
					limitMoveBottom;
					
				if(this.dragTargetStyle){
					limitRect = this.getLimitRect();
					// x轴向可移动
					if(this.xAxialEnabled){
						if(limitRect){
							moveX = moveX < (limitMoveLeft = limitRect.left - this.dragTargetOriginalRect.left) ? limitMoveLeft : 
								moveX > (limitMoveRight = limitRect.right - this.dragTargetOriginalRect.right) ? limitMoveRight : moveX;
						}
						this.dragTargetLeft = this.dragTargetStyle.left = this.dragTargetOriginalLeft + (this.dragTargetMoveX = moveX) + 'px';
					}
					// y轴向可移动
					if(this.yAxialEnabled){
						if(limitRect){
							moveY = moveY < (limitMoveTop = limitRect.top - this.dragTargetOriginalRect.top)  ? limitMoveTop : 
								moveY > (limitMoveBottom = limitRect.bottom - this.dragTargetOriginalRect.bottom) ? limitMoveBottom : moveY;
						}
						this.dragTargetTop = this.dragTargetStyle.top = this.dragTargetOriginalTop + (this.dragTargetMoveY = moveY) + 'px';
					}
				}
				this.DOMEvent = e;
				this.emit('dragging', e);
			},

			// 鼠标松开
			drop: function(e) {
				this.DOMEvent = e;
				this.emit('drop', e);
				removeEvent(this.doc, 'mousemove mouseup', this);
				if(this.dragTarget){
					this.dragTarget.classList.remove(this.dragTargetClass);
				}
				this.docRoot.classList.remove(this.draggingDocRootClass);
				this.unmaskPage();
				this.reset();
			},

			// 重置所有属性
			reset: function(e) {
				delete this.DOMEvent;
				delete this.move;
				delete this.getLimitRect;
				
				delete this.eOriginalX;
				delete this.eOriginalY;
				delete this.eMoveX;
				delete this.eMoveY;
				delete this.target;
				delete this.dragTarget;
				delete this.dragTargetStyle;
				delete this.targetOriginalRect;
				delete this.dragTargetOriginalRect;
				delete this.dragTargetOriginalLeft;
				delete this.dragTargetOriginalTop;
				delete this.dragTargetLeft;
				delete this.dragTargetTop;
				delete this.dragTargetMoveX;
				delete this.dragTargetMoveY;
				delete this.limitMove;
			},

			// 初始化拖拽限制区域
			initLimitRect: function() {
				if(this.limitRect){
					if(typeof this.limitRect === 'function'){
						this.getLimitRect = this.limitRect;
					}
					else if(this.limitRect.nodeType === 1){
						this.getLimitRect = this.getElementLimitRect;
					}
				}
			},

			// 获取拖拽限制区域矩形范围
			getLimitRect: function() {
				//this.limitRect && this.getLimitMove();
				return this.limitRect;
			},

			// 获取拖拽限制在某个元素的区域矩形范围 
			getElementLimitRect: function() {
				return this.limitRect.getBoundingClientRect();
			},
			
			// 
			getLimitMove: function() {			
				this.limitMove = {};
				// x轴向可移动
				if(this.xAxialEnabled){
					this.limitMove.right = this.limitRect.right - this.dragTargetOriginalRect.right;
					limitMove.left = this.limitRect.left - this.dragTargetOriginalRect.left;
				}
				// y轴向可移动
				if(this.yAxialEnabled){
					limitMove.top = this.limitRect.top - this.dragTargetOriginalRect.top;
					limitMove.bottom = this.limitRect.bottom - this.dragTargetOriginalRect.bottom;
				}
			},

			// 检测鼠标是否在某个矩形范围内（相对于视口view，不是page）
			isEnterRect: function(rect) {
				return DOMDrag.isEnterRect(rect, this.DOMEvent.clientX, this.DOMEvent.clientY);
			},

			// 捕获事件
			captureEvents: document.setCapture ? function() {
				this.doc.setCapture();
			}
			: function() {
				window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
			},

			// 释放事件
			releaseEvents: document.releaseCapture ? function() {
				this.doc.releaseCapture();
			}
			: function() {
				window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
			}
		});

		// 静态成员
		extend(DOMDrag, {
			// 
			create: function(root, options) {
				return new DOMDrag().init(root, options);
			},
			
			// 检测一个坐标点x, y是否在某个矩形范围内
			// @rect {object|DOMElement}
			isEnterRect: function(rect, x, y) {
				x || (x = 0);
				y || (y = 0);
				rect.nodeType === 1 && (rect = element.getBoundingClientRect());
				return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
			}
		});
		
		return DOMDrag;

	});