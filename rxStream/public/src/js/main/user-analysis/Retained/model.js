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

		var Retained = analysis.createModel('Retained', [UserAnalysis, AnalysisMain, Condition, Filter]);

		// 分析模型
		_.extend(Retained.UserAnalysis.prototype, {

            // 触发事件的预处理（分析请求数据）
			dataEmit: function(type, analysisData){
				var requestData = analysisData.requestData,
					firstActionName = requestData.firstAction.actionName;
					secondActionName = requestData.secondAction.actionName;
				delete requestData.firstAction.actionName;
				delete requestData.secondAction.actionName;
				return this.emit(type, analysisData);
				requestData.firstAction.actionName = firstActionName;
				requestData.secondAction.actionName = secondActionName;
			},

			// 验证留存分析事件是否合法
			validRequestActions: function(requestData){ return !!requestData.secondAction; },

			// 留存分析非法请求数据信息提示
			invalidRequestActionsMsg: '请添加初始行为、后续行为两个事件',
			//invalidRequestFilterConditionMsg: '筛选条件还有未输入或未选择的项！',

            // 通过请求对象抽取出中文转述对象（注：同时对传入的原对象中文属性做筛除操作）
            extractRequestZhData: function (requestData) {
				
				if(!requestData.secondAction){ return null }

				var requestZhData = JSON.parse(JSON.stringify(requestData)),
					userFilterCondition = requestData.userFilterCondition;
					
				[requestData.firstAction, requestData.secondAction].forEach(function(action){
                	//delete action.actionName;
					delete action.actionName_zh;
                    delete action.actions_zh;
					if(action.filterCondition){
						action.filterCondition.conditions.forEach(function(condition){
							delete condition.values_zh;
						});
					}
				});
				
				if (userFilterCondition) {
					userFilterCondition.conditions.forEach(function (condition) {
                        delete condition.values_zh;
                    });
				}
				
				delete requestData.unit_zh;
                delete requestData.groupFields_zh;
                return requestZhData;
            },

			// 获取请求数据（留存分析）
			getRequestData: function() {

				var requestData = {
//						// 起始日期
//						"startDate": "2015-03-01",
//						// 结束日期
//						"endDate": "2015-03-13",
//						// 表示获取往后 N 个单位的留存
//						"duration": 7,
//						// 留存的单位，可以是 day/week/month
//						"unit": "day",
//						// 第一个事件的信息
//						"firstAction": {
//							// 事件名
//							"actions": ["CancelOrder", "PayOrder"] //虚拟事件时，可能包括一个以上事件,["*"]代表任意
//						},
//						// 第二个事件的信息
//						"secondAction": {
//							// 事件名
//							"actions": ["FinishOrder"], //虚拟事件时，可能包括一个以上事件
//							// 事件的筛选条件
//							"filterCondition": {
//								"conditions": [{
//									"field": "event.paid_fee",
//									"expression": "equal",
//									"values": ["88"]
//								}],
//								"relation": "and"
//							}
//						},
//						// 用户的筛选条件
//						"userFilterCondition": {
//							"conditions": [{
//								"field": "user.cust_type",
//								"expression": "equal",
//								"values": ["TB"] //购买平台淘宝
//							}],
//							"relation": "and"
//						},
//						// 分组属性，为空时表示“用户行为日期”
//						"groupField": "event.city",
//						// 当分组属性为事件时，必须需指定分组事件，事件1=e1,事件2=e2；若分组属性为用户，此处为空
//						"groupAction": "e2" // groupField为空时，这个也为空
					},
                    dateRangeKit = this.getDateRangeKit(),
                    dateRange = dateRangeKit.dateRange,
					actions = this.getActions(),
					retainedPeriod = this.getRetainedPeriod(),
					groupFieldsKit = this.getGroupFieldsKit(),
					filterCondition = this.getFilterCondition();

				requestData = {
                    dateRangeType: dateRangeKit.dateRangeWord,
                    dateRangeText: dateRangeKit.dateRangeText,
					startDate: dateRange[0],
					endDate: dateRange[1],
//					firstAction: actions[0],
//					secondAction: actions[1],
					groupField: '',
					groupAction: '',
					duration: retainedPeriod.duration,
					unit: retainedPeriod.unit,
					// 中文转述，临时附加字段
					unit_zh: retainedPeriod.unit_zh
				};
				//console.log(actions)
				if(actions[1]){
					requestData.firstAction = actions[0];
					requestData.secondAction = actions[1];

					// 若存在筛选条件才添加
					if(filterCondition){
						this.extractUserFilterCondition(requestData, filterCondition, actions);
					}

					if(groupField = groupFieldsKit.groupFields[0]){
						requestData.groupField = groupField;
						requestData.groupField_zh = groupFieldsKit.groupFields_zh[0];
						requestData.groupAction = this.getGroupAction(groupField, actions);
					}
				}
				//console.log(requestData)
				return requestData;
			},

			// 判断分组项是判断初始行为还是后续行为的
			getGroupAction: function(groupField, actions){
				var groupAction = '';
				// 若为事件属性分组
				if(groupField && AppPage.UserAnalysis.isBehaviorAttr(groupField)){
					groupAction = 'e1';
					actions.some(function(action, i){
						var hasGroupField = action.actions.some(function(actionValue){
							return this.some(function(action){
								return action.value === actionValue && action.fields && action.fields.indexOf(groupField) > -1;
							});
						}, this);
						if(hasGroupField){
							groupAction = 'e' + (i + 1)
							return true;
						}
					}, this.conditionsData.events);
				}
				return groupAction;
			},

			// 获取用户筛选条件
			extractUserFilterCondition: function(requestData, filterCondition, actions) {
				var relation = filterCondition.relation;
				var eventConditions = [];
				var strEventConditions;
				var userConditions = [];

				requestData.hasEmptyValueFilterCondition = filterCondition.hasEmptyValueFilterCondition;
				delete filterCondition.hasEmptyValueFilterCondition;

				filterCondition.conditions.forEach(function(condition){
					if(AppPage.UserAnalysis.isBehaviorAttr(condition.field)){
						eventConditions.push(condition);
					}
					else{
						userConditions.push(condition);
					}
				})

				if(eventConditions.length > 0){
					strEventConditions = JSON.stringify(eventConditions);
					actions.forEach(function(action){
						action.filterCondition = {
							relation: relation,
							conditions: JSON.parse(strEventConditions)
						}
					});
				}
				//console.log(userConditions)
				if(userConditions.length > 0){
					requestData.userFilterCondition = {
						relation: relation,
						conditions: userConditions
					}
				}
			},

			// 获取留存期 ok!
			getRetainedPeriod: function() {
				var retainedPeriod = this.analysisMain.getRetainedPeriod();
				return retainedPeriod;
			},

			// 获取初始行为和后续行为
			getActions: function() {
				var actions = [];

				// 原始数据是否已设置过
				if(this.isOriginalDataSetted()){
					actions = this.filterEvents.getActions();
				}
				// 否则，设置分析模型默认数据
				else if(this.isSetDefaultActions){
					this.userEvents.setDefaultActions(actions);
				}
				//console.log(JSON.stringify(actions, null, 4));
				return actions;
			},

            //获取标题下的描述
            getAnalysisDesc: function (saveData) {
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
		_.extend(Retained.AnalysisMain.prototype, {

			// 获取留存期
			getRetainedPeriod: function() {
				return this.parseDurationUnit(this.retainedPeriod.value);
			},

            // 设置时间单位
            setDurationUnit: function (durationUnit) {
            	// 设置留存期
				this._setDurationUnit(this.retainedPeriod, durationUnit);
            },

            // 通过条件字段（中文）获取分析模型的标题
            getAnalysisTitleByZhData: function (requestZhData) {
                var actions = [],
                    groupField = requestZhData.groupField_zh,
                    title;
					//console.log(requestZhData.firstAction);
				actions.push('初始行为：' + requestZhData.firstAction.actionName_zh);
				actions.push('后续行为：' + requestZhData.secondAction.actionName_zh);
//				actions.push('初始行为：' + requestZhData.firstAction.actions_zh.join('、'));
//				actions.push('后续行为：' + requestZhData.secondAction.actions_zh.join('、'));

                title = actions.join(' -> ');

                title += '；按' + (groupField || '总体') + '查看';

                return title;
            },

			// 确认分析标题是否可设置
			canSetAnalysisTitle: function(requestZhData){
				return !!(requestZhData && requestZhData.secondAction);
			}
		});

		// 条件
		_.extend(Retained.Condition.prototype, {

			// 设置缺省留存的初始、后续行为为“任意事件”
			setDefaultActions: function(actions){
				var dataConfig, chidren, branch, action, action2, name, nameZh;
				// 若无选中事件，
				if(actions.length < 1){
					dataConfig = this.dataConfigs[0];
					children = dataConfig && dataConfig.children;
					branch = children && children[0];

					if(branch){
						action = {};
						action2 = {};
                        name = branch.name; // 'actionName'
                        nameZh = name + '_zh'; // 'actionName_zh'

                        action[name] = action2[name] = branch.value;
                        action[nameZh] = action2[nameZh] = branch.label;
                        action.actions = [branch.value];
                        action2.actions = [branch.value];
                        action.actions_zh = [branch.label];
                        action2.actions_zh = [branch.label];
                        actions.push(action, action2);
					}
				}
				return actions;
			},

		});

		// 筛选器
		_.extend(Retained.Filter.prototype, {

			// 判断是否需要关联创建下拉框
			canLinkageSelect: function(deep){
				// 若不为属性筛选器，且不为事件筛选器
				return !this.onlyCondition && (!deep || this.filterType !== 'filterEvents');
			},

			// 判断是否可以添加条件选项
			canAddOption: function(value) {
				// 当只显示条件选项，不关联联动选填项
				if (this.onlyCondition) {
					return $(this.conditionBtn$, this.optionList).length < 1;
				}
				switch(this.filterType){

					case 'filterEvents':
						// 留存的事件选择必须也只能加入两个事件
						return $(this.conditionBtn$, this.optionList).length < 2;

					case 'filterAttrs':
						// 留存的查看分组只能选择一个属性（事件属性或用户属性）
						return $(this.conditionBtn$, this.optionList).length < 1;
				}
				return true;
			},

			// 获取初始和后续行为
			getActions: function() {
				var actions = [];

				$(this.conditionBtn$, this.optionList).each(function(){
					var action = {},
						name = this.name, // 'actionName'
						value = this.value,
						label = $(this).text(),
						nameZh = name + '_zh', // 'actionName_zh'
						actionsZh = 'actions_zh';

					action[name] = value;
					action.actions = [value];
					action[nameZh] = label;
					action[actionsZh] = [label];

					actions.push(action);
				});
				return actions;
			},

			// 设置原始数据渲染
			setOriginalData: function(requestData, requestZhData){
				switch(this.filterType){
					case 'filterEvents':
						requestData.secondAction && this.setFilterBehaviors([requestData.firstAction, requestData.secondAction]);
						break;
					case 'filterAttrs':
						this.setFilterAttrs(requestData.groupField ? [requestData.groupField] : []);
						break;
					case 'filterConditions':
                        this.setFilterConditions(this.buildFilterCondition(requestData), this.buildFilterCondition(requestZhData));
						break;
				}
			},

			// 构建出筛选条件
			buildFilterCondition: function(requestData){
				 var filterCondition = requestData.userFilterCondition && JSON.parse(JSON.stringify(requestData.userFilterCondition));
				 [requestData.firstAction].forEach(function(action){
					 if(action.filterCondition){
						 if(filterCondition){
							 filterCondition.conditions = filterCondition.conditions.concat(JSON.parse(JSON.stringify(action.filterCondition.conditions)));
						 }
						 else{
							 filterCondition = JSON.parse(JSON.stringify(action.filterCondition));
						 }
					 }
				 });
				 //console.log(filterCondition)
				 return filterCondition;
			}

		});

		return Retained;

	});