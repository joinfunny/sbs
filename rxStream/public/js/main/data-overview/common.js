// 
define([
		__path + '/main/js/common',
		__path + '/js/zCool/zCool',
		__path + '/js/zCool/zCool.Form'
	],
	function(AppPage, $, $Form) { // $ => zCool

		//	$('.btn-add-analysis').on('click', function(){
		//		$('.analysis-list-panel').concat([this]).toggleClass('show-analysis');
		//	});
		//	
		//	$('.analysis-list-panel .btn-confirm').on('click', function(){
		//		$('.analysis-list-panel, .btn-add-analysis').removeClass('show-analysis');
		//	});

		$('form').each(function(form) {
			$Form(form);
		});

		$.noConflict();

		//		
		var exports = this;

		// Expose the class either via AMD, CommonJS or the global object
		if (typeof define === 'function' && define.amd) {
			define(function() {
				return $;
			});
		} else if (typeof module === 'object' && module.exports) {
			module.exports = $;
		} else {
			exports.zCool = $;
		}

		return $;

	});