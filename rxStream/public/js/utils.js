// 公用配置
(function(window) {

	var sNativeCode = (parseInt + '').replace('parseInt', '');

	function isNative(m, o) {
		return !!(o = (o || window)[m]) && sNativeCode === String(o).replace(m, '');
	}
	
	function extend(){
	}
	
	// 重命名唯一
// @arrStr String Array
// @accumulator Function 可选项，默认使用内部累加器
function renameUnique(arrStr, accumulator){
	
	var newArrStr = [];
	accumulator || (accumulator = accu); 
	arrStr.map(function(str, i){
		var newStr = str, r = 0;
		while(newArrStr.indexOf(newStr) > -1){
			newStr = accumulator.call(this, str, r++);
		}
		newArrStr.push(newStr);
		return newStr;
	});
	return newArrStr;
	
	//@scope this
	//@str String 原数组每个相应元素字符串
	//@repeatNumber Number 已经重复的次数
	function accu(str, repeatNumber){
		return str + '(' + repeatNumber + ')';
	}
}
	
	
})(this);