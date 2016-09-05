// JSON polyfill
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
			var r, n, i, o, s, a = gap,
				u = t[e];
			switch (u && "object" == typeof u && "function" == typeof u.toJSON && (u = u.toJSON(e)), "function" == typeof rep && (u = rep.call(t, e, u)), typeof u) {
				case "string":
					return quote(u);
				case "number":
					return isFinite(u) ? String(u) : "null";
				case "boolean":
				case "null":
					return String(u);
				case "object":
					if (!u) return "null";
					if (gap += indent, s = [], "[object Array]" === Object.prototype.toString.apply(u)) {
						for (o = u.length, r = 0; o > r; r += 1) s[r] = str(r, u) || "null";
						return i = 0 === s.length ? "[]" : gap ? "[\n" + gap + s.join(",\n" + gap) + "\n" + a + "]" : "[" + s.join(",") + "]", gap = a, i
					}
					if (rep && "object" == typeof rep)
						for (o = rep.length, r = 0; o > r; r += 1) "string" == typeof rep[r] && (n = rep[r], i = str(n, u), i && s.push(quote(n) + (gap ? ": " : ":") + i));
					else
						for (n in u) Object.prototype.hasOwnProperty.call(u, n) && (i = str(n, u), i && s.push(quote(n) + (gap ? ": " : ":") + i));
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
		}, JSON.stringify = function(e, t, r) {
			var n;
			if (gap = "", indent = "", "number" == typeof r)
				for (n = 0; r > n; n += 1) indent += " ";
			else "string" == typeof r && (indent = r);
			if (rep = t, t && "function" != typeof t && ("object" != typeof t || "number" != typeof t.length)) throw new Error("JSON.stringify");
			return str("", {
				"": e
			})
		}), "function" != typeof JSON.parse && (JSON.parse = function(text, reviver) {
			function walk(e, t) {
				var r, n, i = e[t];
				if (i && "object" == typeof i)
					for (r in i) Object.prototype.hasOwnProperty.call(i, r) && (n = walk(i, r), void 0 !== n ? i[r] = n : delete i[r]);
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
	}()