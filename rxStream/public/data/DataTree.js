// 
define([
		__path + '/bower_components/lodash/lodash',
		__path + '/js/EventEmitter'
	],
	function(_, EventEmitter) {
		
//		树枝 Branch
//		树梢 Treetop
//		树干 Trunk

		// 类构造函数
		function DataTree() {}

		// 原型
		DataTree.prototype = _.create(EventEmitter.prototype, {
			'constructor': DataTree
		});
		

		// 原型扩展
		_.extend(DataTree.prototype, {
			
			parent: null,
			children: null,
			childrenName: '',
			// branch name 分支名
			bname: '',
			
			init: function(data, options) {
				this.children = data;
				this.bname = options.bname;
				this.wrap();
				return this;
			},
			
			wrap: function() {
				
				(function wrap(context, parent, arr, level, bname){
					var _bname =  bname + '_' + level;
					arr.forEach(function(branch, i){
						branch.level = level;
						branch.parent = parent;
						branch.bname = _bname;
						branch.bid = _bname + '-' + i;
						branch.childrenName = branch.bid + '_' + level;
						
						// hash 关联化 bid（查找提速）
						context[branch.bid] = branch;
						
						if(branch.children && !branch.childrenDataType){
							wrap(context, branch, branch.children, level + 1, branch.bid);
						}
					});
				})(this, this, this.children, 1, this.bname);
				
				if(this.children.length > 0){
					this.childrenName = this.children[0].bname;
					this.bname = this.childrenName.slice(0, this.childrenName.indexOf('_'));
				}
				return this;
			},
			
			// 通过一组values获取一个分支
			getBranchByValues: function(values) {
				var branches = this.children,
					i = 0,
					branch,
					j = 0,
					l = values.lenght,
					value = values[j++];
				
				outer: while(branches){
					while(branch = branchs[i++]){
						if(branch.value = value){
							if(j < l){
								value = values[j++];
								branches = branch.children;
								continue outer;
							}
							else{
								return branch;
							}
						}
					}
					return null
				}
				return null;
			},
			
			// 通过bid获取一个分支
			getBranchByBid: function(bid) {
				var branch = null;
				
				(function findBranch(branches){
					return branches.some(function(b){
						if(b.bid === bid){
							branch = b;
							return true;
						}
						else if(b.children){
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
				while(rootBranch.parent !== this){
					rootBranch = rootBranch.parent;
				}
				return rootBranch;
			},
			
			// 通过bname获取分支数组（若无子分支，返回空数组）
			getBranchesByBname: function(bname) {
				var branches = [];
				
				this.childrenName === bname ?
				(branches = this.children) :
				(function findBranches(arr){
					return arr.some(function(b){
						if(b.childrenName === bname){
							branches = b.children;
							return true;
						}
						else if(b.children){
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
				(function findBranches(arr){
					return arr.some(function(b){
						if(b.bname === bname){
							b.children && (branches = b.children);
							return true;
						}
						else if(b.children){
							return findBranches(b.children);
						}
					});
				})(this.data);
				
				return branches;
			},
			
			// 判断一个分支是否全部选中
			isBranchAllSelectedById: function(bid) {
				var branch = this.getBranchByBid(bid);
				return (function isAllSelected(branch){
					return branch.selected && (!branch.children || branch.children.every(function(b){
						return isAllSelected(b);
					}));
				})(branch);
			},
			
			// 递归上升一个分支并清除选中，返回根分支
			// return object (root branch)
			clearAllSelected: function() {
				(function clearAll(branches){
					branches.forEach(function(branch){
						if(branch.selected){
							delete branch.selected;
						}
						if(branch.children){
							clearAll(branch.children);
						}
					})
				})(this.children);
			},
			
			// 递归上升一个分支并清除选中，返回根分支
			// return object (root branch)
			clearBranchSelected: function(branch) {
				do{
					if(branch.children && branch.children.some(function(b){ return b.selected; })){
						return;
					}       
					delete branch.selected;
				}
				while((branch = branch.parent) && branch !== this);
			},
			
			// 递归上升一个分支并清除选中，返回根分支
			// return object (root branch)
			setBranchSelected: function(branch) {
				do{              
					branch.selected = true;
				}
				while((branch = branch.parent) && branch !== this);
			}
			
		})

		// 静态成员
		_.extend(DataTree, {
			//
			create: function(data, options) {
				return new DataTree().init(data, options);
			},
			
			// 判断一个分支是否全部选中
			// @branch object branch
			// return boolean
			isBranchAllSelected: function(branch) {
				return !!(function isAllSelected(branch){
					return branch.selected && (!branch.children || branch.children.every(function(b){
						return isAllSelected(b);
					}));
				})(branch);
			}
		});

//		//		
//		var exports = this;
//
//		// Expose the class either via AMD, CommonJS or the global object
//		if (typeof define === 'function' && define.amd) {
//			define(function() {
//				return DataTree;
//			});
//		} else if (typeof module === 'object' && module.exports) {
//			module.exports = DataTree;
//		} else {
//			exports.DataTree = DataTree;
//		}

		return DataTree;

	});