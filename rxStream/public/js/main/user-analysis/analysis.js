// 
define([
	'main/user-analysis/common',
	],
	function(AppPage) {

		// 操作分析类的方法集
		var analysis = {

			// 创建分析模型（通过继承创建各分析部件类子集来构建）
			createModel: function(analysisType, partClasses) {
				var model = {
					analysisType: analysisType
				};
				partClasses.forEach(function(partClass) {
					var name = partClass.name;
					// 类构造函数（行为事件分析）
					model[name] = function() {};
					// 原型
					model[name].prototype = _.create(partClass.prototype, {
						'constructor': model[name]
					});

					// 静态方法
					model[name].create = partClass.create = analysis.create;

				});
				return model;
			},

			// 静态方法创建实例
			create: function(root, options) {
				return new this().init(root, options);
			},

			// 各类分析模型的初始化
			// @root DOMElement|String 模型根元素或其选择器
			// 
			initModel: function(model, root) {

				var UserAnalysis = model.UserAnalysis,
					AnalysisMain = model.AnalysisMain,
					Condition = model.Condition,
					Filter = model.Filter,
					analysisType = model.analysisType,
					isSetDefaultActions = !!model.isSetDefaultActions,

				// 实例的命名空间
				NSPrefix = 'AppPage.UserAnalysis',
				NS = NSPrefix + '.' + analysisType,
				analysisId = AppPage.queryString('id') || null,
				templateId = AppPage.getAnalysisTypeId(analysisType),
				analysisTypes = ['Event', 'Funnel', 'Retained', 'Revisit', 'Worth', 'Spread'],
				analysisTypesZh = {
					'Event': '用户行为分析',
					'Funnel': '漏斗分析',
					'Retained': '留存分析',
					'Revisit': '回放频率',
					'Worth': '价值分析',
					'Spread': '传播分析'
				},
				conditionsDataKey = {
					'events': 'events',
					'eventProps': 'eventAttrs',
					'allSubjectProps': 'subjectAttrs',
					'allObjectProps': 'objectAttrs'
				},
				initialMap = {
                	'events': 'e',
                	'eventAttrs': 'b',
                	'subjectAttrs': 's',
                	'objectAttrs': 'o'
            	},

				// 创建行为分析实例
				myAnalysis = UserAnalysis.create(root, {
					// 分析类型集
					analysisTypes: analysisTypes,
					// 分析类型中文名映射
					analysisTypesZh: analysisTypesZh,
					// 实例分配的命名空间
					NS: NS,
					// 分析模型id
					analysisId: analysisId,
					// 记录用户分析类型的id，创建分析模型时需要传参
					templateId: templateId,
					// 定义分析类型
					analysisType: analysisType,
					// 分析数据的url（从服务层获取）
					conditionsUrl: AppPage.UserAnalysis.conditionsUrl,
					// 获取分析模型原始数据url
					originalDataUrl: AppPage.UserAnalysis.originalDataUrl,
					// 保存分析数据url
					analysisDataUrl: AppPage.UserAnalysis.analysisDataUrl,
					// 是否设置默认行为
					isSetDefaultActions: isSetDefaultActions,
					// 用户配置数据 接口-前端 的对应键
					conditionsDataKey: conditionsDataKey,
					// 拖拽条件项的标识字母（映射到数据树的bname）
					initialMap: initialMap
				}),

				// 主面板实例
				analysisMain = AnalysisMain.create('.panel-main', {}),

				// 用户事件列表实例
				userEvents = Condition.create('.panel-user-events', {
					// 加入筛选的条件类别（行为事件）
					conditionNames: ['events'],
					conditionType: 'userEvents'
				}),

				// 事件属性列表实例
				eventAttrs = Condition.create('.panel-attrs-event', {
					// 设置默认展开
					unfolded: true,
					conditionNames: ['eventAttrs'],
					// 固有属性前缀
					fixedPrefix: 'b_dollar_',
					// 筛选条件类型
					conditionType: 'eventAttrs'
				}),

				// 主体属性列表实例
				subjectAttrs = Condition.create('.panel-attrs-subject', {
					conditionNames: ['subjectAttrs'],
					// 固有属性前缀
					fixedPrefix: 'o_dollar_',
					// 筛选条件类型
					conditionType: 'subjectAttrs'
				}),

				// 客体属性列表实例
				objectAttrs = Condition.create('.panel-attrs-object', {
					conditionNames: ['objectAttrs'],
					// 固有属性前缀
					fixedPrefix: 'o_dollar_',
					// 筛选条件类型
					conditionType: 'objectAttrs'
				}),

				// 用户行为筛选器实例
				filterEvents = Filter.create('.panel-filter-events', {
					// 筛选器类型
					filterType: 'filterEvents'
				}),

				// 属性筛选器实例
				filterAttrs = Filter.create('.panel-filter-attrs', {
					// 只显示条件选项，不关联联动选填项
					onlyCondition: true,
					// 筛选器类型
					filterType: 'filterAttrs'
				}),

				// 条件筛选器实例
				filterConditions = Filter.create('.panel-filter-conditions', {
					// 筛选条件具备关联关系（或/与）
					hasRelation: true,
					// 筛选器类型
					filterType: 'filterConditions',
					// 维度字典url
					dimensionDataUrl: AppPage.UserAnalysis.dimensionDataUrl,
					// 维度显示选项数量
					dimensionShowCount: 100,
					// 维度字典数据的名称键
					dimensionDataNameKey: AppPage.UserAnalysis.dimensionDataNameKey,
					// 维度字典数据的值键
					dimensionDataValueKey: AppPage.UserAnalysis.dimensionDataValueKey,
					// 过滤条件值的名称name
					conditionValuesName: AppPage.UserAnalysis.conditionValuesName
				});

				// 分配用户行为分析实例到全局命名空间
				Object.ns(NS, myAnalysis);

				// 配置关联筛选器
				userEvents.relatedFilters = [filterEvents];
				eventAttrs.relatedFilters = [filterAttrs, filterConditions];
				subjectAttrs.relatedFilters = [filterAttrs, filterConditions];
				objectAttrs.relatedFilters = [filterAttrs, filterConditions];

				// 配置关联筛选条件源（用户行为、行为属性和用户属性）实例
				filterEvents.relatedConditions = [userEvents];
				filterAttrs.relatedConditions = [eventAttrs, subjectAttrs, objectAttrs];
				filterConditions.relatedConditions = [eventAttrs, subjectAttrs, objectAttrs];

				// 条件筛选面板的父元素操作的样式类合集
				myAnalysis.filterAllStateWrapperClasses = [
					// 以下为简化操作，只通过操作父元素样式类来操作
					// 配置筛选器作为拖拽目标时的操作
					filterEvents.wrapperHintClass = 'filter-events-hint',
					filterAttrs.wrapperHintClass = 'filter-attrs-hint',
					filterConditions.wrapperHintClass = 'filter-conditions-hint',
					
					// 筛选器的激活样式类
					filterEvents.wrapperActivedClass = 'filter-events-actived',
					filterAttrs.wrapperActivedClass = 'filter-attrs-actived',
					filterConditions.wrapperActivedClass = 'filter-conditions-actived',
					
					// 筛选器的鼠标进入样式类
					filterEvents.wrapperMouseenterClass = 'filter-events-mouseenter',
					filterAttrs.wrapperMouseenterClass = 'filter-attrs-mouseenter',
					filterConditions.wrapperMouseenterClass = 'filter-conditions-mouseenter'
				].join(' ');

				// 将页面组件分配到全局命名空间下
				_.each({
						analysisMain: analysisMain,
						userEvents: userEvents,
						eventAttrs: eventAttrs,
						subjectAttrs: subjectAttrs,
						objectAttrs: objectAttrs,
						filterEvents: filterEvents,
						filterAttrs: filterAttrs,
						filterConditions: filterConditions
					},
					function(instance, name) {
						// 添加到行为分析实例的子组件集
						myAnalysis.appendChild(instance);
						// 子实例的命名空间
						instance.NS = NS + '.' + name;
						// 将子实例分配到父实例的属性
						myAnalysis[name] = Object.ns(instance.NS, instance);
					});

				// 渲染实例及子实例
				myAnalysis.render();

				return myAnalysis;

			}

		};

		return analysis;

	});