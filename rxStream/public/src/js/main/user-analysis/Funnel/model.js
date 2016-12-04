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

        var Funnel = analysis.createModel('Funnel', [UserAnalysis, AnalysisMain, Condition, Filter]);

        // 分析模型
        _.extend(Funnel.UserAnalysis.prototype, {
			
			// 验证漏斗分析事件是否合法
			validRequestActions: function(requestData){ return requestData.funnels.length > 1; },
			
			// 漏斗分析非法请求数据信息提示
			invalidRequestActionsMsg: '至少应添加两个漏斗步骤的事件',
			//invalidRequestFilterConditionMsg: '筛选条件还有未输入或未选择的项！',

            // 通过请求对象抽取出中文转述对象（注：同时对传入的原对象中文属性做筛除操作）
            extractRequestZhData: function (requestData) {
				
				var requestZhData = JSON.parse(JSON.stringify(requestData)),
					filterCondition = requestData.filterCondition;
					
				requestData.funnels.forEach(function(action){
					delete action.actionName_zh;
                    delete action.actions_zh;
				});
				
				if (filterCondition) {
					filterCondition.conditions.forEach(function (condition) {
                        delete condition.values_zh;
                    });
				}
				
				delete requestData.unit_zh;
                delete requestData.groupFields_zh;
                return requestZhData;
            },

            // 获取请求数据（漏斗分析）
            getRequestData: function () {

                var requestData = {
//						// 漏斗集
//						"funnels": [{
//							//事件名称
//							"actionName": "CreateOrder",
//							//实际事件，虚拟事件时包含多个事件
//							"actions": ["CreateOrder"],
//							"filterCondition": {
//								"conditions": [{
//									"field": "event.city",
//									"expression": "notequal",
//									"values": ["海外"]
//								}],
//								//并和且
//								"relation": "and"
//							}
//						}, {
//							"actionName": "CancelOrder",
//							"actions": ["CancelOrder"]
//						}], //漏斗，创建订单-拍单-取消订单的漏斗集（转化率）
//
//						// 窗口期:分钟=minute，小时=hour,天=day
//						"unit": "hour",
//						// N个单位
//						"duration": "1",
//						// 起始日期
//						"startDate": "2015-04-17",
//						// 结束日期
//						"endDate": "2015-07-16",
//						// 筛选条件，无条件就删除filterCondition标签
//						"filterCondition": {
//							"conditions": [{
//								"field": "user.sex",
//								"expression": "equal",
//								"values": ["2"] //男
//							}],
//							"relation": "and"
//						},
//						// 分组属性，可以没有
//						"groupField": "user.sex"
                    },
                    dateRangeKit = this.getDateRangeKit(),
                    dateRange = dateRangeKit.dateRange,
                    //dateRange = this.getDateRange(),
					funnels = this.getFunnels(),
                    funnelWindowPeriod = this.getFunnelWindowPeriod(),
                    groupFieldsKit = this.getGroupFieldsKit(),
                    filterCondition = this.getFilterCondition(),
                    groupField;

                requestData = {
                    dateRangeType: dateRangeKit.dateRangeWord,
                    dateRangeText: dateRangeKit.dateRangeText,
                    startDate: dateRange[0],
                    endDate: dateRange[1],
                    funnels: funnels,
                    duration: funnelWindowPeriod.duration,
                    groupField: '',
                    unit: funnelWindowPeriod.unit,
                    // 中文转述，临时附加字段
                    unit_zh: funnelWindowPeriod.unit_zh
                };

                if (groupField = groupFieldsKit.groupFields[0]) {
                    requestData.groupField = groupField;
                    requestData.groupField_zh = groupFieldsKit.groupFields_zh[0];
                }
				
				if(this.validRequestActions(requestData)){	
					// 若存在筛选条件才添加
					if(filterCondition){
						this.extractUserFilterCondition(requestData, filterCondition, funnels);
					}
				}

                return requestData;
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
				if(userConditions.length > 0){
					requestData.filterCondition = {
						relation: relation,
						conditions: userConditions
					}
				}
			},

            // 获取漏斗窗口期 ok!
            getFunnelWindowPeriod: function () {
                var funnelWindowPeriod = this.analysisMain.getFunnelWindowPeriod();
                return funnelWindowPeriod;
            },

            // 获取漏斗集
            getFunnels: function () {
                var funnels = [];

                // 原始数据是否已设置过
                if (this.isOriginalDataSetted()) {
                    funnels = this.filterEvents.getFunnels();
                }
                // 否则，设置分析模型默认数据
                else if (this.isSetDefaultActions) {
                    this.userEvents.setDefaultFunnels(funnels);
                }
                //console.log(JSON.stringify(funnels, null, 4));
                return funnels;
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
            }

        });

        // 主体
        _.extend(Funnel.AnalysisMain.prototype, {

            // 获取漏斗窗口期
            getFunnelWindowPeriod: function () {
                return this.parseDurationUnit(this.funnelWindowPeriod.value);
            },

            // 设置时间单位
            setDurationUnit: function (durationUnit) {
                // 设置漏斗窗口期
                this._setDurationUnit(this.funnelWindowPeriod, durationUnit);
            },

            // 通过条件字段（中文）获取分析模型的标题
            getAnalysisTitleByZhData: function (requestZhData) {
                var actions = [],
                    groupField = requestZhData.groupField_zh,
                    title;

                requestZhData.funnels.forEach(function (action) {
                    actions.push(action.actionName_zh);
                    //actions.push(action.action_zh.join('、'));
                });

                title = actions.join(' -> ');

                title += '；按' + (groupField || '总体') + '查看';

                return title;
            },

            // 确认分析标题是否可设置
            canSetAnalysisTitle: function (requestZhData) {
                return !!requestZhData && requestZhData.funnels.length > 0;
            }
        });

        // 条件
        _.extend(Funnel.Condition.prototype, {

            // 设置缺省漏斗集为“任意事件”
            setDefaultFunnels: function (funnels) {
				var dataConfig, chidren, branch, funnel, funnel2, name, nameZh;
                // 若无选中事件，
                if (funnels.length < 1) {
					dataConfig = this.dataConfigs[0];
					children = dataConfig && dataConfig.children;
					branch = children && children[0];
					
					if(branch){
						funnel = {};
						funnel2 = {};
                        name = branch.name; // 'actionName'
                        nameZh = name + '_zh'; // 'actionName_zh'

                        funnel[name] = funnel2[name] = branch.value;
                        funnel[nameZh] = funnel2[nameZh] = branch.label;
                        funnel.actions = [branch.value];
                        funnel2.actions = [branch.value];
                        funnel.actions_zh = [branch.label];
                        funnel2.actions_zh = [branch.label];
                        funnels.push(funnel, funnel2);
					}
                }
                return funnels;
            }
        });

        // 筛选器
        _.extend(Funnel.Filter.prototype, {
			
			// 判断是否需要关联创建下拉框
			canLinkageSelect: function(deep){
				// 若不为属性筛选器，且不为事件筛选器
				return !this.onlyCondition && (!deep || this.filterType !== 'filterEvents');
			},

            // 判断是否可以添加条件选项
            canAddOption: function (value) {
                // 当只显示条件选项，不关联联动选填项
                if (this.onlyCondition) {
                    return $(this.conditionBtn$, this.optionList).length < 1;
                }
                return true;
            },

            // 获取漏斗集
            getFunnels: function () {
                var funnels = [];

                $(this.conditionBtn$, this.optionList).each(function () {
                    var funnel = {},
                        name = this.name, // 'actionName'
                        value = this.value,
                        nameZh = name + '_zh'; // 'actionName_zh'

                    funnel[name] = value;
                    funnel.actions = [value];
                    funnel[nameZh] = $(this).text();

                    funnels.push(funnel);
                });
                return funnels;
            },

            // 设置原始数据渲染
            setOriginalData: function (requestData, requestZhData) {
                switch (this.filterType) {
                    case 'filterEvents':
                        this.setFilterBehaviors(requestData.funnels);
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
				 var filterCondition = requestData.filterCondition && JSON.parse(JSON.stringify(requestData.filterCondition));
				 requestData.funnels.slice(0, 1).forEach(function(action){
				 //console.log(action)
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

        return Funnel;

    });