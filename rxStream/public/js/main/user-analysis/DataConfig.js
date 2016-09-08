//
define([
	],
	function() {

		//		树枝 Branch
		//		树梢 Treetop
		//		树干 Trunk

		// 类构造函数
		function DataConfig() {}

		// 原型
		DataConfig.prototype = _.create(EventEmitter.prototype, {
			'constructor': DataConfig
		});


		// 原型扩展
		_.extend(DataConfig.prototype, {

			parent: null,
			children: null,
			childrenName: '',
			// branch name 分支名
			bname: '',

			/*dataTypeKey: 'childrenDataType',
			inputTypeKey: 'childrenType',
			dimensionIdKey: 'children',

			dataTypeKey: 'dataType',
			inputTypeKey: 'inputType',
			dimensionIdKey: 'dimensionId',*/

			dataTypeKey: 'dataType',
			inputTypeKey: 'inputType',
			dimensionIdKey: 'dimensionId',
			quotaPropsKey: 'children',
			valueKey: 'value',
			eventFieldKey: 'actionName',
			eventAttrFieldKey: 'field',
			attrFieldKey: 'field',
			
			b_dataTypeKey: 'dataType',
			b_inputTypeKey: 'filterModeValue',
			b_dimensionIdKey: 'id',
			b_quotaPropsKey: 'quotaProps',
			b_valueKey: 'name',

			// 初始化
			init: function(data, options) {
				this.children = data;
				//this.bname = options.bname;
				_.extend(this, options);
				this.addOperation();
				this.wrap();
				return this;
			},

			getEventsOperation: function(){
				return this.operation.events;
			},

			// 包装添加求值集合
			addOperation: function() {
				var operation, operation_1, operation_2, attrOperations;
				this.fixAttrsOperation();
				switch (this.bname) {
					case 'events':
						operation = this.getEventsOperation();
						operation_1 = operation.event;
						operation_2 = operation.eventAttr;

						this.children.forEach(function(branch) {
							var operations = this.cloneOperations(operation_1);
							
							// {quotaProps:[..]} -> {children:[..]}
							DataConfig.replaceKey(branch, this.b_quotaPropsKey, this.quotaPropsKey);
							// {name:'**'} -> {value:'**'}
							DataConfig.replaceKey(branch, this.b_valueKey, this.valueKey);
							// .name = actionName
							branch.name = this.eventFieldKey;
						
							if (branch.children) {
								branch.children = branch.children.filter(function(b) {
									
									if(b.visible){ // 原先用 b.operation
										b.children = this.cloneOperations(operation_2);
										b[this.inputTypeKey] = 'select-one';
										return true;
									}
								}, this);
								branch.children = operations.concat(branch.children);
							} else {
								branch.children = operations;
							}
							
							branch.children.concat(branch.subjectProps || [], branch.objectProps || []).forEach(function(b) {
								// {name:'**'} -> {value:'**'}
								DataConfig.replaceKey(b, this.b_valueKey, this.valueKey)
								// .name = field
								b.name = this.eventAttrFieldKey;
							}, this);
							
							
							branch[this.inputTypeKey] = 'select-one';
						}, this);
						
						break;

					case 'eventAttrs':
					case 'subjectAttrs':
					case 'objectAttrs':
						attrOperations = this.operation.eventAttrs;

						this.children.forEach(function(branch) {
							// {filterModeValue:'**'} -> {inputType:'**'}
							DataConfig.replaceKey(branch, this.b_inputTypeKey, this.inputTypeKey);
							// {name:'**'} -> {value:'**'}
							DataConfig.replaceKey(branch, this.b_valueKey, this.valueKey);
							// .name = field
							branch.name = this.attrFieldKey;
							
							var dataType = branch[this.b_dataTypeKey].toUpperCase(),
								operations = attrOperations[dataType],
								inputType = branch[this.inputTypeKey];
								//console.log(inputType);
							//var inputTypes = ['input', 'input', 'select-one', 'select-multiple', 'select-one', 'input-select-multiple'];
							
							operations = this.cloneOperations(operations, dataType, inputType,
								inputType.indexOf('select-') > -1 && branch[this.b_dimensionIdKey]);
							branch.children = operations;
							
						}, this);

						break;
				}
			},

			// clone求值集合
			cloneOperations: function(operations, dataType, inpuType, dimensionId) {
				return operations.map(function(operation) {
					var o = {
						label: operation.label,
						name: operation.name,
						value: operation.value
					};

					if(operation.dataType === 'boolean'){
						o[this.dataTypeKey] = operation.dataType;
					}
					else if (dataType) {
						switch(dataType){
							case 'DOUBLE':
							case 'LONG':
							case 'INTEGER':
								o[this.dataTypeKey] = dataType;
								o[this.inputTypeKey] = operation.inputType || inpuType;
							break;
							case 'DATE':
								o[this.dataTypeKey] = operation.dataType || dataType;
								o[this.inputTypeKey] = operation.inputType || inpuType;
							break;
							case 'STRING':
								o[this.dataTypeKey] = dataType;
								o[this.inputTypeKey] = inpuType || operation.inputType;
							break;
							case 'BOOLEAN':
							break;
							default:
						}
						dimensionId && (o[this.dimensionIdKey] = dimensionId);
					}
					return o;
				}, this);
			},

			// 修正属性相关字段
			fixAttrsOperation: function() {

				_.each(this.operation.eventAttrs, function(dataTypeOperations, dataType, collection) {

					dataTypeOperations.forEach(function(operation) {

						if (this.dataTypeKey !== 'dataType') {
							operation[this.dataTypeKey] = operation.dataType;
							delete operation.dataType;
						}
						if (operation.inputType !== undefined && this.inputTypeKey !== 'inputType') {
							operation[this.inputTypeKey] = operation.inputType;
							delete operation.inputType;
						}
						
					}, this);

					switch (dataType) {
						case 'number':
							collection['DOUBLE'] =
								collection['LONG'] =
								collection['INTEGER'] = collection[dataType];
							break;
					}
				}, this);
			},

			// 通过一组层级values获取一组级联分支
			// @return {Array}
			getCascadeBranchesByValues: function(values) {
				var branches = this.children,
					i = 0,
					branch,
					j = 0,
					l = values.lenght,
					value = values[j++],
					cascadeBranches = [];

				outer: while (branches) {
					while (branch = branches[i++]) {
						if (branch.value = value) {
							cascadeBranches.push(branch);
							if (j < l) {
								value = values[j++];
								branches = branch.children;
								continue outer;
							} else {
								return cascadeBranches;
							}
						}
					}
					return cascadeBranches;
				}
				return cascadeBranches;
			},

			// 通过一组层级values获取一个分支
			// @return {Array}
			getBranchByValues: function(values) {
				var cascadeBranches = this.getCascadeBranchesByValues(values);
				return cascadeBranches[values.length - 1];
			},

			// 通过值获取一个根分支
			getRootBranchByValue: function(value) {
				return _.find(this.children, function(branch) {
					return branch.value === value;
				})
			},

			// 判断一个分支是否全部选中
			checkBranchAllSelected: function(branch) {
				return (function isAllSelected(branch) {
					return !!branch.selected && (!branch.children || branch.children.every(function(b) {
						return isAllSelected(b);
					}));
				})(branch);
			},

			// 递归上升一个分支并清除选中，返回根分支
			clearBranchAllSelected: function() {
				(function clearAll(branches) {
					branches.forEach(function(branch) {
						delete branch.selected;
						if (branch.children) {
							clearAll(branch.children);
						}
					})
				})(this.children);
			},

			// 递归上升一个分支并清除选中，返回根分支
			// @return {Boolean}
			clearBranchSelected: function(branch) {
				do {
					if (branch.children && branch.children.some(function(b) {
							return b.selected;
						})) {
						return;
					}
					delete branch.selected;
				}
				while ((branch = branch.parent) && branch !== this);
			},

			// 递归上升一个分支并选中，返回根分支
			// return object (root branch)
			setBranchSelected: function(branch) {
				do {
					branch.selected = true;
				}
				while (branch.parent !== this && (branch = branch.parent));
				return branch;
			},

			// 递归上升一个分支并清除选中，返回根分支
			// return object (root branch)
			setBranchSelectedByValues: function(values) {
				do {
					branch.selected = true;
				}
				while ((branch = branch.parent) && branch !== this);
				return branch;
			},

			// 分配级联关系、分支名等属性
			wrap: function() {

				(function wrap(parent, arr, level, bname) {
					var _bname = bname + '_' + level;
					arr.forEach(function(branch, i) {
						branch.level = level;
						branch.parent = parent;
						branch.bname = _bname;
						branch.bid = _bname + '-' + i;
						branch.childrenName = branch.bid + '_' + level;

						// hash 关联化 bid（查找提速）
						this[branch.bid] = branch;
						
//						DataConfig.replaceKey(branch, this.b_valueKey, this.valueKey);
//						DataConfig.replaceKey(branch, '_name', 'name');
						
						if (branch.children && !branch.childrenDataType) {
							wrap.bind(this)(branch, branch.children, level + 1, branch.bid);
						}
					}, this);
				}).bind(this)(this, this.children, 1, this.bname);

				if (this.children.length > 0) {
					this.childrenName = this.children[0].bname;
					this.bname = this.childrenName.slice(0, this.childrenName.indexOf('_'));
				}
				//console.log(this);
				return this;
			},

			// 通过bid获取一个分支
			getBranchByBid: function(bid) {
				var branch = null;

				(function findBranch(branches) {
					return branches.some(function(b) {
						if (b.bid === bid) {
							branch = b;
							return true;
						} else if (b.children) {
							return findBranch(b.children);
						}
					});
				})(this.children);

				return branch;
			},

			// 通过bid获取一个分支（hash快速获取）
			getBranchByBid: function(bid) {
				return this[bid] || null;
			},

			// 通过bid获取一个分支（hash快速获取）
			getRootBranch: function(branch) {
				var rootBranch = branch;
				while (rootBranch.parent !== this) {
					rootBranch = rootBranch.parent;
				}
				return rootBranch;
			},

			// 通过bname获取分支数组（若无子分支，返回空数组）
			getBranchesByBname: function(bname) {
				var branches = [];

				this.childrenName === bname ?
					(branches = this.children) :
					(function findBranches(arr) {
						return arr.some(function(b) {
							if (b.childrenName === bname) {
								branches = b.children;
								return true;
							} else if (b.children) {
								return findBranches(b.children);
							}
						});
					})(this.data);

				return branches;
			},

			// 通过bname获取一个分支后，返回该分支的子分支数组数据（若无子分支，返回空数组）
			getChildBranchesByBname: function(bname) {
				var branches = [];

				this.bname === bname && this.children ?
					(branches = this.children) :
					(function findBranches(arr) {
						return arr.some(function(b) {
							if (b.bname === bname) {
								b.children && (branches = b.children);
								return true;
							} else if (b.children) {
								return findBranches(b.children);
							}
						});
					})(this.data);

				return branches;
			},

			// 判断一个分支是否全部选中
			isBranchAllSelectedByBid: function(bid) {
				var branch = this.getBranchByBid(bid);
				return (function isAllSelected(branch) {
					return branch.selected && (!branch.children || branch.children.every(function(b) {
						return isAllSelected(b);
					}));
				})(branch);
			},

			// 递归上升一个分支并清除选中，返回根分支
			// return object (root branch)
			clearAllSelected: function() {
				(function clearAll(branches) {
					branches.forEach(function(branch) {
						if (branch.selected) {
							delete branch.selected;
						}
						if (branch.children) {
							clearAll(branch.children);
						}
					})
				})(this.children);
			},

			// 递归上升一个分支并清除选中，返回根分支
			// return object (root branch)
			clearBranchSelected: function(branch) {
				do {
					if (branch.children && branch.children.some(function(b) {
							return b.selected;
						})) {
						return;
					}
					delete branch.selected;
				}
				while ((branch = branch.parent) && branch !== this);
			},

			// 递归上升一个分支并清除选中，返回根分支
			// return object (root branch)
			setBranchSelected: function(branch) {
				do {
					branch.selected = true;
				}
				while ((branch = branch.parent) && branch !== this);
			},

			"operation": { // 求值
				"events": {
					"event": [{
						"label": "总次数",
						"name": "operation",
						"value": "general"
					}, {
						"label": "独立用户数",
						"name": "operation",
						"value": "unique"
					}, {
						"label": "用户平均次数",
						"name": "operation",
						"value": "average"
					}],
					"eventAttr": [{
						"label": "总和",
						"name": "operation",
						"value": "sum"
					}, {
						"label": "均值",
						"name": "operation",
						"value": "avg"
					}, {
						"label": "最大值",
						"name": "operation",
						"value": "max"
					}, {
						"label": "最小值",
						"name": "operation",
						"value": "min"
					}, {
						"label": "人均值",
						"name": "operation",
						"value": "usravg"
					}]
				},
				// 事件属性和用户属性，根据 dataType 定义求值
				"eventAttrs": {
					"number": [{ //（DOUBLE|LONG|INTEGER）
						"label": "等于",
						"name": "expression",
						"value": "EQ",
						"dataType": "DOUBLE",
						"inputType": "input"
					}, {
						"label": "小于",
						"name": "expression",
						"value": "LT",
						"dataType": "DOUBLE",
						"inputType": "input"
					}, {
						"label": "大于",
						"name": "expression",
						"value": "GT",
						"dataType": "DOUBLE",
						"inputType": "input"
					}, {
						"label": "区间",
						"name": "expression",
						"value": "BETWEEN",
						"dataType": "DOUBLE",
						"inputType": "input"
					}],
					"BOOLEAN": [{
						"label": "为真",
						"name": "expression",
						"value": "TRUE",
						"dataType": "boolean"
					}, {
						"label": "为假",
						"name": "expression",
						"value": "FALSE",
						"dataType": "boolean"
					}, {
						"label": "有值",
						"name": "expression",
						"value": "ISET",
						"dataType": "boolean"
					}, {
						"label": "没有值",
						"name": "expression",
						"value": "NSET",
						"dataType": "boolean"
					}],
					"STRING": [{
						"label": "等于",
						"name": "expression",
						"value": "EQ",
						"dataType": "STRING",
						"inputType": "input"
					}, {
						"label": "不等于",
						"name": "expression",
						"value": "NE",
						"dataType": "STRING",
						"inputType": "input"
					}, {
						"label": "包含",
						"name": "expression",
						"value": "LIKE",
						"dataType": "STRING",
						"inputType": "input"
					}, {
						"label": "不包含",
						"name": "expression",
						"value": "NLIKE",
						"dataType": "STRING",
						"inputType": "input"
					}, {
						"label": "有值",
						"name": "expression",
						"value": "ISET",
						"dataType": "boolean"
					}, {
						"label": "没有值",
						"name": "expression",
						"value": "NSET",
						"dataType": "boolean"
					}],
					"DATE": [{
						"label": "有值",
						"name": "expression",
						"value": "ISET",
						"dataType": "boolean"
					}, {
						"label": "没有值",
						"name": "expression",
						"value": "NSET",
						"dataType": "boolean"
					}, {
						"label": "在N天之前",
						"name": "expression",
						"value": "DATERB",
						"dataType": "INTEGER",
						"inputType": "input"
					}, {
						"label": "在N天之内",
						"name": "expression",
						"value": "DATERW",
						"dataType": "INTEGER",
						"inputType": "input"
					}, {
						"label": "日期范围",
						"name": "expression",
						"value": "ABSBETWEEN",
						"dataType": "DATE",
						"inputType": "date-range"
					}]
				},
				"userAttrs": {
					"number": [],
					"STRING": [],
					"DATE": []
				}
			}

		})

		// 静态成员
		_.extend(DataConfig, {
			//
			create: function(data, options) {
				return new DataConfig().init(data, options);
			},

			// 判断一个分支是否全部选中
			// @branch object branch
			// return boolean
			isBranchAllSelected: function(branch) {
				return !!(function isAllSelected(branch) {
					return branch.selected && (!branch.children || branch.children.every(function(b) {
						return isAllSelected(b);
					}));
				})(branch);
			},
			
			replaceKey : function(obj, oldKey, newKey){
				if( (oldKey in obj) && oldKey !== newKey ){
					obj[newKey] = obj[oldKey];
					delete obj[oldKey];
				}
			},
		});

		return DataConfig;

	});