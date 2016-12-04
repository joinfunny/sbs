// 
define([
	'AppPage/Widget/DOMDrag'
	],
	function(DOMDrag) {

		var HTML = document.documentElement;

		// 拖拽排序相关方法
		FilterDrag = {
			
			dragBtnItemClass: 'drag-btn-item',
			
			// 创建拖拽实例
			createDrag: function() {
				this.bind('dragHandleEvent');
				this.myDrag = DOMDrag.create(this.optionList, {
					limitRect: this.panelBody
					//xAxialEnabled: false
				});
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
				var myDrag = this.myDrag; // 即dragEvent.target
				
				//this.setWrapperMaxHeight();
				this.dragOption = $.getAncestor(myDrag.target, this.optionItem$);
				$(this.dragOption).addClass(this.dragBtnItemClass);
				this.dragOptionOriginalIndex = $(this.dragOption).index();
				
				myDrag.dragTarget = this.dragOption.cloneNode(true);
				this.doc.body.appendChild(myDrag.dragTarget);
				
				this.getOptionItemRectKits(this.dragOption);
				
				myDrag.originalRect = this.dragOption.getBoundingClientRect();
				//myDrag.limitRect = this.panelBody;
			},

			// 开始拖拽
			startdrag: function(dragEvent, domEvent) {
				
			},

			// 拖拽中
			dragging: function(dragEvent, domEvent) {
				this.compareInsertDragOption(domEvent);
			},

			// 目标元素放下
			drop: function(dragEvent, domEvent) {
				this.dropTodo(dragEvent, domEvent);
				
				//this.resetWrapperHeight();
				$(this.dragOption).removeClass(this.dragBtnItemClass);
				this.doc.body.removeChild(this.myDrag.dragTarget);
				delete this.dragOptionOriginalIndex;
				delete this.dropOptionIndex;
				delete this.dragOption;
				delete this.optionItemRectKits;
			},
			
			// 
			dropTodo: function(dragEvent, domEvent){
				this.dropOptionIndex = $(this.dragOption).index();
				if(this.dragOptionOriginalIndex !== this.dropOptionIndex){
					switch(this.filterType){
						case 'filterEvents':
							this.emit('filterEventsOrderChange');
						break;
						case 'filterAttrs':
							this.emit('filterAttrsOrderChange');
						break;
						case 'filterConditions':
							this.emit('filterConditionsOrderChange');
						break;
					}
					this.emit('orderChange');
				}
			},
			
			// 比较筛选条件坐标并插入元素
			compareInsertDragOption: function(e){
				this.compareInsertOption(e, this.dragOption);
			}
		};

		return FilterDrag;

	});