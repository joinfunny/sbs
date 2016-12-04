// 
define([
	    'main/user-analysis/common',
		'main/user-analysis/UserAnalysis',
		'main/user-analysis/AnalysisMain',
		'main/user-analysis/Condition',
		'main/user-analysis/Filter',
		'main/user-analysis/analysis'
	],
	function (AppPage, UserAnalysis, AnalysisMain, Condition, Filter, analysis) {

		var Revisit = analysis.createModel('Revisit', [UserAnalysis, AnalysisMain, Condition, Filter]);

		// 分析模型
		_.extend(Revisit.UserAnalysis.prototype, {
			
			// 验证回访频次事件是否合法
			validRequestActions: function(requestData){ return requestData.actions.length > 0; },
			
			// 回访频次非法请求数据信息提示
			invalidRequestActionsMsg: '请添加一个回访事件！',
			//invalidRequestFilterConditionMsg: '筛选条件还有未输入或未选择的项！',

            // 通过请求对象抽取出中文转述对象（注：同时对传入的原对象中文属性做筛除操作）
			extractRequestZhData: function(requestData) {
				var requestZhData = {
						actions_zh: requestData.actions_zh,
						unit_zh: requestData.unit_zh,
						type_zh: requestData.type_zh,
						// 查看条件
						groupField_zh: requestData.groupField_zh
					};
				
				var requestZhData = JSON.parse(JSON.stringify(requestData)),
					filterCondition = requestData.filterCondition,
					userFilterCondition = requestData.userFilterCondition;
				
				if (filterCondition) {
					filterCondition.conditions.forEach(function (condition) {
                        delete condition.values_zh;
                    });
				}
				
				if (userFilterCondition) {
					userFilterCondition.conditions.forEach(function (condition) {
                        delete condition.values_zh;
                    });
				}
					
				delete requestData.actions_zh;
				delete requestData.type_zh;
				delete requestData.unit_zh;
				delete requestData.groupField_zh;

				return requestZhData;
			},

			// 获取请求数据（回访频次）
			getRequestData: function() {

				var requestData = {
//						// 事件名称
//						"actions": ["CancelOrder", "PayOrder"], //虚拟事件时，可能包括一个以上事件,["*"]代表任意
//						// 筛选条件
//						"filterCondition": {
//							"conditions": [{
//								"field": "event.paid_fee",
//								"expression": "equal",
//								"values": [
//									"88"
//								]
//							}],
//							"relation": "and" //且和或
//						},
//						// 时间单位，可以是 day/week/month
//						"unit": "month",
//						//按时间/频次 可以是time/frequency
//						"type": "time",
//						// 起始时间
//						"startDate": "2015-04-01",
//						// 结束时间
//						"endDate": "2015-07-01",
//						// 用户的筛选条件
//						"userFilterCondition": {
//							"conditions": [{
//								"field": "user.sex",
//								"expression": "equal",
//								"values": [
//									"2" //男
//								]
//							}],
//							"relation": "and"
//						},
//						"groupField": "" //分组属性，为空时表示“用户行为日期”
					},
                    dateRangeKit = this.getDateRangeKit(),
                    dateRange = dateRangeKit.dateRange,
					actionsKit = this.getActionsKit(),
					unitType = this.getUnitType(),
					groupFieldsKit = this.getGroupFieldsKit(),
					filterCondition = this.getFilterCondition();

				requestData = {
                    dateRangeType: dateRangeKit.dateRangeWord,
                    dateRangeText: dateRangeKit.dateRangeText,
					startDate: dateRange[0],
					endDate: dateRange[1],
					actions: actionsKit.actions,
					actions_zh: actionsKit.actions_zh,
					groupField: '',
					unit: unitType.unit,
					// 中文转述，临时附加字段
					unit_zh: unitType.unit_zh,
					type: unitType.type,
					type_zh: unitType.type_zh
				};

				// 若存在筛选条件才添加
				if (filterCondition) {
					this.extractUserFilterCondition(requestData, filterCondition);
				}

				if (groupField = groupFieldsKit.groupFields[0]) {
					requestData.groupField = groupField;
					requestData.groupField_zh = groupFieldsKit.groupFields_zh[0];
				}

				return requestData;
			},

			// 获取用户筛选条件
			extractUserFilterCondition: function(requestData, filterCondition) {
				var relation = filterCondition.relation;
				var eventConditions = [];
				var userConditions = [];
				
				requestData.hasEmptyValueFilterCondition = filterCondition.hasEmptyValueFilterCondition;
				delete filterCondition.hasEmptyValueFilterCondition;

				filterCondition.conditions.forEach(function(condition) {
					if (AppPage.UserAnalysis.isBehaviorAttr(condition.field)) {
						eventConditions.push(condition);
					} else {
						userConditions.push(condition);
					}
				})

				if (eventConditions.length > 0) {
					requestData.filterCondition = {
						relation: relation,
						conditions: eventConditions
					}
				}
				if (userConditions.length > 0) {
					requestData.userFilterCondition = {
						relation: relation,
						conditions: userConditions
					}
				}
			},

			// 获取回访频次的单位时间和记次方式
			getUnitType: function() {
				var unitType = this.analysisMain.getUnitType();
				return unitType;
			},

			// 获取回访频次的行为
			getActionsKit: function() {
				var actionsKit = {
					actions: [],
					actions_zh: []
				};

				// 原始数据是否已设置过
				if (this.isOriginalDataSetted()) {
					actionsKit = this.filterEvents.getActionsKit();
				}
				// 否则，设置分析模型默认数据
				else if (this.isSetDefaultActions) {
					this.userEvents.setDefaultActionsKit(actionsKit);
				}
				//console.log(JSON.stringify(actions, null, 4));
				return actionsKit;
			},

			//获取标题下的描述
			getAnalysisDesc: function(saveData) {
                var groupFields_zh = saveData.requestZhData.groupFields_zh,
                    requestData = saveData.requestData,
                    desc = requestData.dateRangeText ? requestData.dateRangeText : '(' + [requestData.startDate, requestData.endDate].join('至') + ')';

                if (groupFields_zh) {
                    desc += '，按' + groupFields_zh.join('和') + '分组';
                }
                //console.log(desc);
                return desc;
			},

		});

		// 主体
		_.extend(Revisit.AnalysisMain.prototype, {

			// 单位时间和记次方式
			getUnitType: function() {
				return this.parseUnitType(this.unitTimeRecord.value);
			},

            // 设置时间单位
            setDurationUnit: function (unitType) {
            	// 设置单位时间和记次方式
				this.setUnitType(unitType);
            },

			// 设置单位时间和记次方式
			setUnitType: function(unitType) {
				// 设置留回访记次方式
				this._setUnitType(this.unitTimeRecord, unitType);
			},
			
            // 解析字符串值获取单位时间和记次方式
            parseUnitType: function (value) {
                var unitType = value.split('/');
				var type = unitType[0];
				var unit = unitType[1];
				var UNIT_ZH =  { 
					"day": "一天内",
					"week": "一周内",
					"month": "一个月内"
				}

                return {
                    type: type,
                    type_zh: type === 'frequency' ? '次数' : unit === 'day' ? '小时数' : '天数',
                    unit: unit,
                    unit_zh: UNIT_ZH[unit]
                };
            },

			// 设置单位时间和记次方式
			_setUnitType: function(select, unitType) {
                _.some(select, function (option) {
                    var ut = this.parseUnitType(option.value);
                    if (ut.type === unitType.type && ut.unit === unitType.unit) {
                        return option.selected = true;
                    }
                }, this);
			},

			// 通过条件字段（中文）获取分析模型的标题
			getAnalysisTitleByZhData: function(requestZhData) {
				var actions = requestZhData.actions_zh,
					unit = requestZhData.unit_zh,
					type = requestZhData.type_zh,
					groupField = requestZhData.groupField_zh,
					title;
				
				title = unit + '进行' + actions.join('、') + '的' + type;
				title += '；按' + (groupField || '总体') + '查看';
				
				return title;
			},
			
			// 确认分析标题是否可设置
			canSetAnalysisTitle: function(requestZhData){
				return !!requestZhData && requestZhData.actions_zh.length > 0;
			}
		});

		// 条件
		_.extend(Revisit.Condition.prototype, {

			// 设置缺省回访事件为“任意事件”
			setDefaultActionsKit: function(actionsKit) {
				var dataConfig, chidren, branch,
					actions = actionsKit.actions,
					actions_zh = actionsKit.actions_zh;
				// 若无选中事件，
				if (actions.length < 1) {
					dataConfig = this.dataConfigs[0];
					children = dataConfig && dataConfig.children;
					branch = children && children[0];
					
					if(branch){
						actions.push(branch.value);
						actions_zh.push(branch.label);
					}
				}
				return actionsKit;
			}
		});

		// 筛选器
		_.extend(Revisit.Filter.prototype, {
			
			// 判断是否需要关联创建下拉框
			canLinkageSelect: function(deep){
				// 若不为属性筛选器，且不为事件筛选器
				return !this.onlyCondition && (!deep || this.filterType !== 'filterEvents');
			},

			// 判断是否可以添加条件选项
			canAddOption: function(value) {
				switch(this.filterType){
					case 'filterAttrs':
						// 回访的查看分组只能选择一个属性（事件属性或用户属性）
						return $(this.conditionBtn$, this.optionList).length < 1;
						
					case 'filterEvents':
						// 回访的事件选择只能加入一个事件
						return $(this.conditionBtn$, this.optionList).length < 1;
				}
				return true;
			},

			// 获取回访频次的事件（只有一个）
			getActionsKit: function() {
				var actions = [],
					actions_zh = [];

				$(this.conditionBtn$, this.optionList).each(function() {
					var value = this.value,
						zh = $(this).text();
					actions.push(value);
					actions_zh.push(zh);
				});
				return {
					actions: actions,
					actions_zh: actions_zh
				};
			},

			// 设置原始数据渲染
			setOriginalData: function(requestData, requestZhData) {
				switch (this.filterType) {
					case 'filterEvents':
						this.setFilterBehaviors(this.buildActions(requestData));
						break;
					case 'filterAttrs':
						this.setFilterAttrs(requestData.groupField ? [requestData.groupField] : []);
						break;
					case 'filterConditions':
						//this.setFilterConditions(this.buildFilterCondition(requestData));
                        this.setFilterConditions(this.buildFilterCondition(requestData), this.buildFilterCondition(requestZhData));
						break;
				}
			},

			// 构建出事件
			buildActions: function(requestData) {
				return requestData.actions.map(function(actionName){
					return { actionName: actionName };
				})
			},

			// 构建出筛选条件
			buildFilterCondition: function(requestData) {
				var userFilterCondition = requestData.userFilterCondition,
					eventFilterCondition = requestData.filterCondition,
					ue,
					filterCondition;
					
				if(ue = (userFilterCondition || eventFilterCondition)){
					filterCondition = {
						relation: ue.relation,
						conditions: []
					};
					if(userFilterCondition){
						filterCondition.conditions = filterCondition.conditions.concat(JSON.parse(JSON.stringify(userFilterCondition.conditions)));
					}
					if(eventFilterCondition){
						filterCondition.conditions = filterCondition.conditions.concat(JSON.parse(JSON.stringify(eventFilterCondition.conditions)));
					}
				}
				
				return filterCondition;
			}

		});

		return Revisit;

	});