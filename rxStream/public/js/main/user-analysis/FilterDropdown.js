// 
define([
	],
	function() {

		var HTML = document.documentElement;

		// 下拉列表相关方法
		var FilterDropdown = {

			// 处理下拉选项事件路由
			dropdownHandleEvent: function(e) {
				switch (e.type) {
					case 'mouseenter':
						this.dropdownSublistMouseenter(e);
						break;
					case 'mouseleave':
						this.dropdownSublistMouseleave(e);
						break;
//					case 'mousedown':
//						this.dropdownListMousedown(e);
//						break;
					case 'close': // dropdownPicker close 事件
						this.dropdownClose(e);
						break;
				}
			},
			
			dropdownPicker: null,
			
			// 下拉框关闭事件
			dropdownClose: function(e) {
				$(this.dropdownPicker.dropdownList)
					.find('.dropdown-sublist')
					.off('mouseenter', this.dropdownHandleEvent);
				delete this.dropdownPicker;
			},
			
			// 创建下拉列表
			dropdownInitList: function(dropdownPicker) {
				var isTree = dropdownPicker.dataStructure === 'tree',
					trigger = dropdownPicker.trigger,
					bid = trigger.dataset.bid,
					dropdownSelect = trigger,
					subitemSelect = $(dropdownSelect).next('.dropdown-subitem')[0],
					subitemBid = subitemSelect && subitemSelect.dataset.bid,
					value = trigger.value,
					dataConfigKit = this.getDataConfigKitByBid(bid),
					dataConfig = dataConfigKit.dataConfig,
					branch = dataConfigKit.branch,
					branches = branch.parent.children,
					liSublistClass = ' class="dropdown-sublist"',
					labelCheckedClass = ' class="label-checked"',
					labelCheckedActivedClass = ' class="label-checked actived"',
					labelCheckedDisabledClass = ' class="label-checked disabled"',
					labelCheckedDisabledActivedClass = ' class="label-checked disabled actived"',
					checked = ' checked',
					disabled = ' checked disabled',
					html = buildListHtml(branches);
					
				switch(dropdownPicker.dataStructure ){
					case 'tree':
						$(dropdownPicker.root).addClass('data-structure-tree');
					break;
				}
				
				$(dropdownPicker.dropdownList)
					.html(html)
					.find('.dropdown-sublist')
					.on('mouseenter', this.dropdownHandleEvent);
				this.dropdownPicker = dropdownPicker;
				
				dropdownPicker.on('close', this.dropdownHandleEvent);

				return html;


				// 构建下拉列表的HTML
				function buildListHtml(branches) {
					
//					branches = JSON.parse(JSON.stringify(branches));
//					branches.forEach(function(action, i, thisArr){
//						var actionName = action.value,
//							arrActionAttr = this[actionName];
//						if(arrActionAttr && action.children){
//							action.children = action.children.filter(function(actionChild){
//								if(!actionChild.children){
//									return true;
//								}
//								else{
//									if(this[actionChild.value]){
//										return true;
//									}
//									else{
//										return false;
//									}
//								}
//							}, arrActionAttr);
//						}
//					}, schema || AppPage.UserAnalysis.getConditionActionsSchema());
					
					return branches.map(function(b, i) {
						
						var children = b.children,
							dataType = b.dataType || b.childrenDataType,
							sublistClass = children ? !isTree ? '' : liSublistClass : '',
							selected = b.selected,
							childrenAllSelected = selected && (!children || children.every(isSelected)),
							isBidEqual = bid === b.bid || (!!subitemBid && subitemBid === b.bid),
							checkedDisabled = selected ? isBidEqual ? checked : childrenAllSelected ? disabled : checked : '',

							inputHtml = '<input type="radio" data-bid="' + b.bid + '" data-bname="' + b.bname + '" name="' + b.name + '" value="' + b.value + '"' + checkedDisabled + '>',
							subListHtml = children ? !isTree ? '' : '<ul class="dropdown-list">' + buildListHtml(children) + '</ul>' : '',
							//selectedChildBranch = children
							labelClass = isBidEqual ? labelCheckedActivedClass : childrenAllSelected ? labelCheckedDisabledClass : selected ? labelCheckedClass : '';
						
						return [
							'<li' + sublistClass + '><label' + labelClass + '>',
							inputHtml,
							'<span>' + b.label + '</span>',
							'</label>',
							subListHtml,
							'</li>'
						].join('');

					}).join('');

				};

				// 已选中
				function isSelected(b) {
					return b.selected;
				}
			},

			// 点击下拉列表
			dropdownListClick: function(dropdownPicker, e) {
				
				var target = e.target,
					input,
					inputDataset,
					inputBid,
					parentBranchInput,
					parentBranchInputDataset,
					parentBranchInputBid,
					trigger = dropdownPicker.trigger,
					dropdownSelect = trigger,
					dataset,
					bid,
					dataConfigKit,
					dataConfig,
					subitemSelect,
					subitemDataset,
					subitemBid,
					label,
					subitemLabel,
					subitemInput,
					text,
					$linkageBox,
					linkageBoxTmplFn,
					selectBranch,
					subitemBranch,
					linkageBoxBranch,
					inputBranch,
					selectDataType,
					inputDataType,
					li,
					sublist,
					subitemTmplFn,
					dsclh;

				if (target.tagName == 'INPUT') {

					switch (target.type) {

						case 'radio':
							input = target;

							// 属性条件筛选器
							if (this.filterType === 'filterConditions') {
								label = $.getAncestor(input, 'label');
								text = $(label).text();
								dataset = dropdownSelect.dataset;
								bid = dataset.bid;
								inputDataset = input.dataset;
								inputBid = inputDataset.bid;

								// dropdownSelect.value = input.value
								if (bid === inputBid) {
									dropdownPicker.close(e);
									break;
								}
								dataset.bid = inputBid;
								dataset.bname = inputDataset.bname;

								trigger.name = input.name;
								trigger.value = input.value;
								$('span', trigger).text(text);
								//$(trigger).trigger('change');

								$linkageBox = $(dropdownSelect).next('.linkage-box');

								dataConfigKit = this.getDataConfigKitByBid(bid);
								selectBranch = dataConfigKit.branch;
								inputBranch = dataConfigKit.dataConfig.getBranchByBid(inputBid);
								selectDataType = selectBranch.dataType || selectBranch.childrenDataType;
								inputDataType = inputBranch.dataType || inputBranch.childrenDataType;
//console.log(selectDataType);//console.log(inputBranch);
								switch(inputDataType){
									case 'boolean':
										$linkageBox.remove();
										$(trigger).trigger('change');
									break;
									default:
										if(inputDataType !== selectDataType || 
										// INTEGER/DOUBLE/LONG
										(selectBranch.value !== inputBranch.value && 
										((selectBranch.value === 'BETWEEN' || inputBranch.value === 'BETWEEN')
										|| (inputDataType === 'DATE' || selectDataType === 'DATE')))){
											$linkageBox.remove();
											$(dropdownSelect).after(this.createLinkageBoxHtml(inputBranch));
										}
										$(trigger).trigger('change');
								}
								dropdownPicker.close(e);
								break;
							}
							// this.filterType ===  'filterEvents'
							// 事件筛选器
							// 若可选
							else if (!input.disabled) {

								li = $.getAncestor(input, 'li');
								sublist = li.querySelector('ul');

								// 若不包含子分支
								if (!sublist) {
									dataset = dropdownSelect.dataset;
									bid = dataset.bid;
									subitemSelect = $(dropdownSelect).next('.dropdown-subitem')[0];
									subitemDataset = subitemSelect && subitemSelect.dataset;
									subitemBid = subitemSelect && subitemDataset.bid;
									inputDataset = input.dataset;
									inputBid = inputDataset.bid;

									label = $.getAncestor(input, 'label');
									text = $(label).text();
									li = $.getAncestor(li, 'li');

									// 若自身为下拉子分支项
									// this.filterType === 'filterEvents'
									if (li) {
										// 若包含子分支项且bid相等
										if (subitemBid === inputBid) {
											dropdownPicker.close(e);
											break;
										}
										dataConfigKit = this.getDataConfigKitByBid(subitemBid || bid);
										dataConfig = dataConfigKit.dataConfig;
										dataConfigKit.clearBranchSelected();

										label = li.querySelector('label');
										parentBranchInput = label.querySelector('input');
										parentBranchInputDataset = parentBranchInput.dataset;
										dataset.bname = parentBranchInputDataset.bname;
										dataset.bid = parentBranchInputBid = parentBranchInputDataset.bid;
										text = $(label).text() + '的' + text;

										dataConfig.setBranchSelected(dataConfig.getBranchByBid(inputBid));

										if (subitemSelect) {
											subitemSelect.name = input.name;
											subitemSelect.value = input.value;
											subitemDataset.bid = inputBid;
											subitemDataset.bname = inputDataset.bname;
										} else {
											subitemTmplFn = this.getTmplFn('subitemTmpl');
											$(dropdownSelect).after(subitemTmplFn(dataConfig.getBranchByBid(inputBid)));
										}
										trigger.name = parentBranchInput.name;
										trigger.value = parentBranchInput.value;
									}
									// 若自身为下拉分支项（非子分支）
									else {
										// 若不包含关联子分支项且bid相等
										if (!subitemSelect && bid === inputBid) {
											dropdownPicker.close(e);
											break;
										}
										dataConfigKit = this.getDataConfigKitByBid(subitemBid || bid);
										dataConfig = dataConfigKit.dataConfig;
										dataConfigKit.clearBranchSelected();

										dataset.bname = inputDataset.bname;
										dataset.bid = inputBid;

										dataConfigKit = this.getDataConfigKitByBid(inputBid);
										dataConfigKit.setBranchSelected();

										if (subitemSelect) {
											$(subitemSelect).remove();
										}
										trigger.name = input.name;
										trigger.value = input.value;
									}
									
									$('span', trigger).text(text);
									$(trigger).trigger('change');
								}
							}

							dropdownPicker.close(e);
							break;

						case 'checkbox':
							break;
					}
				}

				return false;
			},

			// 下拉子菜单定位
			dropdownSetSublistPosition: function(li, sublist) {
				var body = document.body,
					bodyWidth = body.clientWidth,
					bodyHeight = body.clientHeight,
					liCoord = $.getRectCoord(li),
					sublistCoord = $.getRectCoord(sublist),
					sublistHeight = sublistCoord.bottom - sublistCoord.top,
					sublistWidth = sublistCoord.right - sublistCoord.left,
					offsetWidth = 5,
					offsetHeight = 5,
					currentStyle = getComputedStyle(sublist),
					originalTop = parseInt(currentStyle.top),
					originalLeft = parseInt(currentStyle.left),
					top = '',
					right = '',
					bottom = '',
					left = '',
					diffWidth,
					diffHeight;

				//console.log(currentStyle.left);

				if ((diffWidth = bodyWidth - (liCoord.right + sublistWidth + offsetWidth)) < 0) {
					left = -sublistWidth + 'px';
				}
				if ((diffHeight = bodyHeight - (liCoord.top + sublistHeight + offsetHeight)) < 0) {
					top = diffHeight + 'px';
				}
				
				$(sublist).css({
					top: top,
					left: left
				});
			},

			// 鼠标进入包含子下拉列表的项
			dropdownSublistMouseenter: function(e) {
				var li = e.currentTarget,
					sublist = li.querySelector('ul');
				
				this.dropdownPicker.clearSetPositionTimeout();
				this.dropdownSetSublistPosition(li, sublist);
			},

			// 鼠标滑出包含子下拉列表的项
			dropdownSublistMouseleave: function(e) {
				this.dropdownPicker.setPosition();
			},
			
			// 下拉列表已获取数据列表事件
			dropdownDatalistFetched: function(dropdownPicker, datalist, url){
				var id = AppPage.queryString('id', url),
					dimensionData,
					dataset,
					datalistNS = this.definedDropdownDatalistNS(id, datalist);
					
				if(datalistNS){
					dataset = dropdownPicker.trigger.dataset;
					// 定义下拉数据列表命名空间
					dataset.list = datalistNS;
					// 定义已获取数据列表事件命名空间
					delete dataset.listFetched;
					//dataset.listFetched = this.definedDropdownDatalistFetchedNS(id);
					
				}
				return false;
			},
			
			// 定义下拉数据列表命名空间
			definedDropdownDatalistNS: function(id, datalist){
				var dimensionData, ns, type;
				
				// 若有id，且存在维度表集合
				if(id && (dimensionData = this.parent.dimensionData)){
					if(datalist){
						dimensionData[id] || (dimensionData[id] = datalist);
						ns = 'ns(' + this.parent.NS + '.dimensionData.' + id + ')';
					}
					else if((type = typeof id) === 'string' || type === 'number'){
						if(dimensionData[id]){
							ns = 'ns(' + this.parent.NS + '.dimensionData.' + id + ')';
						}
					}
					else{
						datalist = id;
						ns = datalist.map(function(v){
							var o = {};
							o[this.dimensionDataValueKey] = o[this.dimensionDataNameKey] = v;
							return o;
						}, this);
						ns = 'data(' + DropdownPicker.stringifyHtml(ns) + ')';
					}
				}
				return ns;
			},
			
			// 定义已获取数据列表事件命名空间
			definedDropdownDatalistFetchedNS: function(){
				return this.NS + '.dropdownDatalistFetched';
			}
		};

		return FilterDropdown;

	});