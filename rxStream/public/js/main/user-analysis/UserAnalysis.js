//
define([
        'jQcss3',
        'main/common',
		'main/user-analysis/DataConfig'
    ],
    function(css3, AppPage, DataConfig) {

        // 类构造函数
        function UserAnalysis() {}

        // 原型
        UserAnalysis.prototype = _.create(EventEmitter.prototype, {
            'constructor': UserAnalysis
        });


        // 原型扩展
        _.extend(UserAnalysis.prototype, {

            // 维度表hash集合
            dimensionData: {},

            // 分析类型
            analysisType: 'Event',

            // 拖拽条件项的标识字母（映射到数据树的bname）
            initialMap: {
                'events': 'e',
                'eventAttrs': 'b',
                'subjectAttrs': 's',
                'objectAttrs': 'o'
            },

            // 分析类型集
            analysisTypes: ['Event', 'Funnel', 'Retained', 'Revisit', 'Worth', 'Spread'],

            // 分析类型中文名映射
            analysisTypesZh: {
                'Event': '用户行为分析',
                'Funnel': '漏斗分析',
                'Retained': '留存分析',
                'Revisit': '回放频率',
                'Worth': '价值分析',
                'Spread': '传播分析'
            },

            // 是否设置默认行为
            isSetDefaultActions: true,

            // 初始化
            init: function init(root, options) {
                options && _.extend(this, options);
                this.bindHandleEvent();
                this.initRoot(root);
                this.analysisType = this.root.dataset.analysisType;
                return this;
            },

            // 初始化根元素
            initRoot: function(root) {
                this.root = $(root)[0];
                this.doc = document;
                this.docRoot = this.doc.documentElement;
                this.delegateRoot('click');
            },

            // 事件委托根元素
            delegateRoot: function(eventTypes) {
                $(this.root).on(eventTypes, this.handleEvent);
            },

            analysisMain: null,
            userEvents: null,
            eventAttrs: null,
            subjectAttrs: null,
            objectAttrs: null,
            filterEvents: null,
            filterAttrs: null,
            filterConditions: null,
            conditionsAllDefer: null,

            // 绘制
            render: function() {
                this.getConditionsDataDefer();
                this.renderChildren();
                this.getOriginalDataDefer();
                return this;
            },

            // 重绘
            rerender: function(options) {
                options && _.extend(this, options);
                this.getOriginalDataDefer();
                this.allDatasReady();
                return this;
            },

            // 渲染子组件
            renderChildren: function() {
                if (this.children) {
                    this.children.forEach(function(component) {
                        component.render();
                    }); //console.log(component);
                }
            },

            // 不同分析类型的分析条件的url（从服务层获取）
            conditionsUrl: __path + '/services/getMetaData',

            // 拼装不同分析类型的分析条件的url
            getConditionsUrl: function() {
                var analysisTypeId = AppPage.getAnalysisTypeId(this.analysisType),
                    conditionsUrl = this.conditionsUrl + '?id=' + analysisTypeId;
                //var conditionsUrl = this.conditionsUrl + '?type=' + this.analysisType;
                // 分析条件的url（从静态数据路径获取）
                //var conditionsUrl = (__path + '/data/${type}/data.json').replace(/\$\{type\}/, this.analysisType);
                return conditionsUrl;
            },

            // 获取分析类型id（即类型集数组的索引）
            getTypeId: function() {
                return this.analysisTypes.indexOf(this.analysisType);
            },

            // 分析条件
            conditionsData: null,

            // 分析条件的延时对象
            conditionsDataDefer: null,

            // 获取不同分析类型的分析条件数据
            /*getConditionsDataDefer: function() {
                var that = this,
                    conditionsUrl = this.getConditionsUrl();
                this.conditionsDataDefer = AppPage.loadApi({
                    url: conditionsUrl,
                    method:'get',
                    dataType: 'json'
                }).then(function(res) {
                    var dataObject = res.dataObject;
                    dataObject.events = dataObject.eventConfig;
                    dataObject.eventAttrs = dataObject.eventAttrConfig;
                    dataObject.userAttrs = dataObject.userConfig;

                    delete dataObject.eventConfig;
                    delete dataObject.eventAttrConfig;
                    delete dataObject.userConfig;

                    AppPage.UserAnalysis.filterConditionActionsData(dataObject.events);
                    console.log(JSON.stringify(dataObject, null, 4));
                    return that.conditionsData = res.dataObject;
                });
            },*/
            // 获取不同分析类型的分析条件数据
            getConditionsDataDefer: function() {

                var conditionsUrl = this.getConditionsUrl();

                this.conditionsDataDefer = AppPage.loadApi({
                        url: conditionsUrl,
                        method:'get',
                        dataType: 'json'
                    })
                    .then(function(res) {
                            this.conditionsData = res.dataObject;
							this.fixDataKeys();
                            return this.conditionsData;
                        }
                        .bind(this));
            },
			
			conditionsDataKey: {
				'events': 'events',
				'eventProps': 'eventAttrs',
				'allSubjectProps': 'subjectAttrs',
				'allObjectProps': 'objectAttrs'
			},
			
			fixDataKeys: function(){
				if(this.conditionsDataKey){
					$.each(this.conditionsDataKey, function(oldKey, newKey){
						 DataConfig.replaceKey(this, oldKey, newKey);
					}
					.bind(this.conditionsData));
				}
			},

            // 获取分析模型原始数据url
            originalDataUrl: __path + '/services/analysis/get',

            // 分析模型id
            analysisId: null,

            // 记录用户分析类型的id，创建分析模型时需要传参
            templateId: null,

            // 拼装原始分析条件url
            getOriginalDataUrl: function() {
                return this.analysisId && (this.originalDataUrl+'?id=' + this.analysisId);
            },

            // 分析模型原始数据
            originalData: null,

            // 分析模型原始数据延时对象
            originalDataDefer: null,

            // 通过保存的分析模型的唯一标识，获取原始分析数据
            getOriginalDataDefer: function() {
                var that = this,
                    originalDataUrl = this.getOriginalDataUrl();

                // 若获取的url为空，为编辑分析模型
                if (originalDataUrl) {
                    this.originalDataDefer = AppPage.loadApi({
                            url: originalDataUrl,
                            method:'get',
                            dataType: 'json'
                        })
                        .then(function(res) {
                            var originalData = JSON.parse(res.dataObject.file);
                            delete originalData.requestData.hasEmptyValueFilterCondition;
                            //return that.originalData = originalData;
                            return originalData;
                        });
                }
                // 否则为新建分析模型
                else {
                    return this.originalDataDefer = this.conditionsDataDefer
                        //						.then(function(res) {
                        //							//return that.originalData = that.createOriginalData();
                        //							return that.createOriginalData();
                        //						});
                        .then(this.createOriginalData.bind(this));
                }
            },

            // 创建分析模型原始数据
            createOriginalData: function() {
                var analysisSaveData = this.getAnalysisSaveData();
                return analysisSaveData;
            },

            // 所有数据已就绪
            allDatasReady: function() {
                //				var that = this;
                //				this.conditionsDataDefer.then(function(){
                //					that.originalDataDefer.then(function(originalData){
                //						that.confirmRequestRender(originalData);
                //					});
                //				})
                this.conditionsDataDefer.then(this.originalDataDefer.then.bind(this, this.confirmRequestRender.bind(this)));
                return this;
            },

            //
            then: function(resolve, reject) {
                return this.originalDataDefer.then(resolve, reject);
            },

            // 处理事件路由
            handleEvent: function(e) {
                var type = e.type;
                switch (e.type) {
                    default: type = type.toLowerCase();
                    if (type.indexOf('animationend') > -1) {
                        e.w3ctype = 'animationend';
                        this.animationend(e);
                    }
                }
            },

            // 动画结束事件
            animationend: function(e) {
                $(e.currentTarget).remove();
            },

            // 保存分析模型数据url
            analysisDataUrl: '/services/saveAnalysisData',

            // 获取保存分析模型数据url
            getAnalysisDataUrl: function() {
                return this.analysisDataUrl;
            },

            //
            saveAjaxDefer: null,

            // 保存分析模型
            saveAnalysis: function(e) {

                if ($(e.target).hasClass('icon-loading')) {
                    return;
                }

                var that = this,
                    target = e.target,
                    saveData = this.getAnalysisSaveData(),
                    // 验证保存的数据是否合法
                    validResult = this.validAnalysisSaveData(saveData);

                // 若不合法
                if (!validResult.valid) {
                    $(target).addClass('icon-loading');
                    AppPage.responsePrompt(validResult.msg, false, function animationend() {
                        $(target).removeClass('icon-loading');
                    });
                    return;
                }

                // 获取包装后的要保存的分析数据
                var analysisObject = this.getAnalysisWrapperSaveData(saveData),
                    data = {
                        analysisObject:JSON.stringify(analysisObject)
                    },
                    analysisType = this.analysisTypesZh[this.analysisType],
                    analysisDataUrl = this.getAnalysisDataUrl(),
                    dataStr = JSON.stringify(data);

                this.saveAjaxDefer = AppPage.loadApi({
                    url: analysisDataUrl,
                    dataType: 'json',
                    data: data,
                    crossDomain: true,
                    beforeSend: function() {
                        $(target).addClass('icon-loading');
                    },
                    complete: function(e) {
                        var text, success, analysisId;
                        delete that.saveAjaxDefer;

                        if (e.statusText.toLowerCase() === 'ok') {
                            if (e.responseJSON.success) {

                                that.originalData = saveData;
                                analysisId = e.responseJSON.dataObject.id;

                                var data = {
                                    UniqueID: analysisId,
                                    Title: analysisObject.name,
                                    TemplateID: analysisObject.templateId,
                                    Remark: analysisObject.comment,
                                    AnalysisType: analysisObject.type,
                                    Config: saveData
                                }
                                that.emit('dataSaved', data);

                                // 注意：先触发上面的数据保存事件，后设置分析模型的id
                                that.analysisId = analysisId;

                                // 请求操作成功
                                text = '已成功保存至"' + analysisType + '"列表!';
                                success = true;
                            } else {
                                // 请求操作失败
                                text = e.responseJSON.message;
                                success = false;
                            }
                        } else {
                            // 请求失败
                            text = e.statusText;
                            success = false;
                        }
                        AppPage.responsePrompt(text, success, function animationend() {
                            $(target).removeClass('icon-loading');
                        });
                    }
                });
            },

            // 确认保存的分析数据是否合法
            validAnalysisSaveData: function(analysisData) {

                var valid = true,
                    msg = '';

                // 若未输入标题
                if (!analysisData.analysisTitle) {
                    valid = false;
                    msg = '您还未输入分析模型的名称！';
                }
                // 标题超500字节
                else if (analysisData.analysisTitle.length > 500) {
                    valid = false;
                    msg = '分析模型的名称不能超过500字！';
                }
                // 标题包含非法的代码
                else if (/(?:<\/?[a-z]\w*(?: [^>]*)?>)/i.test(analysisData.analysisTitle)) {
                    valid = false;
                    msg = '分析模型名称不能包含HTML标签！';
                }
                // 若未满足加入事件的条件
                else if (!this.validRequestActions(analysisData.requestData)) {
                    valid = false;
                    msg = this.invalidRequestActionsMsg;
                }
                return {
                    valid: valid,
                    msg: msg
                };
            },

            // 获取包装后的要保存的分析数据
            getAnalysisWrapperSaveData: function(saveData) {

                var data = {};

                data.id = this.analysisId || '';
                data.templateId = this.templateId;
                data.type = this.analysisType;
                data.comment = this.getAnalysisDesc(saveData);
                //data.desc = this.getAnalysisDesc(saveData);
                data.name = saveData.analysisTitle;
                //data.title = saveData.analysisTitle;
                //data.autoTitle = saveData.autoAnalysisTitle;
                data.file = JSON.stringify(saveData);
                //data.config = JSON.stringify(saveData);

                return data;
            },

            //获取标题下的描述
            getAnalysisDesc: function(saveData) {
                var groupFields_zh = saveData.requestZhData.groupFields_zh,
                    requestData = saveData.requestData,
                    desc = requestData.dateRangeText ? requestData.dateRangeText : '(' + [requestData.startDate, requestData.endDate].join('至') + ')';

                if (requestData.isCompare) {
                    desc += requestData.dateRangeText ? '对比' : '对比' + '(' + [requestData.compareStartDate, requestData.compareEndDate].join('至') + ')';
                }

                if (groupFields_zh.length > 0) {
                    desc += '，按' + groupFields_zh.join('和') + '分组';
                }
                //console.log(desc);
                return desc;
            },

            // 获取分析模型请求数据
            getAnalysisRequestData: function() {
                var requestData = this.getRequestData(),
                    requestZhData = this.extractRequestZhData(requestData),
                    analysisRequestData = {
                        requestData: requestData, // 请求数据
                        requestZhData: requestZhData, // 中文转述
                        isCompare: false // 默认是非对比数据
                    },
                    compareRequestData,
                    compareDateRange,
                    $dateRange = $('input[name="dateRange1"]');

                //获取日期区间的类型
                //                requestData.dateRangeType = $dateRange.attr('data-range');
                //                requestData.dateRangeText = $dateRange.attr('data-range-text');

                // 设置标题
                this.setAnalysisTitle(requestZhData);

                // 若当前为对比状态，向请求数据集合中追加
                if (this.analysisMain.isCompare) {
                    compareDateRange = this.getDateRange(true);
                    requestData.compareStartDate = compareDateRange[0];
                    requestData.compareEndDate = compareDateRange[1];
                    analysisRequestData.isCompare = requestData.isCompare = true;
                }
                return analysisRequestData;
            },

            // 通过请求对象抽取出中文转述对象（注：同时对传入原对象的中文属性做筛除操作）
            extractRequestZhData: function(requestData) {

                var requestZhData = JSON.parse(JSON.stringify(requestData)),
                    filterCondition = requestData.filterCondition;

                requestData.actions.forEach(function(action) {
                    delete action.actionName_zh;
                    delete action.field_zh;
                    delete action.operation_zh;
                });

                if (filterCondition) {
                    filterCondition.conditions.forEach(function(condition) {
                        delete condition.values_zh;
                    });
                }

                delete requestData.unit_zh;
                delete requestData.groupFields_zh;
                return requestZhData;
            },

            // 获取请求数据（行为事件分析）
            getRequestData: function() {
                var requestData = {
                        //					"actions": [{
                        //						"actionName": "PayOrder",
                        //						"operation": "sum",
                        //						"field": "event.order_money"
                        //					}],
                        //					"unit": "day",
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
                    timeAxisUnit = this.getTimeAxisUnit();

                requestData = {
                    dateRangeType: dateRangeKit.dateRangeWord,
                    dateRangeText: dateRangeKit.dateRangeText,
                    startDate: dateRange[0],
                    endDate: dateRange[1],
                    actions: this.getActions(),
                    unit: timeAxisUnit.unit,
                    unit_zh: timeAxisUnit.unit_zh,
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

            // 设置请求数据对象的筛选条件
            setRequestDataFilterCondition: function(requestData, filterCondition) {
                // 若存在筛选条件才添加
                if (filterCondition.conditions[0]) {
                    requestData.filterCondition = filterCondition;
                };
                requestData.hasEmptyValueFilterCondition = filterCondition.hasEmptyValueFilterCondition;
                delete filterCondition.hasEmptyValueFilterCondition;
            },

            // 原始数据是否已设置过
            isOriginalDataSetted: function() {
                return !!this.originalData;
            },

            // 获取事件列表 ok!
            getActions: function() {
                var actions = [];

                if (this.isOriginalDataSetted()) {
                    actions = this.userEvents.getActions();
                }
                // 若还没有原始数据，设置分析模型默认数据
                else if (this.isSetDefaultActions) {
                    this.userEvents.setDefaultActions(actions);
                }
                //console.log(JSON.stringify(actions, null, 4));
                return actions;
            },

            // 获取时间轴单位 ok!
            getTimeAxisUnit: function() {
                var timeAxisUnit = this.analysisMain.getTimeAxisUnit();
                return timeAxisUnit;
            },

            // 获取筛选条件集 ok!
            getFilterCondition: function() {
                var filterCondition;

                //if (this.isOriginalDataSetted()) {
                filterCondition = this.filterConditions.getFilterCondition();
                //}
                return filterCondition;
            },

            // 获取查看属性 ok!
            getGroupFieldsKit: function() {
                var groupFieldsKit = {
                    groupFields: [],
                    groupFields_zh: []
                };

                if (this.isOriginalDataSetted()) {
                    groupFieldsKit = this.filterAttrs.getGroupFieldsKit();
                }
                return groupFieldsKit;
            },

            // 暂未知，默认返回空数组 ok!
            getBucketConditions: function() {
                var bucketConditions = [];
                return bucketConditions;
            },

            // 获取时间段 ok!
            // @isCompare 是否为对比时间段
            // return array (date format string)
            getDateRangeKit: function() {
                var dateRangeKit = this.analysisMain.getDateRangeKit();
                return dateRangeKit;
            },
            getDateRange: function(isCompare) {
                var dateRange = this.analysisMain.getDateRange(isCompare);
                return dateRange;
            },

            //{
            // 	"currentChart": "",
            // 	"analysisTitle": "",
            // 	"autoAnalysisTitle": "",
            // 	"requestData": {},
            // 	"requestZhData": {},
            //  "isCompare": false
            //}
            // 保存分析模型时需要获取的数据
            getAnalysisSaveData: function() {
                var analysisSaveData = this.getAnalysisRequestData(),
                    analysisTitles = this.getAnalysisTitles();

                analysisSaveData.analysisTitle = analysisTitles.analysisTitle;
                analysisSaveData.autoAnalysisTitle = analysisTitles.autoAnalysisTitle;
                analysisSaveData.currentChart = this.getCurrentChartType();

                // 清除过滤条件包含空值的判断
                delete analysisSaveData.requestData.hasEmptyValueFilterCondition;

                return analysisSaveData;
            },

            // 获取分析模型标题
            getAnalysisTitles: function(requestZhData) {
                return this.analysisMain.getAnalysisTitles();
            },

            // 获取当前显示图表的类型
            getCurrentChartType: function() {
                return this.analysisMain.getCurrentChartType();
            },

            // 设置分析模型原始数据，并渲染模型
            setOriginalData: function(analysisData) {

                var originalData = this.originalData = analysisData,
                    requestData = originalData.requestData,
                    requestZhData = originalData.requestZhData;

                // 若为新建分析模型
                if (this.analysisId === null) {
                    this.filterEvents.setOriginalData(requestData, requestZhData);
                }
                // 否则为编辑
                else {
                    this.analysisMain.setOriginalData(originalData);
                    //this.userEvents.setOriginalData(requestData);
                    this.eventAttrs.setOriginalData(requestData);
                    this.subjectAttrs.setOriginalData(requestData);
                    this.objectAttrs.setOriginalData(requestData);
                    this.filterEvents.setOriginalData(requestData);
                    this.filterAttrs.setOriginalData(requestData);
                    this.filterConditions.setOriginalData(requestData, requestZhData);
                }
            },

            // 设置分析模型的标题
            setAnalysisTitle: function(requestZhData) {
                this.analysisMain.setAnalysisTitle(requestZhData);
            },

            // 用户触发UI组件变动，请求数据重绘图表
            changeRequestRender: function() {
                var analysisData = this.getAnalysisRequestData();
                this.confirmRequestRender(analysisData, true);
            },

            // 确认是否满足请求的条件，做提示或最终请求操作
            // @isDataChange 定义是否为请求数据变更事件
            confirmRequestRender: function(analysisData, isDataChange) {

                var validResult = this.validRequestData(analysisData.requestData);

                if (!this.isOriginalDataSetted()) {
                    this.setOriginalData(analysisData);
                }

                // 确认请求数据是否满足必要的条件
                if (validResult.valid) {
                    // 请求数据变更事件
                    if (isDataChange) {
                        this.dataEmit('dataChange', analysisData);
                    }
                    // 原始分析请求数据已加载事件
                    else {
                        //this.setOriginalData(analysisData);
                        this.dataEmit('originalData', analysisData);
                    }
                }
                // 否则，触发请求数据未通过验证事件
                else {
                    this.dataInvalidEmit('dataInvalid', validResult, analysisData);
                }
                this.promptDataValidResult(validResult);
            },

            // 提示分析请求数据是否满足条件
            promptDataValidResult: function(validResult) {

                var promptBox = this.analysisMain.requestDataPromptLayer;

                if (!promptBox) {
                    promptBox = this.analysisMain.requestDataPromptLayer =
                        $('<div class="request-data-prompt" role="requestDataPromptLayer">' + '<div class="content">' + '<p class="invalid-text"></p>' + '<p class="prompt-text">请拖动左侧组件开始分析</p>' + '</div>' + '</div>').appendTo(this.analysisMain.root)[0];
                }

                if (validResult.valid) {
                    $(promptBox)
                        .removeClass('invalid')
                        .find('.invalid-text')
                        .html('');
                } else {
                    $(promptBox)
                        .addClass('invalid')
                        .find('.invalid-text')
                        .html(validResult.msg);
                }
            },

            // 触发事件的预处理（分析请求数据）
            dataEmit: function(type, analysisData) {
                return this.emit(type, analysisData);
            },

            // 触发事件的预处理（无效的分析请求数据）
            dataInvalidEmit: function(type, invalidResult, analysisData) {
                return this.emit(type, invalidResult.msg, analysisData);
            },

            // 验证分析数据是否满足请求的条件，返回一个描述对象
            validRequestData: function(requestData) {
                var valid = true,
                    msg = '',
                    filter = null;

                if (!this.validRequestActions(requestData)) {
                    valid = false;
                    msg = this.invalidRequestActionsMsg;
                    filter = this.filterEvents;
                } else if (!this.validRequestFilterCondition(requestData)) {
                    valid = false;
                    msg = this.invalidRequestFilterConditionMsg;
                    filter = this.filterConditions;
                }
                delete requestData.hasEmptyValueFilterCondition;
                return {
                    valid: valid,
                    msg: msg,
                    filter: filter
                };
            },

            // 验证行为分析事件是否合法
            validRequestActions: function(requestData) {
                return requestData.actions.length > 0;
            },

            // 行为分析非法请求数据信息提示
            invalidRequestActionsMsg: '还未添加用户行为事件！',
            invalidRequestFilterConditionMsg: '筛选条件还有未输入或未选择的项！',


            // 验证请求时是否包含空值的筛选条件
            validRequestFilterCondition: function(requestData) {
                return !requestData.hasEmptyValueFilterCondition;
            },

            //			// 请求渲染方法
            //			requestRender: null,
            //
            //			// 用原始数据请求
            //			originalDataRequestRender: function(requestRender) {
            //				var that = this;
            //				// 保存请求渲染的方法
            //				this.requestRender = requestRender;
            //				this.originalDataDefer.then(function(originalData) {
            //					that.requestRender(originalData.requestData, originalData.requestZhData, originalData.isCompare);
            //				});
            //			},

            // 重置
            resetAnalysis: function(e) {
                if (!this.originalData) {
                    return;
                }
                e.preventDefault();
                this.clearAnalysis();
                this.dataEmit('dataChange', this.originalData);
                this.setOriginalData(this.originalData);
            },

            // 清除设置项
            clearAnalysis: function() {
                //this.analysisMain.clearAnalysis();
                this.userEvents.clearAnalysis();
                this.filterEvents.clearAnalysis();
                this.filterAttrs.clearAnalysis();
                this.filterConditions.clearAnalysis();
            },

            // 图表刷新
            chartRestore: function() {
                AppPage.Echarts.myChart && AppPage.Echarts.myChart.resize();
            },

            // 分析请求等待加载
            loadingMask: function(b) {
                if (!this.$loadingLayer) {
                    this.$loadingLayer = $('<div class="loading-layer"></div>');
                    $(this.root).append(this.$loadingLayer);
                }
                b ? this.$loadingLayer.show() : this.$loadingLayer.hide();
            },

            // 提示框
            messageTips: function(text) {
                var $tipsBox = $('.message-tips'),
                    timer = null;
                if ($tipsBox.length === 0) {
                    $tipsBox = $('<div style="top: -80px" class="message-tips">' + text + '</div>');
                    $('body').append($tipsBox);
                }
                $tipsBox.html(text).stop().animate({
                    'top': 20
                });
                timer = window.setTimeout(function() {
                    $tipsBox.stop().animate({
                        'top': -80
                    });
                }, 3000);
            },
			
			setAttrsConditionsUnfixedBtnItems: function(){
				var values = this.eventAttrs.setUnfixedBtnItems()
				.concat(this.subjectAttrs.setUnfixedBtnItems())
				.concat(this.objectAttrs.setUnfixedBtnItems());
				
				this.filterAttrs.filterOptions(values);
				this.filterConditions.filterOptions(values);
			}

        });

        return UserAnalysis;

    });