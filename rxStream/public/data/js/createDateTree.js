
(function(window, bas) {
	
	var innerText = 'innerText' in document.documentElement ? 'innerText' : 'textContent';
	var slice = Array.prototype.slice;
	var rSeparators = /\s*[,\/，、]\s*/;
	
	function isEmpty(str){
		return str === '' || str === '无'/* || str === '没有值' || str === '有值' || str === '没值'*/;
	}
	function isBoolean(str){
		return str === '没有值' || str === '有值' || str === '没值';
	}
	
	bas.getTreeByTable = function getTreeByTable(table, tree, treeName, level, branchLevel){
		var rows = table.tbodies[0].rows;
		getTreeByTableRows(rows, tree, treeName, level, branchLevel)
	}
	
	// 确认是否包装数据
	var needWrap = false;
	
	bas.getTreeByTableRows = function getTreeByTableRows(rows, tree, treeName, level, branchLevel){
		var trs = slice.call(rows);
		var tr;
		var trsLength = trs.length;
		var i = -1;
		var cells;
		var cell;
		var cellsLength;
		var j;
		var maxRowSpan = 1;
		var tRowSpan = 1;
		var k = 0;
		var iterm;
		var isBranchHead;
		var lastCellText;
		var lastChildrenType;
		var lastChildren;
		var lastDataType;
	
		while(++i < trsLength){
			tr = trs[i];
			cells = tr.cells;
			cellsLength = cells.length;
			isBranchHead = branchLevel && !i;
			j = isBranchHead ? branchLevel : 0;
			cell = cells[j];
			tRowSpan = cell.rowSpan;
			iterm = {
				//level: level,
				//bname: '',
				//bid: '',
				//name: '',
				//value: '',
				//label: ''
				//childrenType: 'select', // || input || input-select
				//childrenName: '',
				//children: null,
			};
			
			if(needWrap){
				level: level,
				iterm.bname = treeName + '_' + level;
				iterm.bid = iterm.bname + '-' + (i - k);
			}
			iterm.label = cell[innerText].trim();
			iterm.name = cell.dataset.name;
			iterm.value = cell.dataset.value;
			
			//console.log(isBranchHead)
			if(j < cellsLength - 1){
				if(tRowSpan > maxRowSpan){
					k += tRowSpan - 1;
					iterm.childrenType = 'select';
					
					if(needWrap){
					iterm.childrenName = iterm.bid + '_' + (level + 1);
					}
					iterm.children = [];
					rows = trs.slice(i, i += tRowSpan);
					i--;
					getTreeByTableRows(rows, iterm.children, iterm.bid, level+1, isBranchHead ? branchLevel+1 : 1);
				}
				else {
					lastCellText = cells[j+1][innerText].trim();
					if(!isEmpty(iterm.label) && !isEmpty(lastCellText)){
						if(cells[j+1].rowSpan > 1){
							lastDataType = cells[j+1].dataset.type;
							lastDataType && (iterm.childrenDataType = lastDataType);
							if(lastDataType !== 'boolean'){
								lastChildrenType = iterm.childrenType = cells[j+1].dataset.childrenType || 'input-select-multiple';
								lastChildren = iterm.children = lastCellText.split(rSeparators);
							}
						}
						else{
							
							if(needWrap){
								iterm.childrenName = iterm.bid + '_' + (level + 1);
							}
							iterm.children = [];
							getTreeByTds(slice.call(cells, j+1), iterm.children, iterm.bid, level+1);
						}
					}
					else if(!lastCellText || isBoolean(iterm.label)){
						lastDataType = cells[j+1].dataset.type;
						lastDataType && (iterm.childrenDataType = lastDataType);
						if(lastDataType !== 'boolean'){
							lastChildrenType = iterm.childrenType = 'input';
							lastChildren = iterm.children = [''];
						}
					}
				}
			}
			else{
				
//				if(tRowSpan > maxRowSpan){
//					if(isEmpty(iterm.label)){
//						lastChildrenType = lastChildren = undefined;
//					}
//				}
				
				if(!isEmpty(iterm.label) && lastChildren){
					lastDataType && (iterm.childrenDataType = lastDataType);
					if(lastDataType !== 'boolean'){
						iterm.childrenType = lastChildrenType;
						iterm.children = lastChildren;
					}
				}
			}
			tree.push(iterm);
		}
		
		function getTreeByTds(tds, tree, treeName, level){
			var l = tds.length;
			var i = -1;
			var td;
			var iterm;
			while(++i < l){
				td = tds[i];
				iterm = {
					//level: level,
					//bname: '',
					//bid: '',
					//name: '',
					//value: '',
					//label: '',
					//childrenType: 'select', // || input || input-select
					//childrenName: '',
					//children: null
				};
				
				if(needWrap){
					level: level,
					iterm.bname = treeName + '_' + level;
					iterm.bid = iterm.bname + '-' + i;
				}
				iterm.label = td[innerText].trim();
				iterm.name = td.dataset.name;
				iterm.value = td.dataset.value;
				tree.push(iterm);
				if(i < l - 1){
					
					if(tds[i+1].rowSpan > 1){
						lastDataType = tds[i+1].dataset.type;
						lastDataType && (iterm.childrenDataType = lastDataType);
						lastCellText = iterm.label;
						if(lastDataType !== 'boolean'){
							lastChildrenType = iterm.childrenType = lastCellText ? 'input-select' : 'input';
							lastChildren = iterm.children = lastCellText.split(rSeparators);
						}
						break;
					}
					else{
						
						if(needWrap){
							iterm.childrenName = iterm.bid + '_' + (level + 1);
						}
						iterm.childrenType = 'select';
						iterm.children = [];
					}
				}
				else{
					if(lastChildren){
						lastDataType && (iterm.childrenDataType = lastDataType);
						if(lastDataType !== 'boolean'){
							iterm.childrenType = lastChildrenType;
							iterm.children = lastChildren;
						}
					}
				}
				level++;
				tree = iterm.children;
			}
		}
	}

})(this, this.bas);