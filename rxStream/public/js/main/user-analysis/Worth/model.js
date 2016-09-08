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
		
		
		var Worth = analysis.createModel('Worth', [UserAnalysis, AnalysisMain, Condition, Filter]);

		// 分析模型
		_.extend(Worth.UserAnalysis.prototype, {
			
			// 验证价值分析事件是否合法，必须至少3个事件组成多边形视图
			validRequestActions: function(requestData){ return requestData.actions.length > 2; },
			
			// 价值分析非法请求数据信息提示
			invalidRequestActionsMsg: '请添加至少三个用户行为事件！',
			//invalidRequestFilterConditionMsg: '筛选条件还有未输入或未选择的项！',

            // 获取请求数据（行为事件分析）
            getRequestData: function () {
                var requestData = {
                        //					"actions": [{
                        //						"actionName": "PayOrder",
                        //						"operation": "sum",
                        //						"field": "event.order_money"
                        //					}],
                        //					"filterCondition": {
                        //						"relation": "or",
                        //						"conditions": [{
                        //							"field": "event.provice",
                        //							"expression": "notequal",
                        //							"values": ["辽宁省"]
                        //						}]
                        //					},
                        //					"groupFields": ["event.provice"],
                        //					"bucketConditions": [],
                        //					"startDate": "2015-11-10",
                        //					"endDate": "2015-11-12",
                        //					"compare_startDate": "2015-11-9",
                        //					"compare_endDate": "2015-11-11",
                        //					"dateRangeWord":""
                    },

                //1. "actions" 必须为数组至少包含一个项，任意事件为：actionName: "*"
                //2. "unit" 必须为：hour、day、week、month
                //3. "filterCondition" 若未加入筛选条件，则删除该字段
                //4. "groupFields" 若按总体查看，则为一个空数组：[]
                //5 "bucket_condition" 暂时定义一个空数组：[]
                //6. "startDate" 必须有，格式为"2015-11-10"
                //7. "endDate" 必须有，格式为"2015-11-12"格式
                    dateRangeKit = this.getDateRangeKit(),
                    dateRange = dateRangeKit.dateRange,
                    compareDateRange = this.getDateRange(true),
                    groupFieldsKit = this.getGroupFieldsKit(),
                    filterCondition = this.getFilterCondition(),

                requestData = {
                    dateRangeType: dateRangeKit.dateRangeWord,
                    dateRangeText: dateRangeKit.dateRangeText,
                    startDate: dateRange[0],
                    endDate: dateRange[1],
                    actions: this.getActions(),
                    groupFields: groupFieldsKit.groupFields,
                    //bucketConditions: this.getBucketConditions(),
                    // 中文转述，临时附加字段
                    groupFields_zh: groupFieldsKit.groupFields_zh
                };

                if (compareDateRange) {
                    requestData.compareStartDate = compareDateRange[0];
                    requestData.compareEndDate = compareDateRange[1];
                }

                // 设置请求数据对象的筛选条件
                this.setRequestDataFilterCondition(requestData, filterCondition);

                return requestData;
            },

			// 获取价值分析的行为集
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
			
		});

		// 主体
		_.extend(Worth.AnalysisMain.prototype, {
			
            // 设置原始数据渲染
            setOriginalData: function (originalData) {
                this.setAnalysisTitle(originalData.requestZhData, originalData);
                this.setDateRange(originalData.requestData, originalData.isCompare);
            }

		});

		// 条件
		_.extend(Worth.Condition.prototype, {
			
			// 设置缺省三个事件为“任意事件的用户平均次数”等置顶事件，
			setDefaultActions: function(actions){
				var dataConfig, chidren;
				// 若无选中事件，
				if(actions.length < 1){
					dataConfig = this.dataConfigs[0];
					children = dataConfig && dataConfig.children;
					
					if(children.length > 2){
						// 至少三个事件，组成价值分析图形
						children.slice(0, 3).forEach(function(branch){
							var action = {},
								firstChildBranch = branch.children[0];
								
							action[branch.name] = branch.value;
							action[firstChildBranch.name] = firstChildBranch.value;
							action[branch.name + '_zh'] = branch.label;
							action[firstChildBranch.name + '_zh'] = firstChildBranch.label;
							actions.push(action);
						});
					}
				}
			},
			
			// 设置数据配置的事件求值
			setDataConfigOperation: function(dataConfigOptions){
				if(this.conditionType === 'userEvents'){
					dataConfigOptions.getEventsOperation = function(){
						var eventsOperation = this.operation.events;
						return {
							event: eventsOperation.event.slice(-1),
							eventAttr: eventsOperation.eventAttr.slice(-1)
						};
					}
				}
				return dataConfigOptions;
			},
			
		});

		// 筛选器
		_.extend(Worth.Filter.prototype, {

			// 获取初始和后续行为
			getActions: function() {
				var actions = [],
					conditionBtn$ = this.conditionBtn$;
				
				$(this.optionItem$, this.optionList).each(function(){
					var action = {}, i;
					$('>button', this).each(function(){
					
						var name = this.name, // 'actionName'
							value = this.value,
							label = $(this).text().trim(),
							nameZh = name + '_zh';
						
						action[name] = value;
						action[nameZh] = label;
					});
					// 字段和求值的标签（中文）处理
					if(action.field){
						i = action.field_zh.lastIndexOf(action.operation_zh);
						i > -1 && (action.field_zh = action.field_zh.slice(0, i - 1));
					}
					actions.push(action);
				});
				return actions;
			}
			
		});
		
		return Worth;

	});