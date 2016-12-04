// 转义实体字符
;
(function() {
	'use strict';

	var EntityChar = '&<> "' + "'",
		rEntityCharG = new RegExp('[' + EntityChar + ']', 'g'),
		MapEntityChar = {},

		// 转义实体名
		EntityName = 'amp|lt|gt|nbsp|quot|#39',
		rEntityNameG = new RegExp('&(?:' + EntityChar + ');', 'g'),
		MapEntityName = {},

		// 转义实体编号
		rEntityNumberG = /&#(\d+);/g,
		// unicode 字符编码
		rUnicodeG = /\\u([0-9a-fA-F]{4})/g,
		// escape 字符编码 替换为 unicode
		rEscapeToUnicodeG = /%([0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/g,
		// unicode 替换为 escape 字符编码
		rUnicodeToEscapeG = /\\u(00[0-9a-fA-F]{2}|[0-9a-fA-F]{4})/g,
		// 英文断句
		rRreakSentenceG = /([,\.\?!;:][\s"''")])(\n?)/g;

	EntityName.split('|').forEach(function(n, i) {
		MapEntityChar[i = EntityChar.charAt(i)] = (n = '&' + n + ';');
		MapEntityName[n] = i;
	});


	//-- function source --//

	var HTMLEscape = {

		// 断句
		breakSentence: function(str) {
			return str.replace(rRreakSentenceG, '$1\n');
		},

		// 实体字符 转义成 实体名
		// 如：& -> &amp;
		encodeEntityName: function(s) {
			return s.replace(rEntityCharG, function(m) {
				return MapEntityChar[m];
			});
		},

		// 实体名 解析为 实体字符
		// 如：&amp; -> &
		decodeEntityName: function(s) {
			return s.replace(rEntityNameG, function(m) {
				return MapEntityName[m];
			});
		},

		// 字符 转义成 实体编码（可用于中文）
		// 如：中 -> &#20013;
		encodeEntityNumber: function(s) {
			if (!s) {
				return '';
			}
			var a = [],
				l = s.length,
				i = -1;
			while (++i < l) {
				a[i] = s.charCodeAt(i);
			}
			return '&#' + a.join(';&#') + ';';
		},

		// 实体编码 解析为 字符（可用于中文）
		// 如：&#20013; -> 中
		decodeEntityNumber: function(s) {
			return s.replace(rEntityNumberG, function(m, n) {
				return String.fromCharCode(n);
			});
		},

		// 实体编码 转换成 unicode
		// 如：中 &#20013; -> \u4e2d
		fromEntityNumberToUnicode: function(s) {
			return s.replace(rEntityNumberG, function(m, n) {
				return '\\u' + String.padChar(parseInt(n).toString(16), '0', 4);
			});
		},

		// unicode 转换成 实体编码
		// 如：中 \u4e2d -> &#20013;
		fromUnicodeToEntityNumber: function(s) {
			return s.replace(rUnicodeG, function(m, n) {
				return '&#' + parseInt(n, 16) + ';';
			});
		},

		// gb2312 转换成 unicode （经过escape后二次转换）
		// 如：中 -> %u4E2D -> \u4e2d;
		fromChineseToUnicode: function(s) {
			return escape(s).replace(rEscapeToUnicodeG, function(m, n) {
				return (n.length > 3 ? '\\' : '\\u00') + n;
			});
		},

		// unicode 转换成 gb2312 （经过unescape后二次转换）
		// 如：\u4e2d -> %u4E2D -> 中 ;
		fromUnicodeToChinese: function(s) {
			return unescape(s).replace(rUnicodeToEscapeG, function(m, n) {
				return (n.indexOf('00') ? '%u' : '%') + n;
			});
		},

		// HTML 字符串编码转换
		// @s String
		// @oldEnCoding String Encoding Type
		// @newEnCoding String Encoding Type
		// return String newcEncoding
		convert: function(s, oldEncoding, newEncoding) {
			newEncoding = newEncoding.toLowerCase();
			switch (oldEncoding.toLowerCase()) {
				case 'utf':
				case 'unicode':
					switch (newEncoding) {
						case 'gbk':
						case 'gb2312':
						case 'gb':
						case 'chinese':
							return HTMLEscape.fromUnicodeToChinese(s);
						case 'htmlentitynumber':
						case 'entitynumber':
							return HTMLEscape.fromUnicodeToEntityNumber(s);
					}
					break;

				case 'gbk':
				case 'gb2312':
				case 'gb':
				case 'chinese':
					switch (newEncoding) {
						case 'utf':
						case 'unicode':
							return HTMLEscape.fromChineseToUnicode(s);
						case 'htmlentitynumber':
						case 'entitynumber':
							return HTMLEscape.encodeEntityNumber(s);
					}
					break;

				case 'htmlentitynumber':
				case 'entitynumber':
					switch (newEncoding) {
						case 'gbk':
						case 'gb2312':
						case 'gb':
						case 'chinese':
							return HTMLEscape.decodeEntityNumber(s);
						case 'utf':
						case 'unicode':
							return HTMLEscape.fromEntityNumberToUnicode(s);
					}
					break;
			}
			throw new TypeError("can't convert" + oldEncoding + "to" + newEncoding);
		}
	};

	var exports = this;

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return HTMLEscape;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = HTMLEscape;
	} else {
		exports.HTMLEscape = HTMLEscape;
	}

}.call(this));