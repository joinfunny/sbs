"object" != typeof JSON && (JSON = {}),
	function() {
		"use strict";

		function f(e) {
			return 10 > e ? "0" + e : e
		}

		function this_value() {
			return this.valueOf()
		}

		function quote(e) {
			return rx_escapable.lastIndex = 0, rx_escapable.test(e) ? '"' + e.replace(rx_escapable, function(e) {
				var t = meta[e];
				return "string" == typeof t ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
			}) + '"' : '"' + e + '"'
		}

		function str(e, t) {
			var n, r, i, o, s, a = gap,
				c = t[e];
			switch (c && "object" == typeof c && "function" == typeof c.toJSON && (c = c.toJSON(e)), "function" == typeof rep && (c = rep.call(t, e, c)), typeof c) {
				case "string":
					return quote(c);
				case "number":
					return isFinite(c) ? String(c) : "null";
				case "boolean":
				case "null":
					return String(c);
				case "object":
					if (!c) return "null";
					if (gap += indent, s = [], "[object Array]" === Object.prototype.toString.apply(c)) {
						for (o = c.length, n = 0; o > n; n += 1) s[n] = str(n, c) || "null";
						return i = 0 === s.length ? "[]" : gap ? "[\n" + gap + s.join(",\n" + gap) + "\n" + a + "]" : "[" + s.join(",") + "]", gap = a, i
					}
					if (rep && "object" == typeof rep)
						for (o = rep.length, n = 0; o > n; n += 1) "string" == typeof rep[n] && (r = rep[n], i = str(r, c), i && s.push(quote(r) + (gap ? ": " : ":") + i));
					else
						for (r in c) Object.prototype.hasOwnProperty.call(c, r) && (i = str(r, c), i && s.push(quote(r) + (gap ? ": " : ":") + i));
					return i = 0 === s.length ? "{}" : gap ? "{\n" + gap + s.join(",\n" + gap) + "\n" + a + "}" : "{" + s.join(",") + "}", gap = a, i
			}
		}
		var rx_one = /^[\],:{}\s]*$/,
			rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
			rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
			rx_four = /(?:^|:|,)(?:\s*\[)+/g,
			rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		"function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function() {
			return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
		}, Boolean.prototype.toJSON = this_value, Number.prototype.toJSON = this_value, String.prototype.toJSON = this_value);
		var gap, indent, meta, rep;
		"function" != typeof JSON.stringify && (meta = {
			"\b": "\\b",
			"	": "\\t",
			"\n": "\\n",
			"\f": "\\f",
			"\r": "\\r",
			'"': '\\"',
			"\\": "\\\\"
		}, JSON.stringify = function(e, t, n) {
			var r;
			if (gap = "", indent = "", "number" == typeof n)
				for (r = 0; n > r; r += 1) indent += " ";
			else "string" == typeof n && (indent = n);
			if (rep = t, t && "function" != typeof t && ("object" != typeof t || "number" != typeof t.length)) throw new Error("JSON.stringify");
			return str("", {
				"": e
			})
		}), "function" != typeof JSON.parse && (JSON.parse = function(text, reviver) {
			function walk(e, t) {
				var n, r, i = e[t];
				if (i && "object" == typeof i)
					for (n in i) Object.prototype.hasOwnProperty.call(i, n) && (r = walk(i, n), void 0 !== r ? i[n] = r : delete i[n]);
				return reviver.call(e, t, i)
			}
			var j;
			if (text = String(text), rx_dangerous.lastIndex = 0, rx_dangerous.test(text) && (text = text.replace(rx_dangerous, function(e) {
					return "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
				})), rx_one.test(text.replace(rx_two, "@").replace(rx_three, "]").replace(rx_four, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({
				"": j
			}, "") : j;
			throw new SyntaxError("JSON.parse")
		})
	}(),
	function(e) {
		e = window[e];
		var t = e._ = {};
		e.para = e.para || {}, e.para_default = {
			cross_subdomain: !0,
			vtrack: !1,
			show_log: !0,
			debug_mode: !1,
			debug_mode_upload: !1,
			debug_mode_url: e.para.server_url.replace("sa.gif", "debug")
		};
		for (var n in e.para_default) void 0 === e.para[n] && (e.para[n] = e.para_default[n]);
		var r = {};
		! function() {
			function e(e) {
				return Object.prototype.toString.call(e)
			}

			function t(t) {
				return "[object Object]" === e(t)
			}

			function n(t) {
				return "[object Function]" === e(t)
			}

			function i(e, t) {
				for (var n = 0, r = e.length; r > n && t.call(e, e[n], n) !== !1; n++);
			}

			function o(e) {
				if (!g.test(e)) return null;
				var t, n, r, i, o;
				if (-1 !== e.indexOf("trident/") && (t = /\btrident\/([0-9.]+)/.exec(e), t && t.length >= 2)) {
					r = t[1];
					var s = t[1].split(".");
					s[0] = parseInt(s[0], 10) + 4, o = s.join(".")
				}
				t = g.exec(e), i = t[1];
				var a = t[1].split(".");
				return "undefined" == typeof o && (o = i), a[0] = parseInt(a[0], 10) - 4, n = a.join("."), "undefined" == typeof r && (r = n), {
					browserVersion: o,
					browserMode: i,
					engineVersion: r,
					engineMode: n,
					compatible: r !== n
				}
			}

			function s(e) {
				if (d) try {
					var t = d.twGetRunPath.toLowerCase(),
						n = d.twGetSecurityID(f),
						r = d.twGetVersion(n);
					if (t && -1 === t.indexOf(e)) return !1;
					if (r) return {
						version: r
					}
				} catch (i) {}
			}

			function a(r, i, o) {
				var s = n(i) ? i.call(null, o) : i;
				if (!s) return null;
				var a = {
						name: r,
						version: u,
						codename: ""
					},
					c = e(s);
				if (s === !0) return a;
				if ("[object String]" === c) {
					if (-1 !== o.indexOf(s)) return a
				} else {
					if (t(s)) return s.hasOwnProperty("version") && (a.version = s.version), a;
					if (s.exec) {
						var f = s.exec(o);
						if (f) return f.length >= 2 && f[1] ? a.version = f[1].replace(/_/g, ".") : a.version = u, a
					}
				}
			}

			function c(e, t, n, r) {
				var o = O;
				i(t, function(t) {
					var n = a(t[0], t[1], e);
					return n ? (o = n, !1) : void 0
				}), n.call(r, o.name, o.version)
			}
			var u = "-1",
				f = window,
				d = f.external,
				p = f.navigator.userAgent || "",
				l = f.navigator.appVersion || "",
				b = f.navigator.vendor || "",
				g = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/,
				h = /\bbb10\b.+?\bversion\/([\d.]+)/,
				v = /\bblackberry\b.+\bversion\/([\d.]+)/,
				m = /\bblackberry\d+\/([\d.]+)/,
				y = [
					["nokia", function(e) {
						return -1 !== e.indexOf("nokia ") ? /\bnokia ([0-9]+)?/ : /\bnokia([a-z0-9]+)?/
					}],
					["samsung", function(e) {
						return -1 !== e.indexOf("samsung") ? /\bsamsung(?:[ \-](?:sgh|gt|sm))?-([a-z0-9]+)/ : /\b(?:sgh|sch|gt|sm)-([a-z0-9]+)/
					}],
					["wp", function(e) {
						return -1 !== e.indexOf("windows phone ") || -1 !== e.indexOf("xblwp") || -1 !== e.indexOf("zunewp") || -1 !== e.indexOf("windows ce")
					}],
					["pc", "windows"],
					["ipad", "ipad"],
					["ipod", "ipod"],
					["iphone", /\biphone\b|\biph(\d)/],
					["mac", "macintosh"],
					["mi", /\bmi[ \-]?([a-z0-9 ]+(?= build|\)))/],
					["hongmi", /\bhm[ \-]?([a-z0-9]+)/],
					["aliyun", /\baliyunos\b(?:[\-](\d+))?/],
					["meizu", function(e) {
						return e.indexOf("meizu") >= 0 ? /\bmeizu[\/ ]([a-z0-9]+)\b/ : /\bm([0-9cx]{1,4})\b/
					}],
					["nexus", /\bnexus ([0-9s.]+)/],
					["huawei", function(e) {
						var t = /\bmediapad (.+?)(?= build\/huaweimediapad\b)/;
						return -1 !== e.indexOf("huawei-huawei") ? /\bhuawei\-huawei\-([a-z0-9\-]+)/ : t.test(e) ? t : /\bhuawei[ _\-]?([a-z0-9]+)/
					}],
					["lenovo", function(e) {
						return -1 !== e.indexOf("lenovo-lenovo") ? /\blenovo\-lenovo[ \-]([a-z0-9]+)/ : /\blenovo[ \-]?([a-z0-9]+)/
					}],
					["zte", function(e) {
						return /\bzte\-[tu]/.test(e) ? /\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/ : /\bzte[ _\-]?([a-su-z0-9\+]+)/
					}],
					["vivo", /\bvivo(?: ([a-z0-9]+))?/],
					["htc", function(e) {
						return /\bhtc[a-z0-9 _\-]+(?= build\b)/.test(e) ? /\bhtc[ _\-]?([a-z0-9 ]+(?= build))/ : /\bhtc[ _\-]?([a-z0-9 ]+)/
					}],
					["oppo", /\boppo[_]([a-z0-9]+)/],
					["konka", /\bkonka[_\-]([a-z0-9]+)/],
					["sonyericsson", /\bmt([a-z0-9]+)/],
					["coolpad", /\bcoolpad[_ ]?([a-z0-9]+)/],
					["lg", /\blg[\-]([a-z0-9]+)/],
					["android", /\bandroid\b|\badr\b/],
					["blackberry", function(e) {
						return e.indexOf("blackberry") >= 0 ? /\bblackberry\s?(\d+)/ : "bb10"
					}]
				],
				_ = [
					["wp", function(e) {
						return -1 !== e.indexOf("windows phone ") ? /\bwindows phone (?:os )?([0-9.]+)/ : -1 !== e.indexOf("xblwp") ? /\bxblwp([0-9.]+)/ : -1 !== e.indexOf("zunewp") ? /\bzunewp([0-9.]+)/ : "windows phone"
					}],
					["windows", /\bwindows nt ([0-9.]+)/],
					["macosx", /\bmac os x ([0-9._]+)/],
					["ios", function(e) {
						return /\bcpu(?: iphone)? os /.test(e) ? /\bcpu(?: iphone)? os ([0-9._]+)/ : -1 !== e.indexOf("iph os ") ? /\biph os ([0-9_]+)/ : /\bios\b/
					}],
					["yunos", /\baliyunos ([0-9.]+)/],
					["android", function(e) {
						return e.indexOf("android") >= 0 ? /\bandroid[ \/-]?([0-9.x]+)?/ : e.indexOf("adr") >= 0 ? e.indexOf("mqqbrowser") >= 0 ? /\badr[ ]\(linux; u; ([0-9.]+)?/ : /\badr(?:[ ]([0-9.]+))?/ : "android"
					}],
					["chromeos", /\bcros i686 ([0-9.]+)/],
					["linux", "linux"],
					["windowsce", /\bwindows ce(?: ([0-9.]+))?/],
					["symbian", /\bsymbian(?:os)?\/([0-9.]+)/],
					["blackberry", function(e) {
						var t = e.match(h) || e.match(v) || e.match(m);
						return t ? {
							version: t[1]
						} : "blackberry"
					}]
				],
				w = [
					["edgehtml", /edge\/([0-9.]+)/],
					["trident", g],
					["blink", function() {
						return "chrome" in f && "CSS" in f && /\bapplewebkit[\/]?([0-9.+]+)/
					}],
					["webkit", /\bapplewebkit[\/]?([0-9.+]+)/],
					["gecko", function(e) {
						var t;
						return (t = e.match(/\brv:([\d\w.]+).*\bgecko\/(\d+)/)) ? {
							version: t[1] + "." + t[2]
						} : void 0
					}],
					["presto", /\bpresto\/([0-9.]+)/],
					["androidwebkit", /\bandroidwebkit\/([0-9.]+)/],
					["coolpadwebkit", /\bcoolpadwebkit\/([0-9.]+)/],
					["u2", /\bu2\/([0-9.]+)/],
					["u3", /\bu3\/([0-9.]+)/]
				],
				x = [
					["edge", /edge\/([0-9.]+)/],
					["sogou", function(e) {
						return e.indexOf("sogoumobilebrowser") >= 0 ? /sogoumobilebrowser\/([0-9.]+)/ : e.indexOf("sogoumse") >= 0 ? !0 : / se ([0-9.x]+)/
					}],
					["theworld", function() {
						var e = s("theworld");
						return "undefined" != typeof e ? e : "theworld"
					}],
					["360", function(e) {
						var t = s("360se");
						return "undefined" != typeof t ? t : -1 !== e.indexOf("360 aphone browser") ? /\b360 aphone browser \(([^\)]+)\)/ : /\b360(?:se|ee|chrome|browser)\b/
					}],
					["maxthon", function() {
						try {
							if (d && (d.mxVersion || d.max_version)) return {
								version: d.mxVersion || d.max_version
							}
						} catch (e) {}
						return /\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/
					}],
					["micromessenger", /\bmicromessenger\/([\d.]+)/],
					["qq", /\bm?qqbrowser\/([0-9.]+)/],
					["green", "greenbrowser"],
					["tt", /\btencenttraveler ([0-9.]+)/],
					["liebao", function(e) {
						if (e.indexOf("liebaofast") >= 0) return /\bliebaofast\/([0-9.]+)/;
						if (-1 === e.indexOf("lbbrowser")) return !1;
						var t;
						try {
							d && d.LiebaoGetVersion && (t = d.LiebaoGetVersion())
						} catch (n) {}
						return {
							version: t || u
						}
					}],
					["tao", /\btaobrowser\/([0-9.]+)/],
					["coolnovo", /\bcoolnovo\/([0-9.]+)/],
					["saayaa", "saayaa"],
					["baidu", /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
					["ie", g],
					["mi", /\bmiuibrowser\/([0-9.]+)/],
					["opera", function(e) {
						var t = /\bopera.+version\/([0-9.ab]+)/,
							n = /\bopr\/([0-9.]+)/;
						return t.test(e) ? t : n
					}],
					["oupeng", /\boupeng\/([0-9.]+)/],
					["yandex", /yabrowser\/([0-9.]+)/],
					["ali-ap", function(e) {
						return e.indexOf("aliapp") > 0 ? /\baliapp\(ap\/([0-9.]+)\)/ : /\balipayclient\/([0-9.]+)\b/
					}],
					["ali-ap-pd", /\baliapp\(ap-pd\/([0-9.]+)\)/],
					["ali-am", /\baliapp\(am\/([0-9.]+)\)/],
					["ali-tb", /\baliapp\(tb\/([0-9.]+)\)/],
					["ali-tb-pd", /\baliapp\(tb-pd\/([0-9.]+)\)/],
					["ali-tm", /\baliapp\(tm\/([0-9.]+)\)/],
					["ali-tm-pd", /\baliapp\(tm-pd\/([0-9.]+)\)/],
					["uc", function(e) {
						return e.indexOf("ucbrowser/") >= 0 ? /\bucbrowser\/([0-9.]+)/ : e.indexOf("ubrowser/") >= 0 ? /\bubrowser\/([0-9.]+)/ : /\buc\/[0-9]/.test(e) ? /\buc\/([0-9.]+)/ : e.indexOf("ucweb") >= 0 ? /\bucweb([0-9.]+)?/ : /\b(?:ucbrowser|uc)\b/
					}],
					["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
					["android", function(e) {
						return -1 !== e.indexOf("android") ? /\bversion\/([0-9.]+(?: beta)?)/ : void 0
					}],
					["blackberry", function(e) {
						var t = e.match(h) || e.match(v) || e.match(m);
						return t ? {
							version: t[1]
						} : "blackberry"
					}],
					["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
					["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
					["firefox", /\bfirefox\/([0-9.ab]+)/],
					["nokia", /\bnokiabrowser\/([0-9.]+)/]
				],
				O = {
					name: "na",
					version: u
				},
				S = function(e) {
					e = (e || "").toLowerCase();
					var t = {};
					c(e, y, function(e, n) {
						var r = parseFloat(n);
						t.device = {
							name: e,
							version: r,
							fullVersion: n
						}, t.device[e] = r
					}, t), c(e, _, function(e, n) {
						var r = parseFloat(n);
						t.os = {
							name: e,
							version: r,
							fullVersion: n
						}, t.os[e] = r
					}, t);
					var n = o(e);
					return c(e, w, function(e, r) {
						var i = r;
						n && (r = n.engineVersion || n.engineMode, i = n.engineMode);
						var o = parseFloat(r);
						t.engine = {
							name: e,
							version: o,
							fullVersion: r,
							mode: parseFloat(i),
							fullMode: i,
							compatible: n ? n.compatible : !1
						}, t.engine[e] = o
					}, t), c(e, x, function(e, r) {
						var i = r;
						n && ("ie" === e && (r = n.browserVersion), i = n.browserMode);
						var o = parseFloat(r);
						t.browser = {
							name: e,
							version: o,
							fullVersion: r,
							mode: parseFloat(i),
							fullMode: i,
							compatible: n ? n.compatible : !1
						}, t.browser[e] = o
					}, t), t
				};
			r = S(p + " " + l + " " + b)
		}();
		var i = Array.prototype,
			o = Function.prototype,
			s = Object.prototype,
			a = i.slice,
			c = s.toString,
			u = s.hasOwnProperty,
			f = window.navigator,
			d = window.document,
			p = f.userAgent,
			l = "1.3.2",
			b = "object" == typeof b ? b : {};
		b.info = function() {
				if (!e.para.show_log) return !1;
				if ("object" == typeof console && console.log) try {
					return console.log.apply(console, arguments)
				} catch (t) {
					console.log(arguments[0])
				}
			},
			function() {
				var e = (o.bind, i.forEach),
					n = i.indexOf,
					r = Array.isArray,
					s = {},
					f = t.each = function(t, n, r) {
						if (null == t) return !1;
						if (e && t.forEach === e) t.forEach(n, r);
						else if (t.length === +t.length) {
							for (var i = 0, o = t.length; o > i; i++)
								if (i in t && n.call(r, t[i], i, t) === s) return !1
						} else
							for (var a in t)
								if (u.call(t, a) && n.call(r, t[a], a, t) === s) return !1
					};
				t.extend = function(e) {
					return f(a.call(arguments, 1), function(t) {
						for (var n in t) void 0 !== t[n] && (e[n] = t[n])
					}), e
				}, t.coverExtend = function(e) {
					return f(a.call(arguments, 1), function(t) {
						for (var n in t) void 0 !== t[n] && void 0 === e[n] && (e[n] = t[n])
					}), e
				}, t.isArray = r || function(e) {
					return "[object Array]" === c.call(e)
				}, t.isFunction = function(e) {
					try {
						return /^\s*\bfunction\b/.test(e)
					} catch (t) {
						return !1
					}
				}, t.isArguments = function(e) {
					return !(!e || !u.call(e, "callee"))
				}, t.toArray = function(e) {
					return e ? e.toArray ? e.toArray() : t.isArray(e) ? a.call(e) : t.isArguments(e) ? a.call(e) : t.values(e) : []
				}, t.values = function(e) {
					var t = [];
					return null == e ? t : (f(e, function(e) {
						t[t.length] = e
					}), t)
				}, t.include = function(e, t) {
					var r = !1;
					return null == e ? r : n && e.indexOf === n ? -1 != e.indexOf(t) : (f(e, function(e) {
						return r || (r = e === t) ? s : void 0
					}), r)
				}, t.includes = function(e, t) {
					return -1 !== e.indexOf(t)
				}
			}(), t.inherit = function(e, t) {
				return e.prototype = new t, e.prototype.constructor = e, e.superclass = t.prototype, e
			}, t.isObject = function(e) {
				return "[object Object]" == c.call(e)
			}, t.isEmptyObject = function(e) {
				if (t.isObject(e)) {
					for (var n in e)
						if (u.call(e, n)) return !1;
					return !0
				}
				return !1
			}, t.isUndefined = function(e) {
				return void 0 === e
			}, t.isString = function(e) {
				return "[object String]" == c.call(e)
			}, t.isDate = function(e) {
				return "[object Date]" == c.call(e)
			}, t.isBoolean = function(e) {
				return "[object Boolean]" == c.call(e)
			}, t.isNumber = function(e) {
				return "[object Number]" == c.call(e) && /[\d\.]+/.test(String(e))
			}, t.isJSONString = function(e) {
				try {
					JSON.parse(e)
				} catch (t) {
					return !1
				}
				return !0
			}, t.encodeDates = function(e) {
				return t.each(e, function(n, r) {
					t.isDate(n) ? e[r] = t.formatDate(n) : t.isObject(n) && (e[r] = t.encodeDates(n))
				}), e
			}, t.formatDate = function(e) {
				function t(e) {
					return 10 > e ? "0" + e : e
				}
				return e.getFullYear() + "-" + t(e.getMonth() + 1) + "-" + t(e.getDate()) + " " + t(e.getHours()) + ":" + t(e.getMinutes()) + ":" + t(e.getSeconds()) + "." + t(e.getMilliseconds())
			}, t.searchObjDate = function(e) {
				t.isObject(e) && t.each(e, function(n, r) {
					t.isObject(n) ? t.searchObjDate(e[r]) : t.isDate(n) && (e[r] = t.formatDate(n))
				})
			}, t.strip_sa_properties = function(e) {
				return t.isObject(e) ? (t.each(e, function(n, r) {
					if (t.isArray(n)) {
						var i = [];
						t.each(n, function(e) {
							t.isString(e) ? i.push(e) : b.info("您的数据-", n, "的数组里的值必须是字符串,已经将其删除")
						}), 0 !== i.length ? e[r] = i : (delete e[r], b.info("已经删除空的数组"))
					}
					t.isString(n) || t.isNumber(n) || t.isDate(n) || t.isBoolean(n) || t.isArray(n) || (b.info("您的数据-", n, "-格式不满足要求，我们已经将其删除"), delete e[r])
				}), e) : e
			}, t.strip_empty_properties = function(e) {
				var n = {};
				return t.each(e, function(e, r) {
					t.isString(e) && e.length > 0 && (n[r] = e)
				}), n
			}, t.utf8Encode = function(e) {
				e = (e + "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
				var t, n, r, i = "",
					o = 0;
				for (t = n = 0, o = e.length, r = 0; o > r; r++) {
					var s = e.charCodeAt(r),
						a = null;
					128 > s ? n++ : a = s > 127 && 2048 > s ? String.fromCharCode(s >> 6 | 192, 63 & s | 128) : String.fromCharCode(s >> 12 | 224, s >> 6 & 63 | 128, 63 & s | 128), null !== a && (n > t && (i += e.substring(t, n)), i += a, t = n = r + 1)
				}
				return n > t && (i += e.substring(t, e.length)), i
			}, t.detector = r, t.base64Encode = function(e) {
				var n, r, i, o, s, a, c, u, f = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
					d = 0,
					p = 0,
					l = "",
					b = [];
				if (!e) return e;
				e = t.utf8Encode(e);
				do n = e.charCodeAt(d++), r = e.charCodeAt(d++), i = e.charCodeAt(d++), u = n << 16 | r << 8 | i, o = u >> 18 & 63, s = u >> 12 & 63, a = u >> 6 & 63, c = 63 & u, b[p++] = f.charAt(o) + f.charAt(s) + f.charAt(a) + f.charAt(c); while (d < e.length);
				switch (l = b.join(""), e.length % 3) {
					case 1:
						l = l.slice(0, -2) + "==";
						break;
					case 2:
						l = l.slice(0, -1) + "="
				}
				return l
			}, t.UUID = function() {
				var e = function() {
						for (var e = 1 * new Date, t = 0; e == 1 * new Date;) t++;
						return e.toString(16) + t.toString(16)
					},
					t = function() {
						return Math.random().toString(16).replace(".", "")
					},
					n = function(e) {
						function t(e, t) {
							var n, r = 0;
							for (n = 0; n < t.length; n++) r |= o[n] << 8 * n;
							return e ^ r
						}
						var n, r, i = p,
							o = [],
							s = 0;
						for (n = 0; n < i.length; n++) r = i.charCodeAt(n), o.unshift(255 & r), o.length >= 4 && (s = t(s, o), o = []);
						return o.length > 0 && (s = t(s, o)), s.toString(16)
					};
				return function() {
					var r = (screen.height * screen.width).toString(16);
					return e() + "-" + t() + "-" + n() + "-" + r + "-" + e()
				}
			}(), t.getQueryParam = function(e, t) {
				t = t.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
				var n = "[\\?&]" + t + "=([^&#]*)",
					r = new RegExp(n),
					i = r.exec(e);
				return null === i || i && "string" != typeof i[1] && i[1].length ? "" : decodeURIComponent(i[1]).replace(/\+/g, " ")
			}, t.cookie = {
				get: function(e) {
					for (var t = e + "=", n = d.cookie.split(";"), r = 0; r < n.length; r++) {
						for (var i = n[r];
							" " == i.charAt(0);) i = i.substring(1, i.length);
						if (0 == i.indexOf(t)) return decodeURIComponent(i.substring(t.length, i.length))
					}
					return null
				},
				set: function(t, n, r, i, o) {
					i = "undefined" == typeof i ? e.para.cross_subdomain : i;
					var s = "",
						a = "",
						c = "";
					if (r = "undefined" == typeof r ? 730 : r, i) {
						var u = d.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
							f = u ? u[0] : "";
						s = f ? "; domain=." + f : ""
					}
					if (0 !== r) {
						var p = new Date;
						p.setTime(p.getTime() + 24 * r * 60 * 60 * 1e3), a = "; expires=" + p.toGMTString()
					}
					o && (c = "; secure"), d.cookie = t + "=" + encodeURIComponent(n) + a + "; path=/" + s + c
				},
				remove: function(n, r) {
					r = "undefined" == typeof r ? e.para.cross_subdomain : r, t.cookie.set(n, "", -1, r)
				}
			}, t.localStorage = {
				get: function(e) {
					return window.localStorage.getItem(e)
				},
				parse: function(e) {
					var n;
					try {
						n = JSON.parse(t.localStorage.get(e)) || null
					} catch (r) {}
					return n
				},
				set: function(e, t) {
					window.localStorage.setItem(e, t)
				},
				remove: function(e) {
					window.localStorage.removeItem(e)
				}
			}, t.getQueryParam = function(e, t) {
				t = t.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
				var n = "[\\?&]" + t + "=([^&#]*)",
					r = new RegExp(n),
					i = r.exec(e);
				return null === i || i && "string" != typeof i[1] && i[1].length ? "" : decodeURIComponent(i[1]).replace(/\+/g, " ")
			}, t.xhr = function(e) {
				if (e) {
					var t = new XMLHttpRequest;
					return "withCredentials" in t ? t : "undefined" != typeof XDomainRequest ? new XDomainRequest : t
				}
				if (XMLHttpRequest) return new XMLHttpRequest;
				if (window.ActiveXObject) try {
					return new ActiveXObject("Msxml2.XMLHTTP")
				} catch (n) {
					try {
						return new ActiveXObject("Microsoft.XMLHTTP")
					} catch (n) {}
				}
			}, t.ajax = function(e) {
				function n(e) {
					try {
						return JSON.parse(e)
					} catch (t) {
						return {}
					}
				}
				var r = t.xhr(e.cors);
				if (e.type || (e.type = e.data ? "POST" : "GET"), e = t.extend({
						success: function() {},
						error: function() {}
					}, e), r.onreadystatechange = function() {
						4 == r.readyState && (r.status >= 200 && r.status < 300 || 304 == r.status ? e.success(n(r.responseText)) : e.error(n(r.responseText)), r.onreadystatechange = null, r.onload = null)
					}, r.open(e.type, e.url, !0), r.withCredentials = !0, t.isObject(e.header))
					for (var i in e.header) r.setRequestHeader(i, e.header[i]);
				e.data && (r.setRequestHeader("X-Requested-With", "XMLHttpRequest"), "application/json" === e.contentType ? r.setRequestHeader("Content-type", "application/json; charset=UTF-8") : r.setRequestHeader("Content-type", "application/x-www-form-urlencoded")), r.send(e.data || null)
			}, t.info = {
				campaignParams: function() {
					var e = "utm_source utm_medium utm_campaign utm_content utm_term".split(" "),
						n = "",
						r = {};
					return t.each(e, function(e) {
						n = t.getQueryParam(location.href, e), n.length && (r[e] = n)
					}), r
				},
				searchEngine: function(e) {
					return 0 === e.search("https?://(.*)google.([^/?]*)") ? "google" : 0 === e.search("https?://(.*)bing.com") ? "bing" : 0 === e.search("https?://(.*)yahoo.com") ? "yahoo" : 0 === e.search("https?://(.*)duckduckgo.com") ? "duckduckgo" : null
				},
				browser: function(e, n, r) {
					var n = n || "";
					return r || t.includes(e, " OPR/") ? t.includes(e, "Mini") ? "Opera Mini" : "Opera" : /(BlackBerry|PlayBook|BB10)/i.test(e) ? "BlackBerry" : t.includes(e, "IEMobile") || t.includes(e, "WPDesktop") ? "Internet Explorer Mobile" : t.includes(e, "Edge") ? "Microsoft Edge" : t.includes(e, "FBIOS") ? "Facebook Mobile" : t.includes(e, "Chrome") ? "Chrome" : t.includes(e, "CriOS") ? "Chrome iOS" : t.includes(n, "Apple") ? t.includes(e, "Mobile") ? "Mobile Safari" : "Safari" : t.includes(e, "Android") ? "Android Mobile" : t.includes(e, "Konqueror") ? "Konqueror" : t.includes(e, "Firefox") ? "Firefox" : t.includes(e, "MSIE") || t.includes(e, "Trident/") ? "Internet Explorer" : t.includes(e, "Gecko") ? "Mozilla" : ""
				},
				browserVersion: function(e, n, r) {
					var i = t.info.browser(e, n, r),
						o = {
							"Internet Explorer Mobile": /rv:(\d+(\.\d+)?)/,
							"Microsoft Edge": /Edge\/(\d+(\.\d+)?)/,
							Chrome: /Chrome\/(\d+(\.\d+)?)/,
							"Chrome iOS": /Chrome\/(\d+(\.\d+)?)/,
							Safari: /Version\/(\d+(\.\d+)?)/,
							"Mobile Safari": /Version\/(\d+(\.\d+)?)/,
							Opera: /(Opera|OPR)\/(\d+(\.\d+)?)/,
							Firefox: /Firefox\/(\d+(\.\d+)?)/,
							Konqueror: /Konqueror:(\d+(\.\d+)?)/,
							BlackBerry: /BlackBerry (\d+(\.\d+)?)/,
							"Android Mobile": /android\s(\d+(\.\d+)?)/,
							"Internet Explorer": /(rv:|MSIE )(\d+(\.\d+)?)/,
							Mozilla: /rv:(\d+(\.\d+)?)/
						},
						s = o[i];
					if (void 0 == s) return null;
					var a = e.match(s);
					return a ? String(parseFloat(a[a.length - 2])) : null
				},
				os: function() {
					var e = p;
					return /Windows/i.test(e) ? /Phone/.test(e) ? "Windows Mobile" : "Windows" : /(iPhone|iPad|iPod)/.test(e) ? "iOS" : /Android/.test(e) ? "Android" : /(BlackBerry|PlayBook|BB10)/i.test(e) ? "BlackBerry" : /Mac/i.test(e) ? "Mac OS X" : /Linux/.test(e) ? "Linux" : ""
				},
				device: function(e) {
					return /iPad/.test(e) ? "iPad" : /iPod/i.test(e) ? "iPod" : /iPhone/i.test(e) ? "iPhone" : /(BlackBerry|PlayBook|BB10)/i.test(e) ? "BlackBerry" : /Windows Phone/i.test(e) ? "Windows Phone" : /Windows/i.test(e) ? "Windows" : /Macintosh/i.test(e) ? "Macintosh" : /Android/i.test(e) ? "Android" : /Linux/i.test(e) ? "Linux" : ""
				},
				referringDomain: function(e) {
					var t = e.split("/");
					return t.length >= 3 ? t[2] : ""
				},
				getBrowser: function() {
					return {
						_browser: r.browser.name,
						_browser_version: String(r.browser.version)
					}
				},
				properties: function() {
					return t.extend(t.strip_empty_properties({
						$os: r.os.name,
						$model: r.device.name
					}), {
						_browser_engine: r.engine.name,
						$screen_height: screen.height,
						$screen_width: screen.width,
						$lib: "js",
						$lib_version: String(l)
					}, t.info.getBrowser())
				},
				currentProps: {},
				register: function(e) {
					t.extend(t.info.currentProps, e)
				}
			};
		var g = {};
		g.checkOption = {
			regChecks: {
				regName: /^((?!^distinct_id$|^original_id$|^time$|^properties$|^id$|^first_id$|^second_id$|^users$|^events$|^event$|^user_id$|^date$|^datetime$)[a-zA-Z_$][a-zA-Z\d_$]{0,99})$/i
			},
			checkPropertiesKey: function(e) {
				var n = this,
					r = !0;
				return t.each(e, function(e, t) {
					n.regChecks.regName.test(t) || (r = !1)
				}), r
			},
			check: function(e, t) {
				return "string" == typeof this[e] ? this[this[e]](t) : this[e](t)
			},
			str: function(e) {
				return t.isString(e) ? !0 : (b.info("请检查参数格式,必须是字符串"), !1)
			},
			properties: function(e) {
				return t.strip_sa_properties(e), e ? t.isObject(e) ? this.checkPropertiesKey(e) ? !0 : (b.info("properties里的key必须是由字符串数字_组成，且不能是系统保留字"), !1) : (b.info("properties可以没有，但有的话必须是对象"), !1) : !0
			},
			propertiesMust: function(e) {
				return t.strip_sa_properties(e), void 0 === e || !t.isObject(e) || t.isEmptyObject(e) ? (b.info("properties必须是对象且有值"), !1) : this.checkPropertiesKey(e) ? !0 : (b.info("properties里的key必须是由字符串数字_组成，且不能是系统保留字"), !1)
			},
			event: function(e) {
				return t.isString(e) && this.regChecks.regName.test(e) ? !0 : (b.info("请检查参数格式,必须是字符串,且eventName必须是字符串_开头,且不能是系统保留字"), !1)
			},
			test_id: "str",
			group_id: "str",
			distinct_id: function(e) {
				return t.isString(e) && /^.{1,255}$/.test(e) ? !0 : (b.info("distinct_id必须是不能为空，且小于255位的字符串"), !1)
			}
		}, g.check = function(e) {
			var t = !0;
			for (var n in e)
				if (!this.checkOption.check(n, e[n])) return !1;
			return t
		}, g.send = function(n) {
			var r = {
				distinct_id: h.getDistinctId(),
				properties: {}
			};
			t.extend(r, n), t.isObject(n.properties) && !t.isEmptyObject(n.properties) && t.extend(r.properties, n.properties), n.type && "profile" === n.type.slice(0, 7) || t.extend(r.properties, h.getProps(), h.getSessionProps(), t.info.currentProps, t.info.properties()), r.time = 1 * new Date, t.searchObjDate(r), b.info(r), e.para.debug_mode === !0 ? this.debugPath(JSON.stringify(r)) : this.serverPath(JSON.stringify(r))
		}, g.debugPath = function(n) {
			var r = "";
			r = -1 !== e.para.debug_mode_url.indexOf("?") ? e.para.debug_mode_url + "&data=" + encodeURIComponent(t.base64Encode(n)) : e.para.debug_mode_url + "?data=" + encodeURIComponent(t.base64Encode(n)), t.ajax({
				url: r,
				type: "GET",
				cors: !0,
				header: {
					"Dry-Run": String(e.para.debug_mode_upload)
				}
			})
		}, g.serverPath = function(n) {
			e.requestImg = new Image, e.requestImg.onload = e.requestImg.onerror = function() {
				e.requestImg && (e.requestImg.onload = null, e.requestImg.onerror = null, e.requestImg = null)
			}, -1 !== e.para.server_url.indexOf("?") ? e.requestImg.src = e.para.server_url + "&data=" + encodeURIComponent(t.base64Encode(n)) : e.requestImg.src = e.para.server_url + "?data=" + encodeURIComponent(t.base64Encode(n))
		};
		var h = e.store = {
				getProps: function() {
					return this._state.props
				},
				getSessionProps: function() {
					return this._sessionState
				},
				getDistinctId: function() {
					return this._state.distinct_id
				},
				toState: function(e) {
					var t = null;
					return null !== e && "object" == typeof(t = JSON.parse(e)) ? (this._state = t, t.distinct_id) : null
				},
				initSessionState: function() {
					var e = t.cookie.get("sensorsdata2015session"),
						n = null;
					null !== e && "object" == typeof(n = JSON.parse(e)) && (this._sessionState = n)
				},
				setOnce: function(e, t) {
					e in this._state || this.set(e, t)
				},
				set: function(e, t) {
					this._state[e] = t, this.save()
				},
				change: function(e, t) {
					this._state[e] = t
				},
				setSessionProps: function(e) {
					var n = this._sessionState;
					t.extend(n, e), this.sessionSave(n)
				},
				setSessionPropsOnce: function(e) {
					var n = this._sessionState;
					t.coverExtend(n, e), this.sessionSave(n)
				},
				setProps: function(e) {
					var n = this._state.props || {};
					t.extend(n, e), this.set("props", n)
				},
				setPropsOnce: function(e) {
					var n = this._state.props || {};
					t.coverExtend(n, e), this.set("props", n)
				},
				sessionSave: function(e) {
					this._sessionState = e, t.cookie.set("sensorsdata2015session", JSON.stringify(this._sessionState), 0)
				},
				save: function() {
					e.para.cross_subdomain ? t.cookie.set("sensorsdata2015jssdkcross", JSON.stringify(this._state), 730, !0) : t.cookie.set("sensorsdata2015jssdk", JSON.stringify(this._state), 730, !1)
				},
				_sessionState: {},
				_state: {},
				init: function() {
					var n = t.cookie.get("sensorsdata2015jssdk"),
						r = t.cookie.get("sensorsdata2015jssdkcross"),
						i = null;
					e.para.cross_subdomain ? (i = r, null !== n && (b.info("在根域且子域有值，删除子域的cookie"), t.cookie.remove("sensorsdata2015jssdk", !1), t.cookie.remove("sensorsdata2015jssdk", !0)), null === i && null !== n && (b.info("在根域且根域没值，子域有值，根域＝子域的值", n), i = n)) : (b.info("在子域"), i = n), this.initSessionState(), null !== i && this.toState(i) ? e.para.cross_subdomain && null === r && (b.info("在根域且根域没值，保存当前值到cookie中"), this.save()) : (b.info("没有值，set值"), this.set("distinct_id", t.UUID()))
				}
			},
			v = {
				getUtm: function() {
					return t.info.campaignParams()
				},
				getStayTime: function() {
					return (new Date - e._t) / 1e3
				},
				setInitReferrer: function() {
					var n = d.referrer;
					e.setOnceProfile({
						_init_referrer: n,
						_init_referrer_domain: t.info.referringDomain(n)
					})
				},
				setSessionReferrer: function() {
					var e = d.referrer;
					h.setSessionPropsOnce({
						_session_referrer: e,
						_session_referrer_domain: t.info.referringDomain(e)
					})
				},
				setDefaultAttr: function() {
					t.info.register({
						_current_url: location.href,
						_referrer: d.referrer,
						_referring_domain: t.info.referringDomain(d.referrer)
					})
				},
				cookie: function() {}
			};
		e.quick = function() {
			var t = Array.prototype.slice.call(arguments),
				n = t[0],
				r = t.slice(1);
			return "string" == typeof n && v[n] ? v[n].apply(e, r) : void("function" == typeof n ? n.apply(e, r) : b.info("quick方法中没有这个功能" + t[0]))
		}, e.track = function(e, t) {
			g.check({
				event: e,
				properties: t
			}) && g.send({
				type: "track",
				event: e,
				properties: t
			})
		}, e.setProfile = function(e) {
			g.check({
				propertiesMust: e
			}) && g.send({
				type: "profile_set",
				properties: e
			})
		}, e.setOnceProfile = function(e) {
			g.check({
				propertiesMust: e
			}) && g.send({
				type: "profile_set_once",
				properties: e
			})
		}, e.appendProfile = function(e) {
			g.check({
				propertiesMust: e
			}) && (t.each(e, function(n, r) {
				t.isString(n) ? e[r] = [n] : t.isArray(n) || (delete e[r], b.info("appendProfile属性的值必须是字符串或者数组"))
			}), t.isEmptyObject(e) || g.send({
				type: "profile_append",
				properties: e
			}))
		}, e.incrementProfile = function(e) {
			function n(e) {
				for (var t in e)
					if (!/-*\d+/.test(String(e[t]))) return !1;
				return !0
			}
			var r = e;
			t.isString(e) && (e = {}, e[r] = 1), g.check({
				propertiesMust: e
			}) && (n(e) ? g.send({
				type: "profile_increment",
				properties: e
			}) : b.info("profile_increment的值只能是数字"))
		}, e.deleteProfile = function() {
			g.send({
				type: "profile_delete"
			}), h.set("distinct_id", t.UUID())
		}, e.unsetProfile = function(e) {
			var n = e,
				r = {};
			t.isString(e) && (e = [], e.push(n)), t.isArray(e) ? (t.each(e, function(e) {
				t.isString(e) ? r[e] = !0 : b.info("profile_unset给的数组里面的值必须时string,已经过滤掉", e)
			}), g.send({
				type: "profile_unset",
				properties: r
			})) : b.info("profile_unset的参数是数组")
		}, e.identify = function(e, n) {
			"undefined" == typeof e ? h.set("distinct_id", t.UUID()) : g.check({
				distinct_id: e
			}) ? n === !0 ? h.set("distinct_id", e) : h.change("distinct_id", e) : b.info("identify的参数必须是字符串")
		}, e.trackSignup = function(e, t, n) {
			g.check({
				distinct_id: e,
				event: t,
				properties: n
			}) && (g.send({
				original_id: h.getDistinctId(),
				distinct_id: e,
				type: "track_signup",
				event: t,
				properties: n
			}), h.set("distinct_id", e))
		}, e.trackAbtest = function(e, t) {
			g.check({
				test_id: e,
				group_id: t
			}) && g.send({
				type: "track_abtest",
				properties: {
					test_id: e,
					group_id: t
				}
			})
		}, e.register = function(e) {
			g.check({
				properties: e
			}) ? h.setProps(e) : b.info("register输入的参数有误")
		}, e.registerOnce = function(e) {
			g.check({
				properties: e
			}) ? h.setPropsOnce("props", e) : b.info("registerOnce输入的参数有误")
		}, e.registerSession = function(e) {
			g.check({
				properties: e
			}) ? h.setSessionProps(e) : b.info("registerSession输入的参数有误")
		}, e.registerSessionOnce = function(e) {
			g.check({
				properties: e
			}) ? h.setSessionPropsOnce(e) : b.info("registerSessionOnce输入的参数有误")
		}, e.init = function() {
			h.init(), t.each(e._q, function(t) {
				e[t[0]].apply(e, a.call(t[1]))
			})
		}, e.init()
	}(window.sensorsDataAnalytic201505);