//
define([
		'dot',
		'AppPage',
		'AppPage/Utils/HTMLEscape'
	],
	function(dot,AppPage, HTMLEscape) {

		var document = window.document,
			HTML = document.documentElement;

		$.getAncestor = getAncestor;
		$.getRectCoord = getRectCoord;

		// 获取匹配的第一个祖先元素
		function getAncestor(elem, selector, includeSelf){
			includeSelf || (elem = elem.parentNode);
			while(elem && !$(elem).is(selector)){
				elem = elem.parentNode;
			}
			return elem;
		}

		// 获取元素页面坐标位置
		function getRectCoord(elem){
			var oy = window.pageYOffset - HTML.clientTop,
				ox = window.pageXOffset - HTML.clientLeft,
				rectCoord = elem.getBoundingClientRect();
			return {
				top: rectCoord.top - oy,
				right: rectCoord.right - ox,
				bottom: rectCoord.bottom - oy,
				left: rectCoord.left - ox,
				originalRectCoord: rectCoord
			}
		}

		// 类构造函数
		function DropdownPicker() {}

		// 原型
		DropdownPicker.prototype = _.create(EventEmitter.prototype, {
			'constructor': DropdownPicker
		});

		// 原型扩展
		_.extend(DropdownPicker.prototype, {

			root: null, // 下拉组件根元素
			trigger: null, // 触发下拉组件的元素
			doc: null, // 文档对象
			docRoot: null, // 文档根元素式
			rootClass: 'dropdown-picker',
			inputType: 'radio', // 列表单选多选
			listType: 'select-one', // 列表单选多选
			rootHTML: '',

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
				$(this.root).on('click mousedown', this.handleEvent);
			},

            // 初始化各部件
            initParts: function init(root) {
				// 依据role属性设置成员
				_.forEach(this.root.querySelectorAll('[role]'), function(elem){
					var role = elem.getAttribute('role');
					this[role] = elem;
				}, this);
            },

			// 创建根元素
			createRoot: function() {
				var $root = $(this.rootHTML || DropdownPicker.ROOT_HTML);
				return this.root = $root[0];
			},

			// 打开下拉列表
			open: function(trigger) {
				this.trigger = trigger;
				this.initTrigger();
				this.render();
                this.isOpened = EventEmitter.returnTrue;
				return this;
			},

			// 绘制渲染
			initTrigger: function() {
				var dataset = this.trigger.dataset;
				this.listType = dataset.type || this.listType;
				this.dataStructure = dataset.structure || this.dataStructure;
				this.setListType();
				this.parseDatasetList(dataset.list);
				//this.parseDatasetOn(dataset.on);
				$(this.trigger).off('change keydown', this.handleEvent).on('change keydown', this.handleEvent);
			},

			// 解析数据和定义
			setListType: function(){
				this.labelActivedClass = DropdownPicker.labelActivedClass;
				this.labelDisabledClass = DropdownPicker.labelDisabledClass;

				switch(this.listType){

					case 'input-select-one':
					case 'select-one':
						this.inputType = 'radio';
						this.labelCheckedClass = DropdownPicker.labelRadioCheckedClass;
					break;

					case 'select-multiple':
					case 'input-select-multiple':
						this.inputType = 'checkbox';
						this.labelCheckedClass = DropdownPicker.labelCheckboxCheckedClass;
					break;
				}
				this.initTriggerWrapper();
				this.labelCheckedActivedClass = this.labelCheckedClass + ' ' + this.labelActivedClass;
				this.labelCheckedActived$ = '.' + this.labelCheckedActivedClass.replace(/\s+/g, '.');
			},

			//多选框的包装元素
			triggerWrapper: null,

			// 多选框的包装元素选择器
			triggerWrapper$: '.dropdown-wrapper',

			// 初始化多选框的包装元素
			initTriggerWrapper: function(){
				this.triggerWrapper = getAncestor(this.trigger, DropdownPicker._dropdownWrapper$);
			},

			// 数据构造 tree|list
			dataStructure: 'list',

			// 获取数据的方式 $|data|ns|url
			dataGetWay: '$',

			// 选项列表数据
			datalist: null,

			// 数据键名
			dataKeys: { name: 'label', value: 'value' },

			// ajax响应结构的键名
			ajaxKeys: { success: 'success', data: 'dataObject' },

			// 解析数据和定义
			parseDatasetList: function(datasetList){
				var datasetListOpts = DropdownPicker.parseDatasetList(datasetList);
				datasetListOpts && $.extend(this, datasetListOpts);
			},

			// 解析事件并注册
			parseDatasetOn: function(datasetOn){
				// beforeInit:, init:, dataReady:, click:,
				var eventTypeNS = parseKeyValue(datasetOn);
				$.each(eventTypeNS, function(NS, eventType){
					var handleEvent = Object.ns(NS);
					if(handleEvent){
						this.on(eventType, handleEvent);
					}
				}.bind(this))
			},

			// 绘制渲染
			render: function() {
				this.renderList();
				this.renderRoot();
			},

			// 绘制渲染下拉列表
			renderList: function() {
				var trigger = this.trigger,
					datalistBeforeInit = trigger.getAttribute('data-list-before-init'),
					datalistInit;

				// 由定义的全局方法，在初始化列表前执行
				if (datalistBeforeInit && (datalistBeforeInit = Object.ns(datalistBeforeInit))) {
					datalistBeforeInit(this);
				}

				// 由定义的全局方法初始化列表
				datalistInit = trigger.getAttribute('data-list-init');
				if(datalistInit && (datalistInit = Object.ns(datalistInit))){
					datalistInit(this);
				}
				else{
					this.initList();
				}
			},

			// 根据数据源的定义，绘制渲染下拉列表
			initList: function() {

				if(this.datalist){
					// 判断数据获取方式
					switch(this.dataGetWay){

						// 通过内联解析数据
						// 数据选项的名称键
						// this.optionNameKey: 'label',
						// 数据选项的值键
						// this.optionValueKey: 'value',
						// demo: [{"label":"显示名称","value":"值"}]
						case 'data':
						this.datalist = JSON.parse(this.datalist);
						this.buildList(this.datalist);
						break;
						// 通过引用全局变量数据
						case 'ns':
						this.datalist = Object.ns(this.datalist);
						this.buildList(this.datalist);
						break;
						// 通过请求数据
						case 'url':
						this.ajaxBuildList(this.datalist);
						break;
						// 通过页面元素
						case '$':

						break;
					}
				}
				else{
				}
			},

			ajaxBuildListDefer: null,

			// 通过请求数据源创建下拉列表，并注册事件
			ajaxBuildList: function(url) {
				var that = this,
					trigger = this.trigger;

				this.ajaxBuildListDefer = AppPage.loadApi({
					url: url,
					type:'get',
                    dataType: 'json',
                    //crossDomain: true,
                    beforeSend: function () {
                        // 设置加载效果
                        $(that.dropdownList).addClass('data-loading');
                    },
                    complete: function (e) {
						var html,
							datalist,
							dataset,
							datalistFetched;

                        // 去除加载效果
                        $(that.dropdownList).removeClass('data-loading');

						switch(e.statusText.toLowerCase()){
							case 'ok':

					console.log(that.ajaxKeys.success);
							if(!e.responseJSON){
								// 请求数据失败
								html = $('<li class="request-failure"></li>');
								html.text(e.responseText);
								$(that.dropdownList).append(html);
							}
							// 请求数据成功
                        	else if (e.responseJSON[that.ajaxKeys.success]) {

								datalist = that.datalist = e.responseJSON[that.ajaxKeys.data];
								dataset = trigger.dataset;
								datalistFetched = dataset.listFetched;
								// 若已定义了已获取数据列表事件
								if(!(datalistFetched &&
									(datalistFetched = Object.ns(datalistFetched))) ||
									datalistFetched(that, datalist, url) !== false){

									dataset.list = 'data(' + JSON.stringify(datalist) + ')';
								}
								that.buildList(datalist);
                        	}
                        	else {
								// 请求数据失败
								html = $('<li class="request-failure"></li>');
								html.text(e.responseJSON.msg);
								$(that.dropdownList).append(html);
                        	}
							break;

							case 'abort':
							break;

							default:
							// 请求失败
							html = '<li class="request-error">' + e.statusText + '</li>';
							$(that.dropdownList).html(html);
						}
						delete that.ajaxBuildListDefer;
                    }
				});
			},

			// 创建下拉列表，并注册事件
			buildList: function(dataList) {
				$(this.dropdownList).html(this.buildListHtml(dataList));
			},

			//
			labelCheckedActivedClass: '',
			//
			labelCheckedActived$: '',

			// 获取模板函数
			getTmplFn: function(tmplName){
				return DropdownPicker.getTmplFn(tmplName);
			},

			// 构建下拉列表的HTML
			buildListHtml: function(dataList) {
				var trigger = this.trigger,
					triggerName = trigger.name,
					triggerValue,
					selectedValues,
					notChecked = true,
					checked = 'checked',
					liTmplFn = this.getTmplFn('liTmpl'),
					html;

				switch(this.listType){

					case 'select-one':
						triggerValue = trigger.value;
						break;
					case 'input-select-one':
					case 'select-multiple':
					case 'input-select-multiple':
						selectedValues = this.getSelectedValues();
					break;
				}

				html = dataList.map(function(option, i){
						var value = option[this.dataKeys.value] || option,
							label = option[this.dataKeys.name] || value,
							optionData = {
								type: this.inputType,
								name: triggerName,
								value: value,
								label: label,
								checked: '',
								labelClass: ''
							},
							index;

						switch(this.listType){

							case 'select-one':
								// 如：性别 ['男','女','未知']
//								if(value === label){
//									optionData.value = String(i);
//								}
								if(notChecked && triggerValue === optionData.value){
									notChecked = false;
									optionData.checked = checked;
									optionData.labelClass = this.labelCheckedActivedClass;
								}
							break;
							case 'input-select-one':
							case 'select-multiple':
							case 'input-select-multiple':
								optionData.multiple = true;
								index = selectedValues.indexOf(value);
								if(index > -1){
									selectedValues.splice(index, 1);
									optionData.checked = checked;
									optionData.labelClass = this.labelCheckedActivedClass;
								}
							break;
						}

						return liTmplFn(optionData);

					}, this).join('');

				return html;
			},

			// 获取多选框已选中项的集合（隐藏域）
			getSelectedInputs: function(){
				var selectedInputs = $('input[type=hidden]', this.triggerWrapper).toArray();
				return selectedInputs;
			},

			// 获取多选框已选中值的集合
			getSelectedValues: function(){
				var selectedValues = this.getSelectedInputs()
						.map(function(input){
							return input.value;
						});
				return selectedValues;
			},

			// 判断是否为选中项的值
			isSelectedValue: function(value){
				var index = this.getSelectedValues().indexOf(value);
				return index > -1;
			},

			// 绘制渲染
			renderRoot: function() {
				$(this.root).addClass(this.listType);
				document.body.appendChild(this.root);
				this.setPosition();
			},

			// 渲染调整下拉列表定位
			setPosition: function() {
				var that = this,
					body = document.body,
					bodyWidth = body.clientWidth,
					bodyHeight = body.clientHeight,
					triggerCoord = getRectCoord(this.trigger),
					offsetHeight = 1,
					offsetTop = 0,
					top = 'auto',
					right = 'auto',
					bottom = 'auto',
					left = 'auto',
					minWidth = (triggerCoord.right - triggerCoord.left) + 'px',
					rootCoord,
					rootHeight,
					rootWidth,
					dropdownListClientHeight = this.dropdownList.clientHeight,
					dropdownListScrollHeight = this.dropdownList.scrollHeight,
					dropdownListOffsetHeight = this.dropdownList.offsetHeight,
					dropdownListMaxHeight = dropdownListScrollHeight + 'px',
					diffHeight;

				$(this.root).css({
					minWidth: minWidth
				});

				rootCoord = getRectCoord(this.root);
				rootHeight = rootCoord.bottom - rootCoord.top;
				rootWidth = rootCoord.right - rootCoord.left;

				// 下拉框组件根元素和选项列表的高度差值，
				diffHeight = rootHeight - dropdownListOffsetHeight + 10;

				rootHeight = rootHeight + (dropdownListScrollHeight - dropdownListClientHeight);

				// 横向定位
				if (bodyWidth > triggerCoord.left + rootWidth) {
					left = triggerCoord.left + 'px';
				} else {
					left = (triggerCoord.right - rootWidth) + 'px';
				}

				// 纵向定位
				// 若下拉框可置于触发框下方
				if (bodyHeight > triggerCoord.bottom + (rootHeight + offsetHeight)) {//console.log('下方')
					top = (triggerCoord.bottom + offsetHeight) + 'px';
				}
				// 否则，若下拉框可置于触发框上方
				else if(triggerCoord.top > (rootHeight + offsetHeight)) {//console.log('上方')
					top = (triggerCoord.top - (rootHeight + offsetHeight)) + 'px';
				}
				else{
					// 若触发器到页面底部高度大于其到页面顶部距离
					if(bodyHeight - triggerCoord.bottom > triggerCoord.top){//console.log('置于下部')
						// 置于下部
						dropdownListMaxHeight = bodyHeight - triggerCoord.bottom - diffHeight + 'px';
						top = (triggerCoord.bottom + offsetHeight) + 'px';
					}
					else{//console.log('置于上部')
						// 置于上部
						dropdownListMaxHeight = triggerCoord.top - diffHeight + 'px';
						top = (triggerCoord.top - (rootHeight + offsetHeight) + (dropdownListScrollHeight - dropdownListClientHeight)) + 'px';
					}
				}

				$(this.root).css({
					top: top,
					right: right,
					bottom: bottom,
					left: left
				});

				$(this.dropdownList).css({
					maxHeight: dropdownListMaxHeight
				});

				this.isOpened() && $(this.root).addClass(this.openClass);

				this.setPositionTimeoutId = setTimeout((function(){
					this.setPosition();
				}).bind(this), 200);
			},

			// 位置设置定时器标识
			setPositionTimeoutId: null,

			// 清除位置设置定时器
			clearSetPositionTimeout: function() {
				clearTimeout(this.setPositionTimeoutId);
				delete this.setPositionTimeoutId;
			},

			// 事件函数统一路由
			handleEvent: function(e) {
				switch (e.type) {
					case 'click':
						this.click(e);
						break;
					case 'change':
						this.change(e);
						break;
					case 'keydown':
						this.keydown(e);
						break;
					case 'mousedown':
						//this.mousedown(e);
						break;
					default:
				}
			},

			// 鼠标在下拉框按下事件
			mousedown: function(e) {
				e.preventDefault();
			},

			// 触发器键按下事件
			keydown: function(e) {
				switch(this.listType){
					case 'select-multiple':
					case 'input-select-one':
					case 'input-select-multiple':
						this.removeSelectedOption(e);
					break;
				}
			},

			//
			removeSelectedOption: function(e){
				var $selectedOptions, selectedOption, value;
				if(e.keyCode === 8 && !e.target.value && ($selectedOptions = $(DropdownPicker._selectedOption$, this.triggerWrapper)).length){
					value = $selectedOptions.eq(-1).remove().find('input[type=hidden]').val();
					// 清除下拉选中项
					this.clearDropdownListOptionSelected(value);
					$(e.target).trigger('change');
				}
			},

			// 触发器修改值事件
			change: function(e) { //console.log('组件change');

				switch(this.listType){
					case 'input-select-one':
						this.changeSelectedOption(false);
						break;
					case 'input-select-multiple':
						this.changeSelectedOption(true);
					break;
				}
			},

			// 设置选中项
			// @multiple boolean 是否为多选项
			changeSelectedOption: function(multiple){
				var triggerValue = this.trigger.value.trim(),
					triggerLabel,
					triggerName,
					optionLabel,
					optionInput,
					some;

				if(triggerValue){

					triggerName = this.trigger.name;

					some = _.some(this.dropdownList.querySelectorAll('input[name=' + triggerName + ']'), function(input){
						var label = getAncestor(input, 'label');
						if($(label).text().trim() === triggerValue){
							optionLabel = label;
							optionInput = input;
							//$(input).trigger('click');
							return true;
						}
					}, this);

					triggerLabel = triggerValue;

					if(multiple){
						if(some){
						}
						else{
							this.addSelectedOption({name: triggerName, value: '', label: triggerLabel });
						}
						this.trigger.value = '';
					}
					else{
						if(some){
							triggerValue = optionInput.value;
						}
						else{
						}
						this.removeSelectedOptions();
						this.addSelectedOption({name: triggerName, value: triggerValue, label: triggerLabel });
					}
				}
				else{
					if(multiple){
					}
					else{
						this.removeSelectedOptions();
					}
				}
			},

			// 事件委托在选择器的根元素上
			click: function(e) {
				var target = e.target,
					dropdownListClick;

				if(this.isOpened() && $.contains(this.dropdownList, target)) {

					dropdownListClick = this.trigger.getAttribute('data-list-click');
					if(dropdownListClick && (dropdownListClick = Object.ns(dropdownListClick))){
						if(dropdownListClick(this, e) === false){
							return;
						}
					}
					this.dropdownListClick(e);
				}
			},

			// 点击下拉列表
			dropdownListClick: function(e) {

				var trigger = this.trigger,
					target = e.target,
					targetValue,
					labelTarget,
					targetLabel,
					selectedInputs;

				if($(target).is('.remove')){
					e.preventDefault();
					this.clearOptionSelected(target);
					$(trigger).trigger('change');
				}
				else if (target.tagName === 'INPUT') {
					targetValue = target.value;
					labelTarget = getAncestor(target, 'label');
					targetLabel = $(labelTarget).text();
					switch (target.type) {

						case 'radio':
							switch(this.listType){
								case 'select-one':
									if(trigger.value !== targetValue){
										trigger.value = targetValue;
										$('span', trigger).text(targetLabel);

										$(trigger).trigger('change');
									}
								break;
								case 'input-select-one':
									if(!this.isSelectedValue(targetValue)){
										trigger.value = targetLabel;

										$(this.labelCheckedActived$, this.dropdownList).removeClass(this.labelCheckedActivedClass);
										$(labelTarget).addClass(this.labelCheckedActivedClass);

										this.removeSelectedOptions();
										//this.setDropdownListOptionSelected(target);
										this.addSelectedOption({name: trigger.name, value: targetValue, label: targetLabel});

										$(trigger).trigger('change');
									}
								break;
							}
							this.close(e);
							return;

						case 'checkbox':
							//target.checked || (target.checked = true);
							if(target.checked){

								if(!this.isSelectedValue(targetValue)){
									trigger.value = '';
									this.setDropdownListOptionSelected(target);
									this.addSelectedOption({name: trigger.name, value: targetValue, label: targetLabel});
									$(trigger).trigger('change');
								}
							}
							else{
								this.clearOptionSelected(target);
								$(trigger).trigger('change');
							}
						break;
					}
				}
				$(trigger).trigger('focus');
			},

			// 设置下拉选中项
			setDropdownListOptionSelected: function(target){
				var label = getAncestor(target, 'label');
				$(label).addClass(this.labelCheckedActivedClass);
				//target.checked = true;
				//$(label).addClass(this.labelCheckedActivedClass).append('<i class="remove" title="取消选中"></i>');
			},

			// 删除下拉选中项
			removeSelectedOptions: function(){
				$(DropdownPicker._selectedOption$, this.triggerWrapper).remove();
			},

			// 清除下拉选中项
			clearOptionSelected: function(target){
				var label = getAncestor(target, 'label'),
					input = label.querySelector('input'),
					hiddenInput = this.triggerWrapper.querySelector('input[type="hidden"][value="' + input.value + '"]');

				//input.checked = false;
				$(label).removeClass(this.labelCheckedActivedClass);
				//$(target).remove();
				$(getAncestor(hiddenInput, DropdownPicker._selectedOption$)).remove();
			},

			// 清除下拉框选中项
			clearDropdownListOptionSelected: function(value){
				var input = value && this.dropdownList.querySelector('input[value="' + value + '"]'),
					label,
					removeBtn;

				if(input){
					input.checked = false;
					label = getAncestor(input, 'label');
					$(label).removeClass(this.labelCheckedActivedClass);
					//removeBtn = label.querySelector('.remove');
					//$(removeBtn).remove();
				}
			},

			// 多选框增加选中项（隐藏域）
			addSelectedOption: function(selectedData){
				var selectedOptionTmplFn = this.getTmplFn('selectedOptionTmpl'),
					selectedOptionHtml = selectedOptionTmplFn(selectedData);

				$(this.trigger).before(selectedOptionHtml);
			},

			// 打开下拉框样式
			openClass: 'open',

			// 判断实例是否打开
            isOpened: EventEmitter.returnFalse,

			// 关闭下拉列表
			close: function(e) {
				this.emit('close', e);
				this.reset();
			},

            // 重置
			reset: function(e) {
				if(this.ajaxBuildListDefer){
					this.ajaxBuildListDefer.abort();
					delete this.ajaxBuildListDefer;
				}
				$(this.trigger).off('change keydown', this.handleEvent);
				this.clearSetPositionTimeout();
				$(this.root)/*.detach()*/.removeClass([this.openClass, this.listType].join(' '));
				this.root.style.cssText = '';
				this.dropdownList.style.cssText = '';
				this.dropdownList.innerHTML = '';
				this.off();

				delete this.inputType;
				delete this.listType;
				delete this.trigger;
				delete this.triggerWrapper;
                delete this.isOpened;
				delete this.dataStructure;
				delete this.dataKeys;
				delete this.ajaxKeys;
			}

		});

		// DropdownPicker 静态方法、配置
		_.extend(DropdownPicker, {

			// 创建实例
			create: function(root, options) {
				return new DropdownPicker().init(root, options);
			},

			// 多选框的包装根元素选择器（存储数组）
			_arr_dropdownWrapper$: ['.dropdown-wrapper'],
			_dropdownWrapper$: '',

			// 可选可填控件的已选中项元素选择器（存储数组）
			_arr_selectedOption$: ['.selected-option'],
			_selectedOption$: '',

			// 触发器选择器（存储数组）
			_arr_trigger$: ['button[data-type^="select"]', 'input[data-type^="select"]', 'input[data-type^="input-select"]'],
			_trigger$: '',

			// 配置一个专用选择器及其存储
			set_$: function(name){
				var arr_name$ = '_arr_' + name + '$',
					name$ = '_' + name + '$';
				this[arr_name$] || (this[arr_name$] = []);
				this[name$] = this[arr_name$].join(',');
			},

			// 添加一个专用选择器
			add_$: function(name, $){
				var arr_name$ = '_arr_' + name + '$',
					arr$ = this[arr_name$] || (this[arr_name$] = []);
				if($ && typeof $ === 'string' && arr$.indexOf($) < 0){
					arr$.push($);
					this.set_$($);
				}
			},

			// 删除一个专用选择器
			remove_$: function(name, $){
				var arr_name$ = '_arr_' + name + '$',
					arr$ = this[arr_name$], i;
				if(arr$ && $ && typeof $ === 'string' && (i = arr$.indexOf($)) > -1){
					arr$.splice(i, 1);
					this.set_$();
				}
			},

			// 存储下拉实例（全局唯一的）
			_dropdownPicker: null,

			// 初始化配置日期选择触发器
			init: function() {
				if(this === DropdownPicker && !this._dropdownPicker){
					this.set_$('trigger');
					this.set_$('dropdownWrapper');
					this.set_$('selectedOption');
					this.handleEvent = this.handleEvent.bind(this);
					$(document).on('click mousedown focusin', this.handleEvent);
				}
			},

			handleEvent: function(e){
				this[e.type] && this[e.type](e);
			},

			// 文档按下事件
			mousedown: function(e) {
				var target = e.target,
					trigger$ = this._trigger$,
					dropdownPicker = this._dropdownPicker,
					trigger,
					root;

				// 若为触发器
				if(target.matches(trigger$)){
					// 若还未创建实例
					if(!dropdownPicker){
						dropdownPicker = this._dropdownPicker = this.create();
					}
					// 若不为当前触发器
					if(target !== dropdownPicker.trigger){

						if(e.type === 'mousedown'){
							$(target).trigger('focus');
						}
						else{
							dropdownPicker.trigger && dropdownPicker.close(e);
							dropdownPicker.open(target);
							$(document).on('focusout', this.handleEvent);
						}
					}
				}
				// 若实例已打开
				else if(dropdownPicker && dropdownPicker.isOpened()){

					if(e.type === 'mousedown'){

						// 若在匹配下拉框的包装元素范围内事件触发
						if((dropdownWrapper = getAncestor(target, this._dropdownWrapper$, true))
						&& $.contains(dropdownWrapper, dropdownPicker.trigger)){
							$(document).off('focusout', this.handleEvent);
						}
						else if(dropdownPicker.root === target || $.contains(dropdownPicker.root, target)){
							$(document).off('focusout', this.handleEvent);
						}
						else{
							$(document).on('focusout', this.handleEvent);
							$(dropdownPicker.trigger).trigger('blur');
							//dropdownPicker.close(e);
						}
					}
					else{
						//dropdownPicker.close(e);
					}
				}

			},

			// 文档聚焦事件
			focusin: function(e) {
				this.mousedown(e);
			},

			// 文档失焦事件
			focusout: function(e) {
				var dropdownPicker = this._dropdownPicker;
				// 若实例已打开，并且事件目标元素不为触发器
				if(dropdownPicker && dropdownPicker.isOpened() && e.target === dropdownPicker.trigger){
					dropdownPicker.close();
				}
				$(document).off('focusout', this.handleEvent);
			},

			// 文档点击事件
			click: function(e) {
				var target = e.target,
					dropdownPicker = this._dropdownPicker,
					selectedOption,
					dropdownWrapper,
					trigger,
					input;

				// 若在匹配下拉框的包装元素范围内事件触发
				if((dropdownWrapper = getAncestor(target, this._dropdownWrapper$, true))
				&& (trigger = dropdownWrapper.querySelector(this._trigger$))){

					// 若为选中项的删除按钮
					if($(target).is('.remove') && (selectedOption = getAncestor(target, this._selectedOption$))){
						// 若实例已打开，并且匹配触发器
						if(dropdownPicker && dropdownPicker.isOpened() && trigger === dropdownPicker.trigger){
							input = selectedOption.querySelector('input[type=hidden]');
							// 清除下拉选中项
							dropdownPicker.clearDropdownListOptionSelected(input.value);
						}
						// 删除已选中项的元素
						$(selectedOption).remove();
						$(trigger).trigger('change').trigger('focus');
					}
					else{
						$(trigger).trigger('focus');
					}
				}
			},

			//
			labelRadioCheckedClass: 'label-checked label-radio-checked',

			//
			labelCheckboxCheckedClass: 'label-checked label-checkbox-checked',

			//
			labelActivedClass: 'actived',

			// <label/>元素禁用
			labelDisabledClass: 'disabled',

			// 列表项的模板字符串
			liTmpl: '<li><label{{=it.labelClass?\' class="\'+it.labelClass+\'"\':""}}>'
					+ '<input type="{{=it.type}}" name="{{=it.name}}" value="{{=it.value}}" {{=it.checked?"checked":""}}/>'
					+ '<span>{{=it.label}}</span></label></li>',
					//+ '<span>{{=it.label}}</span>{{=it.multiple&&it.checked?\'<i class="remove" title="取消选中"></i>\':""}}</label></li>',

			// 列表项的模板函数
			liTmplFn: null,

			// 多选框选中项的模板字符串
			selectedOptionTmpl: '<span class="selected-option"><input type="hidden" name="{{=it.name}}" value="{{=it.value}}"/>{{=it.label}}<i class="remove" title="取消选项"></i></span>',

			// 多选框选中项的模板函数
			selectedOptionTmplFn: null,

			// data-list-on="init:,click:"
			// 下拉单选框模板字符串
			selecteOneTypeTmpl: '<div class="linkage-box"><button class="dropdown-select" name="{{=it.name}}" '
			+ 'data-list="{{=it.datasetList}}" '
			+ 'data-list-fetched="{{=it.datasetListFetched}}" '
			//+ 'data-name-key="{{=it.optionNameKey}}" '
			//+ 'data-value-key="{{=it.optionValueKey}}" '
			+ 'data-list-before-init="{{=it.dropdownBeforeInitList}}" '
			+ 'data-list-init="{{=it.dropdownInitList}}" '
			+ 'data-list-click="{{=it.dropdownListClick}}" '
			+ 'data-type="select-one" '
			+ 'value="{{=it.value}}"><span>{{=it.label}}</span></button></div>',

			// 下拉单选框模板函数
			selecteOneTypeTmplFn: null,

			// 下拉（可填可选框、多选框）模板字符串
			inputSelectTypeTmpl: '<div class="linkage-box dropdown-wrapper {{=it.dataType}}">'
			+ '{{=it.selectedOptionsHtml||""}}'
			+ '<input name="{{=it.name}}" value="" '
			+ 'data-list="{{=it.datasetList}}" '
			+ 'data-list-fetched="{{=it.datasetListFetched}}" '
			//+ 'data-name-key="{{=it.optionNameKey}}" '
			//+ 'data-value-key="{{=it.optionValueKey}}" '
			+ 'data-list-before-init="{{=it.dropdownBeforeInitList}}" '
			+ 'data-list-init="{{=it.dropdownInitList}}" '
			+ 'data-list-click="{{=it.dropdownListClick}}" '
			+ 'data-type="{{=it.dataType}}" '
			+ 'type="text" maxlength="20"></div>',

			// 下拉（可填可选框、多选框）模板函数
			inputSelectTypeTmplFn: null,

			// 通过模板名称获取相应的模板函数
			getTmplFn: function(tmplName) {
				var tmplFn = this[tmplName + 'Fn'],
					tmplStr,
					settings;

				if (tmplFn) return tmplFn;

				tmplStr = this[tmplName];
				settings = $.extend({}, dot.templateSettings, { strip: false });

				tmplFn = this[tmplName + 'Fn'] = dot.template(tmplStr, settings);
				return tmplFn;
			},

			// 多选框增加选中项（隐藏域）
			addSelectedOption: function(trigger, selectedData){
				var selectedOptionTmplFn = this._dropdownPicker.getTmplFn('selectedOptionTmpl'),
					selectedOptionHtml = selectedOptionTmplFn(selectedData);

				$(trigger).before(selectedOptionHtml);
			},

			// 多选框增加选中项（隐藏域）
			addSelectedOption: function(trigger, selectedData){
				this._dropdownPicker.addSelectedOption(selectedData);
			},

			// 将数据列表格式化并转义为HTML字符串
			stringifyHtml: function(dataList) {
				return dataList && typeof dataList === 'object' ? HTMLEscape.encodeEntityName(JSON.stringify(dataList)) : '';
			},

			// 下拉选择器的根元素
			ROOT_HTML: '<form class="dropdown-picker"><ul class="dropdown-list" role="dropdownList"></ul></form>',

			// 正则捕获触发器的 data-list 属性值
			RE_DATA_LIST: /^(data|url|ns)\((.+)\)$/,

			// data-list="list data({}) dataKeys(name:label,value:value) ajaxKeys(success:success,data:data)"
			// ["list data({}) dataKeys(name:label,value:value) ajaxKeys(success:success,data:data)", "list", "data", "{}", "name:label,value:value", "success:success,data:data"]
			RE_DATA_LIST:/^(?:(\w+)\s+)?(data|url|ns)\((.+?)\)(?:\s+dataKeys\(([^()]+)\))?(?:\s+ajaxKeys\(([^()]+)\))?$/,

			// data-list="list data(a) dataKeys(name) ajaxKeys(a)"
			buildDatasetList: function(opts){
				var arr = [ (opts.dataGetWay || '$') + '(' + opts.datalist + ')'];
					opts.dataStructure && arr.unshift(opts.dataStructure);
					opts.dataKeys && arr.push('datakeys(name:' + opts.dataKeys.name + ',value:' + opts.dataKeys.value + ')');
					opts.ajaxKeys && arr.push('ajaxKeys(success:' + opts.ajaxKeys.success + ',data:' + opts.ajaxKeys.data + ')');
				return arr.join(' ');
			},

			// 解析数据和定义
			parseDatasetList: function(datasetList){
				var execResult = DropdownPicker.RE_DATA_LIST.exec(datasetList),
					obj = null;console.log(execResult);
				if(execResult){
					obj = {};
					execResult[1] && (obj.dataStructure = execResult[1]);
					execResult[2] && (obj.dataGetWay = execResult[2]);
					execResult[3] && (obj.datalist = execResult[3]);
					execResult[4] && (obj.dataKeys = parseKeyValue(execResult[4]));
					execResult[5] && (obj.ajaxKeys = parseKeyValue(execResult[5]));
				}
				return obj;
			},

			parseKeyValue: parseKeyValue

		});

		function parseKeyValue(str){
				obj || (obj = {});

				str.split(/\s*,\s*/).forEach(function(kv){
					var i = kv.indexOf(':'),
						key, value;
					if(i > -1){
						key = kv.slice(0, i++).trim();
						value = kv.slice(i).trim();
						obj[key] = value;
					}
				});

				return obj;
			}


		// 定义到全局变量
		window.DropdownPicker = DropdownPicker;

		return DropdownPicker;

	});