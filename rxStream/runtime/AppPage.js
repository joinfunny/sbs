var _ = require('lodash');

var r20 = /%20/g;
var rJsonStr = /^\{.*\}$|^\[.*\]$/g;
// 命名空间
Object.ns = Object.namespace = function namespace(NS, name, ns) {

	NS || (NS = global);

	// 若为字符串，则定义为命名空间：a.b.c.d...
	if (typeof NS === 'string') {
		ns = name;
		name = NS;
		NS = global;
	}

	if (!name) {
		return;
	} else if (typeof name !== 'string') {
		return _.merge(NS, name)
	}

	var names = name.split('.'),
		i = -1,
		l = names.length - 1;

	// 若未定义，则返回获取的命名空间对象
	if (ns === undefined) {
		while (++i < l) {
			if (!(NS = NS[names[i]])) {
				return;
			}
		}
		return NS[names[l]];
	} else {
		while (++i < l) {
			NS = NS[names[i]] || (NS[names[i]] = {});
		}
		if (NS[names[l]]) {
			return _.merge(NS[names[l]], ns);
		} else {
			return NS[names[l]] = ns;
		}
	}
}
Object.ns('AppPage', {

	empty_fn: function() {},

	paramJsonStr: function(jsonStr) {
		return rJsonStr.test(jsonStr) ? encodeURIComponent(jsonStr).replace(r20, "+") : jsonStr;
	},

	paramJsonData: function(jsonData) {
		return encodeURIComponent(JSON.stringify(jsonData)).replace(r20, "+");
	},

	// 查询url的search字段
	queryString: function(query, url, undecode) {
		return this._queryString(query, url, undecode);
	},

	// 查询url的hash字段
	queryHashString: function(query, url, undecode) {
		return this._queryString(query, url, undecode, true);
	},

	// 查询url的search或hash字段
	_queryString: function(query, url, undecode, isHash) {
		var search, index;
		index = url.indexOf(isHash ? '#' : '?');
		if (index < 0) {
			return null;
		}
		search = "&" + url.slice(index + 1);

		return search && new RegExp("&" + query + "=([^&#]*)").test(search) ?
			undecode ? RegExp.$1 : unescape(RegExp.$1) :
			null;
	},

	// 查询url的search字段集合
	queryStringAll: function(query, url, undecode) {
		return AppPage._queryStringAll(query, url, undecode);
	},

	// 查询url的hash字段集合
	queryHashStringAll: function(query, url, undecode) {
		return AppPage._queryStringAll(query, url, undecode, true);
	},

	_queryStringAll: function(query, url, undecode, isHash) {
		var arrStr = [],
			arrMatch, search, index, start;

		index = url.indexOf(isHash ? '#' : '?');
		if (index < 0) {
			return null;
		}
		search = "&" + url.slice(index + 1);

		arrMatch = search.match(new RegExp("&" + query + "=[^&]*", "g"));
		if (arrMatch) {
			start = query.length + 2;
			arrMatch.forEach(function(value) {
				var v = undecode ? value : unescape(value.slice(start));
				arrStr = arrStr.concat(v.split(','));
			});
		}
		return arrStr;
	},
	ns: Object.ns
});
//Object.ns('AppPage.Utils', require('AppPage/Utils'));
module.exports = AppPage;