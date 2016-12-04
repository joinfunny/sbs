;
(function(EventEmitter) {
	'use strict';
	
	var exports = this,
		extend = EventEmitter.extend;

	function Component() {}
	
	// 创建原型
	Component.prototype = Object.create(EventEmitter.prototype, {
		'constructor': Component
	});
	
	// 原型
	extend(Component.prototype, {
		
	});

 	// 静态成员
	extend(Component, {
		
	});

	var _Component = exports.Component;
		
	// 避免全局变量冲突的还原方法
	Component.noConflict = function noConflict() {
		exports.Component = _Component;
		return Component;
	};


	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return Component;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = Component;
	} else {
		exports.Component = Component;
	}

})(this.EventEmitter);