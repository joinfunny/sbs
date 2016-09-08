
(function(window, bas) {
	
	var innerText = 'innerText' in document.documentElement ? 'innerText' : 'textContent';
	var slice = Array.prototype.slice;
	var rSeparators = /\s*[,\/，、]\s*/;
	
	function isEmpty(str){
		return str === '没值' || str === '有值';
	}
	
	bas.getTreeByTable = function getTreeByTable(table, tree, treeName, level, branchLevel){
		var rows = table.tbodies[0].rows;
		getTreeByTableRows(rows, tree, treeName, level, branchLevel)
	}
	
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
	
		while(++i < trsLength){
			tr = trs[i];
			cells = tr.cells;
			cellsLength = cells.length;
			isBranchHead = branchLevel && !i;
			j = isBranchHead ? branchLevel : 0;
			cell = cells[j];
			tRowSpan = cell.rowSpan;
			iterm = {
				level: level,
				name: '',
				value: '',
				label: '',
				//childrenType: 'select', // || input || input-select
				//childrenName: '',
				//children: null,
			};
			
			iterm.name = treeName + '_' + level;
			iterm.value = iterm.name + '-' + (i - k);
			iterm.label = cell[innerText].trim();
			//console.log(isBranchHead)
			if(j < cellsLength - 1){
				if(tRowSpan > maxRowSpan){
					k += tRowSpan - 1;
					iterm.childrenType = 'select';
					iterm.childrenName = iterm.value + '_' + (level + 1);
					iterm.children = [];
					rows = trs.slice(i, i += tRowSpan);
					i--;
					getTreeByTableRows(rows, iterm.children, iterm.value, level+1, isBranchHead ? branchLevel+1 : 1);
				}
				else {
					if(!isEmpty(iterm.label) && !isEmpty(cells[j+1][innerText].trim())){
						if(cells[j+1].rowSpan > 1){
							lastCellText = cells[j+1][innerText].trim();
							lastChildrenType = iterm.childrenType = lastCellText ? 'input-select' : 'input';
							lastChildren = iterm.children = lastCellText.split(rSeparators);
						}
						else{
							iterm.childrenName = iterm.value + '_' + (level + 1);
							iterm.children = [];
							getTreeByTds(slice.call(cells, j+1), iterm.children, iterm.value, level+1);
						}
					}
				}
			}
			else{
				if(!isEmpty(iterm.label) && lastChildren){
					iterm.childrenType = lastChildrenType;
					iterm.children = lastChildren;
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
					level: level,
					name: '',
					value: '',
					label: '',
					//childrenType: 'select', // || input || input-select
					//childrenName: '',
					//children: null
				};
				iterm.name = treeName + '_' + level;
				iterm.value = iterm.name + '-' + i;
				iterm.label = td[innerText].trim();
				tree.push(iterm);
				if(i < l - 1){
					
					if(tds[i+1].rowSpan > 1){
						lastCellText = iterm.label;
						lastChildrenType = iterm.childrenType = lastCellText ? 'input-select' : 'input';
						lastChildren = iterm.children = lastCellText.split(rSeparators);
						break;
					}
					else{
						
					iterm.childrenType = 'select';
					iterm.childrenName = iterm.value + '_' + (level + 1);
					iterm.children = [];
					
					}
				}
				else{
					if(lastChildren){
						iterm.childrenType = lastChildrenType;
						iterm.children = lastChildren;
					}
				}
				level++;
				tree = iterm.children;
			}
		}
	}

})(this, this.bas);