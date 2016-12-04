// fuck android some browsers
;
(function() {
	'use strict';

	var CSS = window.CSS || (window.CSS = {});
	var HTML = document.documentElement;

	function extend(target, src) {
		for (var k in src) {
			target[k] = src[k];
		}
		return target;
	};

	var Vendor = {};
	var properties = ['transition', 'animation', 'transform'];

	(function() {
		var vendors = ['', 'webkit', 'Moz', 'ms', 'O'],
			style = HTML.style,
			i = -1,
			l = vendors.length,
			j,
			prop, Prop, vendor;

		while (prop = properties[++i]) {
			j = -1;
			while (++j < l) {
				vendor = vendors[j];
				Prop = j ? capitalize(prop) : prop;
				vendor += Prop;
				if (vendor in style) {
					Vendor[prop] = vendor;
					break;
				}
			}
		}

		function capitalize(s) {
			return s.charAt(0).toUpperCase() + s.substring(1);
		}
	})();

	var support = Vendor.transition !== undefined;

	var EventTypes = {
		transitionstart: ['transitionstart', 'webkitTransitionStart', 'MSTransitionStart', 'oTransitionStart' /*, 'otransitionstart'*/ ],
		transitionend: ['transitionend', 'webkitTransitionEnd', 'MSTransitionEnd', 'oTransitionEnd' /*, 'otransitionend'*/ ],
		animationstart: ['animationstart', 'webkitAnimationStart', 'MSAnimationStart', 'oAnimationStart' /*, 'oanimationstart'*/ ],
		animationend: ['animationend', 'webkitAnimationEnd', 'MSAnimationEnd', 'oAnimationEnd' /*, 'oanimationend'*/ ]
	};

	var rCSS3Prop = new RegExp('(' + properties.join('|') + ')'); ///(transition|transform|animation)/;
	function prefixStyle(style) {
		var vendor;
		if (rCSS3Prop.test(style)) {
			if (vendor = Vendor[RegExp.$1]) {
				return vendor + style.charAt(0).toUpperCase() + style.slice(1);
			}
		}
		return style;
	}

	var Styles = {
		transform: prefixStyle('transform'),
		transformOrigin: prefixStyle('transformOrigin'),
		transition: prefixStyle('transition'),
		transitionProperty: prefixStyle('transitionProperty'),
		transitionDuration: prefixStyle('transitionDuration'),
		transitionTimingFunction: prefixStyle('transitionTimingFunction'),
		transitionDelay: prefixStyle('transitionDelay'),
		animation: prefixStyle('animation'),
		animationName: prefixStyle('animationName'),
		animationDuration: prefixStyle('animationDuration'),
		animationTimingFunction: prefixStyle('animationTimingFunction'),
		animationDelay: prefixStyle('animationDelay'),
		animationIterationCount: prefixStyle('animationIterationCount'),
		animationDirection: prefixStyle('animationDirection'),
		animationPlayState: prefixStyle('animationPlayState')
	}

	var rScale = /scale\(([^,]+),\s*([^)]+)\)/;
	var rMatrixScale = /matrix\(([^,]+),(?:\s*[^,]+,){2}\s*([^,]+)/;
	var rTranslate = /translate\(([^,]+),\s*([^)]+)\)/;
	var rTransformOrigin = /^\s*(\S+)\s+(\S+)\s*$/;

	var CSS3 = CSS.CSS3 = {
		Vendor: Vendor,
		support: support,
		properties: properties,
		EventTypes: EventTypes,
		Styles: Styles,
		//
		getScale: function getScale(transform) {
			return rScale.test(transform) || rMatrixScale.test(transform) ? {
				scaleX: parseFloat(RegExp.$1),
				scaleY: parseFloat(RegExp.$2)
			} : {
				scaleX: 1,
				scaleY: 1
			};
		},
		getTranslate: function getTranslate(transform) {
			return rTranslate.test(transform) ? {
				translateX: parseFloat(RegExp.$1),
				translateY: parseFloat(RegExp.$2)
			} : {
				translateX: 0,
				translateY: 0
			};
		},
		getTransform: function getTransform(transform) {
			var t = {
				scaleX: 1,
				scaleY: 1,
				translateX: 0,
				translateY: 0
			};
			if (rScale.test(transform)) {
				t.scaleX = parseFloat(RegExp.$1), t.scaleY = parseFloat(RegExp.$2);
			}
			if (rTranslate.test(transform)) {
				t.translateX = parseFloat(RegExp.$1), t.translateY = parseFloat(RegExp.$2);
			}
			return t;
		},
		getTransformOrigin: function getTransformOrigin(transformOrigin) {
			return rTransformOrigin.test(transformOrigin) ? {
				x: parseFloat(RegExp.$1),
				y: parseFloat(RegExp.$2)
			} : {
				x: null,
				y: null
			};
		},
		scale2Css: function scale2Css(scaleX, scaleY) {
			return typeof scaleY === 'number' ?
				('scale(' + scaleX + ', ' + scaleY + ')') :
				typeof scaleX === 'number' ?
				('scale(' + scaleX + ', ' + scaleX + ')') :
				('scale(' + scaleX.scaleX + ', ' + scaleX.scaleY + ')');
		},
		tanslate2Css: function tanslate2Css(translateX, translateY) {
			return typeof translateY === 'number' ?
				'translate(' + translateX + 'px, ' + translateY + 'px)' :
				typeof translateX === 'number' ?
				'translate(' + translateX + 'px, ' + translateX + 'px)' :
				'translate(' + translateX.translateX + 'px, ' + translateX.translateY + 'px)';
		},
		tanslate3d2Css: function tanslate3d2Css(x, y, z) {
			return 'translate3d(' + (x||0) + 'px, ' + (y||0) + 'px, ' + (z||0) + 'px)';
		},
		transform2Css: function transform2Css(transform) {
			return 'scale(' + transform.scaleX + ', ' + transform.scaleY + ')' +
				'translate(' + transform.translateX + 'px, ' + transform.translateY + 'px)';
		},
		transformOrigin2Css: function transformOrigin2Css(x, y) {
			return arguments.length < 2 ? x + ' ' + y : x + ' ' + x;
		},
	};

	//
	var exports = this;

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return CSS3;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = CSS3;
	} else {
		exports.CSS3 = CSS3;
	}

	//return CSS3;


}.call(this));