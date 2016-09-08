(function(window, _) {

	// 命名空间
	Object.ns = Object.namespace = function namespace(NS, name, ns) {

		NS || (NS = window);

		if (typeof NS === 'string') {
			ns = name;
			name = NS;
			NS = window;
		}

		if (!name) {
			return;
		} else if (typeof name !== 'string') {
			return _.merge(NS, name)
		}

		var names = name.split('.'),
			i = -1,
			l = names.length - 1;
		// 获取
		if (ns === undefined) {
			for (; ++i < l;) {
				if (!(NS = NS[names[i]])) {
					return;
				}
			}
			return NS[names[l]];
		} else {
			for (; ++i < l;) {
				NS = NS[names[i]] || (NS[names[i]] = {});
			}
			if (NS[names[l]]) {
				return _.merge(NS[names[l]], ns);
			} else {
				return NS[names[l]] = ns;
			}
		}
	};

	Object.ns('bas.UBA', {
		// 行为分析
		Behavior: {

			// 事件名称
			actions: {
				dataTree: {
					url: '../data/behavior/actions.json',
					'level': 0,
					'bname': 'actions',
					'label': '事件类型',
					'childrenName': 'actions_1',
					'children': []
				}
			},
			// 事件属性
			actionAttrs: {
				dataTree: {
					url: '../data/behavior/actionAttrs.json',
					'level': 0,
					'bname': 'actionAttrs',
					'label': '事件属性',
					'childrenName': 'actionAttrs_1',
					'children': []
				}
			},
			// 过滤器
			userAttrs: {
				dataTree: {
					url: '../data/behavior/userAttrs.json',
					'level': 0,
					'bname': 'userAttrs',
					'label': '用户属性',
					'childrenName': 'userAttrs_1',
					'children': []
				}
			}

		},
		// 漏斗分析
		Funnel: {

			// 事件
			Events: {
				tree: {
					treeUrl: '../data/funnel/events.json',
					'level': 0,
					'name': 'eventTypes',
					'label': '事件类型',
					'childrenName': 'eventTypes_1',
					'children': []
				}
			},
			// 维度（主面板与过滤器合并）
			Dimension: {
				tree: {
					treeUrl: '../data/funnel/dimension.json',
					'level': 0,
					'name': 'dimension',
					'label': '维度',
					'childrenName': 'dimension_1',
					'children': []
				}
			},
			// 过滤器
			Filter: {
				tree: {
					treeUrl: '../data/funnel/filter.json',
					'level': 0,
					'name': 'filters',
					'label': '过滤器',
					'childrenName': 'filters_1',
					'children': []
				}
			}
		},
		// 留存分析
		Retained: {

			// 事件
			Events: {
				tree: {
					treeUrl: '../data/retained/events.json',
					'level': 0,
					'name': 'eventTypes',
					'label': '事件类型',
					'childrenName': 'eventTypes_1',
					'children': []
				}
			},
			// 维度（主面板与过滤器合并）
			Dimension: {
				tree: {
					treeUrl: '../data/retained/dimension.json',
					'level': 0,
					'name': 'dimension',
					'label': '维度',
					'childrenName': 'dimension_1',
					'children': []
				}
			},
			// 过滤器
			Filter: {
				tree: {
					treeUrl: '../data/retained/filter.json',
					'level': 0,
					'name': 'filters',
					'label': '过滤器',
					'childrenName': 'filters_1',
					'children': []
				}
			}
		},
		// 回访频次
		Revisit: {

			// 事件
			Events: {
				tree: {
					treeUrl: '../data/revisit/events.json',
					'level': 0,
					'name': 'eventTypes',
					'label': '事件类型',
					'childrenName': 'eventTypes_1',
					'children': []
				}
			},
			// 维度（主面板与过滤器合并）
			Dimension: {
				tree: {
					treeUrl: '../data/revisit/dimension.json',
					'level': 0,
					'name': 'dimension',
					'label': '维度',
					'childrenName': 'dimension_1',
					'children': []
				}
			},
			// 过滤器
			Filter: {
				tree: {
					treeUrl: '../data/revisit/filter.json',
					'level': 0,
					'name': 'filters',
					'label': '过滤器',
					'childrenName': 'filters_1',
					'children': []
				}
			}
		}
	});

})(this, this._);