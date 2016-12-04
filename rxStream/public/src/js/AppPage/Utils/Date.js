/*
 * zCool-1.0 Date - Javascript
 *
 * Copyright (c) 2008 BaiMin Zhou (zCool.cn)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2013-08-01 22:28:00 BeiJing $
 * $Revision: 3 $
 */

;
(function() {

	var ry = /y+/,
		rM = /M+/,
		rd = /d+/,
		rh = /h+/,
		rm = /m+/,
		rs = /s+/,
		rS = /S+/,

		ryG = /y+/g,
		rMG = /M+/g,
		rdG = /d+/g,
		rhG = /h+/g,
		rmG = /m+/g,
		rsG = /s+/g,
		rSG = /S+/g,

		rMdhmsG = /[Mdhms]+/g,
		rDigitsG = /\d+/g,

		// 每月天数（平年）
		monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	function extend(target, src) {
		for (var k in src) {
			src.hasOwnProperty(k) && (target[k] = src[k]);
		}
		return target;
	}

	// 扩展日期类的原型方法
	extend(Date.prototype, {

		// 获取当年每月天数
		// return array
		getDaysPerMonth: function() {
			var year = this.getFullYear(),
				d = monthDays.slice();
			(year % 4 || !(year % 400)) || (d[1] = 29);
			return d;
		},

		// 获取当年天数
		// return int 365|366
		getYearDays: function() {
			var year = this.getFullYear();
			return year % 4 || !(year % 400) ? 365 : 366;
		},

		// 获取当年当月天数
		// return int 28|29|30|31
		getMonthDays: function() {
			var M = this.getMonth(),
				year;
			if (M !== 1) {
				return monthDays[M];
			}
			year = this.getFullYear();
			return year % 4 || !(year % 400) ? 28 : 29;
		},

		// 判断当年是否为闰年
		// return boolean
		isLeapYear: function() {
			var year = this.getFullYear();
			return !(year % 4 || !(year % 400));
		},

		//		// 判断当年是否为平年
		//		isAverageYear: function(){
		//			var year = this.getFullYear();
		//			return !!(year%4) || !(year%400);
		//		},

		// 获取当月份自然数
		getRealMonth: function() {
			return this.getMonth() + 1;
		},

		// 设置当月份的自然数
		// @M 1-12
		// return
		setRealMonth: function(M) {
			return this.setMonth(M < 1 ? M : (M - 1));
		},

		// 获取当季度数
		// return int 1-4
		getQuarter: function() {
			return Math.floor((this.getMonth() + 3) / 3);
		},

		// 获取当季度第多少天
		// return int 90-92
		getQuarterDate: function() {
			var m = this.getMonth(),
				days;
			if (m == 0) {
				days = 0;
			} else {
				days = this.getDaysPerMonth().slice(Math.floor(m / 3) * 3, m).reduce(function(a, d) {
					return a + d;
				}, 0);
			}
			return days + this.getDate();
		},

		// 获取当年第多少天
		// return int 365|366
		getYearDate: function() {
			var m = this.getMonth(),
				days;
			m == 0 ? days = 0 : days = this.getDaysPerMonth().slice(0, this.getMonth()).reduce(function(a, d) {
				return a + d;
			});
			/*return this.getDaysPerMonth().slice(0, this.getMonth()).reduce(function (a, d) {
			        return a + d;
			    }) + this.getDate();*/
			return days + this.getDate();
		},

		// 获取当年周数
		getYearWeek: function() {

		},

		// 获取当季周数
		getQuarterhWeek: function() {

		},

		// 获取当月周数
		getMonthWeek: function() {

		},

		// 返回格式化后的日期格式
		// @format string 'yyyy-MM-dd hh:mm:ss SSS' | 'yyyy-MM-ddThh:mm:ss.SSSZ'
		// return string '2016-11-11 11:11:11 111' |'2016-11-11T11:11:11 111Z'
		format: function(format) {

			format || (format = Date.FORMAT);

			var d = this,
				a = [
					//[ry, "getFullYear"] //year
					[rM, "getRealMonth"] //month + 1
					,
					[rd, "getDate"] //day
					,
					[rh, "getHours"] //hour
					,
					[rm, "getMinutes"] //minute
					,
					[rs, "getSeconds"] //second
					//,[rS, "getMilliseconds"] //millisecond
					//,["q", "getQuarter"]  //quarter
				],
				i = 0,
				l = a.length;

			format = format.replace(ry, function(m) {
				return (d.getFullYear() + '').substr(-m.length);
			});

			for (; i < l; i++) {
				format = format.replace(a[i][0], function(m) {
					var p = d[a[i][1]]();
					return (p > 9 || m.length < 2 ? '' : '0') + p;
				});
			}

			format = format.replace(rS, function(m) {
				var S = d.getMilliseconds();
				return (S > 99 || m.length < 3 ? '' : '0') + S;
			});

			format = format.replace('q', function(m) {
				return Math.floor((d.getMonth() + 3) / 3);
			});

			return format;
		}

	});

	// 扩展静态方法
	extend(Date, {

		// 获取一个每月份天数的数组
		// @isLeapYear 是否为闰年 true/false
		// return array 
		getDaysPerMonth: function(isLeapYear) {
			var d = monthDays.slice();
			isLeapYear && (d[1] = 29);
			return d;
		},

		// 获取某月份的天数
		// @month int 月份 1-12
		// @isLeapYear boolean 是否为闰年
		// return int 28|29|30|31
		getDaysByMonth: function(month, isLeapYear) {
			return month !== 2 ? monthDays[month - 1] : isLeapYear ? 29 : 28;
		},

		// 根据年份（平年/闰年）获取当年天数
		// @year int
		// return int 365|366
		getDaysByYear: function(year) {
			return year % 4 || !(year % 400) ? 365 : 366;
		},

		// 判断年份是否为闰年
		// @year int
		// return boolean
		isLeapYear: function(year) {
			return !(year % 4 || !(year % 400));
		},

		//		// 判断年份是否为平年
		//		isAverageYear: function(year){
		//			return !!(year%4) || !(year%400);
		//		},

		// 解析格式化的日期，返回相应的日期对象
		// @time string '2012-3-13 11:11:11 111' | '2012-3-13T11:11:11.111Z'
		// @format string  'yyyy-MM-dd hh:mm:ss SSS' | 'yyyy-MM-ddThh:mm:ss.SSSZ'
		// return [object Date]
		_parse2Date: function(time, format) {

			format = format ? format.replace(rMdhmsG, function(m) {
				return (m = m.charAt(0)) + m;
			}) : Date.FORMAT;

			time = time.replace(rDigitsG, function(m) {
				return m.length < 2 ? '0' + m : m;
			});

			var r, m, n,
				d = new Date,
				a = [
					[ryG, "setFullYear"], //year
					[rMG, "setRealMonth"], //month + 1
					[rdG, "setDate"], //day
					[rhG, "setHours"], //hour
					[rmG, "setMinutes"], //minute
					[rsG, "setSeconds"], //second
					[rSG, "setMilliseconds"] //millisecond
				],
				i = -1,
				l = a.length;

			while (++i < l) {
				r = a[i][0];
				m = a[i][1];
				d[m](r.test(format) ? parseInt(time.slice(r.lastIndex - RegExp.lastMatch.length, r.lastIndex)) : 0);
				r.lastIndex = 0;
			}
			return d;
		},

		// 解析格式化的日期，返回相应的日期对象
		// @time string '2012-3-13'
		// return [object Date]
		parse2Date: function(time) {
			return Date._parse2Date(time, Date.DATE_FORMAT);
		},

		// 解析格式化的日期，返回相应的日期对象
		// @time string '2012-3-13 11:11:11 111'
		// return [object Date]
		parse2Datetime: function(time) {
			return Date._parse2Date(time, DATETIME_FORMAT);
		},

		// 解析格式化的日期，返回相应的日期对象
		// @time string '2012-3-13T11:11:11.111Z'
		// return [object Date]
		parse2UTCDate: function(time) {
			return Date._parse2Date(time, Date.UTC_FORMAT);
		},

		MONTH_EN: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
		MONTH_ZH: '一月,二月,三月,四月,五月,六月,七月,八月,九月,十月,十一月,十二月'.split(','),

		FORMAT: 'yyyy-MM-dd hh:mm:ss SSS',
		DATE_FORMAT: 'yyyy-MM-dd',
		DATETIME_FORMAT: 'yyyy-MM-dd hh:mm:ss SSS',
		UTC_FORMAT: 'yyyy-MM-ddThh:mm:ss.SSSZ',

		UNIT_ZH: {
			"second": "秒",
			"minute": "分钟",
			"hour": "小时",
			"day": "天",
			"week": "周",
			"month": "月",
			"quarter": "季度",
			"year": "年"
		},

		// 时间量词，以天数为基本计量单位
		// 天数|周数|月数|季度数|年数|世纪数
		DATE_CLASSIFIERS: {
			days: 1,
			weeks: 7,
			months: 30,
			quarters: 90,
			years: 365,
			centuries: 36524
		},


		// 解析时间跨度词，返回（格式化的时间字符串）数组
		// @dateRangeWord string
		// @dateFormat string
		// return date range (format string) 
		parse2DateFormatByDateRangeWord: function(dateRangeWord, dateFormat) {
			return parseDateRangeWord(dateRangeWord, dateFormat);
		},

		// 解析时间跨度词，返回（时间对象）数组
		// @dateRangeWord string
		// @dateFormat string
		// return date range (object Date Array) 
		parse2DateObjectByDateRangeWord: function(dateRangeWord, dateFormat) {
			return parseDateRangeWord(dateRangeWord, dateFormat, true);
		},

		parseDateRangeWord: parseDateRangeWord

	});

	// 解析时间跨度词，返回时间跨度数组（格式化的时间字符串或时间对象）
	// @dateRangeWord string
	// @dateFormat string
	// @isDateObject boolean
	// return date range (format string | object Date Array) 
	function parseDateRangeWord(dateRangeWord, dateFormat, isDateObject) {

		var now = new Date(),
			start = new Date(),
			end = new Date(),
			diffStartDate = 0,
			diffEndDate = 0,
			classifierNumber;

		dateFormat || (dateFormat = DatePicker.DATE_FORMAT);

		switch (dateRangeWord) {
			case 'today':
				diffStartDate = 0;
				break;
			case 'yesterday':
				diffStartDate = -1;
				diffEndDate = -1;
				break;
			case 'thisWeek':
				diffStartDate = -start.getDay() + 1;
				break;
			case 'lastWeek':
				diffEndDate = -end.getDay();
				diffStartDate = diffEndDate - 6;
				break;
			case 'thisMonth':
				diffStartDate = -start.getDate() + 1;
				break;
			case 'lastMonth':
				diffEndDate = -end.getDate();
				now.setMonth(now.getMonth() - 1);
				diffStartDate = -now.getMonthDays() + diffEndDate + 1;
				break;
			case 'thisQuarter':
				diffStartDate = -start.getQuarterDate() + 1;
				break;
			case 'lastQuarter':
				diffEndDate = -end.getQuarterDate();
				now.setDate(diffEndDate + now.getDate());
				diffStartDate = -now.getQuarterDate() + diffEndDate + 1;
				break;
			case 'thisYear':
				diffStartDate = -start.getYearDate() + 1;
				break;
			case 'lastYear':
				diffEndDate = -end.getYearDate();
				now.setFullYear(now.getFullYear() - 1);
				diffStartDate = -now.getYearDays() + diffEndDate + 1;
				break;
			case 'last7days':
				diffStartDate = -7;
				break;
			case 'last30days':
				diffStartDate = -30;
				break;
			case 'last90days':
				diffStartDate = -90;
				break;
			case 'last180days':
				diffStartDate = -180;
				break;
			case 'last365days':
				diffStartDate = -365;
				break;
			default:
				if (/^last([0-9]+)(days|weeks|months|quarters|years|centuries)$/.test(dateRangeWord)) {
					if (classifierNumber = Date.DATE_CLASSIFIERS[RegExp.$2]) {
						diffEndDate = -classifierNumber * ParseInt(RegExp.$1);
					}
				}
		}
		start.setDate(start.getDate() + diffStartDate);
		end.setDate(end.getDate() + diffEndDate);

		return isDateObject ? [start, end] : [start.format(dateFormat), end.format(dateFormat)];
	}

	var exports = this;

	if (typeof define === 'function' && define.amd) {
		define(function() {
			return Date;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = Date;
	} else {
		exports.Date = Date;
	}

	return Date;

}.call(this));