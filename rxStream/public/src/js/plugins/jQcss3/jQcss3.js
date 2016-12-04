// fuck android some browsers
define([
		'plugins/jQcss3/css3'
	],
	function(css3) {
		'use strict';

		$.each({
			on: $.fn.on,
			off: $.fn.off
		}, function(key, fn) {
			$.fn[key] = function(type, handleEvent) {
				var args = [].slice.call(arguments);
				var types = css3.EventTypes[type];
				if (types) {
					if (css3.support) {
						types.forEach(function(type) {
							args[0] = type;
							fn.apply(this, args);
						}, this);
					} else {
						if (key === 'off') {
							return this;
						} else {
							return this.each(function() {
								var that = this;
								setTimeout(function() {
									handleEvent.call(that);
								})
							});
						}
					}
				} else {
					fn.apply(this, args);
				}
				return this;
			}
		});

		var $fncss = $.fn.css;

		$.fn.css = function(style) {
			if (!style) {
				return $fncss.apply(this, arguments);
			}
			switch (typeof style) {
				case 'string':
					style = css3.Styles[style] || style;
					break;
				case 'object':
					$.each(style, function(value, key) {
						var k = css3.Styles[key];
						if (k) {
							delete style[key];
							style[k] = value;
						}
					});
					break;
			}
			return $fncss.apply(this, arguments);
		}

		return css3;

	});