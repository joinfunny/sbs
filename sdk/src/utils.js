var config = require('./config');
var detector = require('./uaDetector');

var ArrayProto = Array.prototype,
    FuncProto = Function.prototype,
    ObjProto = Object.prototype,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty,
    navigator = window.navigator,
    document = window.document,
    userAgent = navigator.userAgent,
    LIB_VERSION = config.LIB_VERSION,
    LIB_KEY = config.LIB_KEY,
    nativeBind = FuncProto.bind,
    nativeForEach = ArrayProto.forEach,
    nativeIndexOf = ArrayProto.indexOf,
    nativeIsArray = Array.isArray,
    emptyObj = {};
var _ = {};
var each = _.each = function (obj, iterator, context) {
    if (obj == null) {
        return false;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (i in obj && iterator.call(context, obj[i], i, obj) === emptyObj) {
                return false;
            }
        }
    } else {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === emptyObj) {
                    return false;
                }
            }
        }
    }
};

_.extend = function (obj) {
    each(slice.call(arguments, 1), function (source) {
        for (var prop in source) {
            if (source[prop] !== void 0) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};

// 如果已经有的属性不覆盖,如果没有的属性加进来
_.coverExtend = function (obj) {
    each(slice.call(arguments, 1), function (source) {
        for (var prop in source) {
            if (source[prop] !== void 0 && obj[prop] === void 0) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};

_.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};

_.isFunction = function (f) {
    try {
        return /^\s*\bfunction\b/.test(f);
    } catch (x) {
        return false;
    }
};

_.isArguments = function (obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
};

_.toArray = function (iterable) {
    if (!iterable) {
        return [];
    }
    if (iterable.toArray) {
        return iterable.toArray();
    }
    if (_.isArray(iterable)) {
        return slice.call(iterable);
    }
    if (_.isArguments(iterable)) {
        return slice.call(iterable);
    }
    return _.values(iterable);
};

_.values = function (obj) {
    var results = [];
    if (obj == null) {
        return results;
    }
    each(obj, function (value) {
        results[results.length] = value;
    });
    return results;
};

_.include = function (obj, target) {
    var found = false;
    if (obj == null) {
        return found;
    }
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
        return obj.indexOf(target) != -1;
    }
    each(obj, function (value) {
        if (found || (found = (value === target))) {
            return emptyObj;
        }
    });
    return found;
};

_.includes = function (str, needle) {
    return str.indexOf(needle) !== -1;
};

_.inherit = function (subclass, superclass) {
    subclass.prototype = new superclass();
    subclass.prototype.constructor = subclass;
    subclass.superclass = superclass.prototype;
    return subclass;
};

_.isObject = function (obj) {
    return toString.call(obj) == '[object Object]';
};

_.isEmptyObject = function (obj) {
    if (_.isObject(obj)) {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    return false;
};

var rTrim = /^\s+|\s+$/;
_.trim = ''.trim ? function (s) {
    return s.trim()
} : function (s) {
    return s.replace(rTrim);
}

_.isUndefined = function (obj) {
    return obj === void 0;
};

_.isString = function (obj) {
    return toString.call(obj) == '[object String]';
};

_.isDate = function (obj) {
    return toString.call(obj) == '[object Date]';
};

_.isBoolean = function (obj) {
    return toString.call(obj) == '[object Boolean]';
};

_.isNumber = function (obj) {
    return (toString.call(obj) == '[object Number]' && /[\d\.]+/.test(String(obj)));
};

_.encodeDates = function (obj) {
    _.each(obj, function (v, k) {
        if (_.isDate(v)) {
            obj[k] = _.formatDate(v);
        } else if (_.isObject(v)) {
            obj[k] = _.encodeDates(v); // recurse
        }
    });
    return obj;
};

_.formatDate = function (date) {
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    return [
        date.getFullYear(),
        '-',
        pad(date.getMonth() + 1),
        '-',
        pad(date.getDate()),
        'T',
        pad(date.getHours()),
        ':',
        pad(date.getMinutes()),
        ':',
        pad(date.getSeconds()),
        '.',
        pad(date.getMilliseconds()),
        '+08:00'
    ].join('');
};

_.searchObjDate = function (o) {
    if (_.isObject(o)) {
        _.each(o, function (a, b) {
            if (_.isObject(a)) {
                _.searchObjDate(o[b]);
            } else {
                if (_.isDate(a)) {
                    o[b] = _.formatDate(a);
                }
            }
        });
    }
};

// 验证Properties格式
_.validateProperties = function (p) {
    if (!_.isObject(p)) {
        return p;
    }
    _.each(p, function (v, k) {
        // 如果是数组，把值自动转换成string
        if (_.isArray(v)) {
            var temp = [];
            _.each(v, function (arrv) {
                if (_.isString(arrv)) {
                    temp.push(arrv);
                } else {
                    _.log('您的数据-', v, '的数组里的值必须是字符串,已经将其删除');
                }
            });
            if (temp.length !== 0) {
                p[k] = temp;
            } else {
                delete p[k];
                _.log('已经删除空的数组');
            }
        }
        // 只能是字符串，数字，日期,布尔，数组
        if (!(_.isString(v) || _.isNumber(v) || _.isDate(v) || _.isBoolean(v) || _.isArray(v))) {
            _.log('您的数据-', v, '-格式不满足要求，我们已经将其删除');
            delete p[k];
        }
    });
    return p;
};

_.generateNewProperties = function (p) {
    var ret = {};
    _.each(p, function (v, k) {
        if (_.isString(v) && v.length > 0) {
            ret[k] = v;
        }
    });
    return ret;
};

_.utf8Encode = function (string) {
    string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    var utftext = '',
        start, end;
    var stringl = 0,
        n;

    start = end = 0;
    stringl = string.length;

    for (n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if ((c1 > 127) && (c1 < 2048)) {
            enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.substring(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.substring(start, string.length);
    }

    return utftext;
};


_.detector = detector;

_.base64Encode = function (data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];
    if (!data) {
        return data;
    }
    data = _.utf8Encode(data);
    do {
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break;
    }

    return enc;
};

_.UUID = (function () {
    var T = function () {
        var d = 1 * new Date(),
            i = 0;
        while (d == 1 * new Date()) {
            i++;
        }
        return d.toString(16) + i.toString(16);
    };
    var R = function () {
        return Math.random().toString(16).replace('.', '');
    };
    var UA = function (n) {
        var ua = userAgent,
            i, ch, buffer = [],
            ret = 0;

        function xor(result, byte_array) {
            var j, tmp = 0;
            for (j = 0; j < byte_array.length; j++) {
                tmp |= (buffer[j] << j * 8);
            }
            return result ^ tmp;
        }

        for (i = 0; i < ua.length; i++) {
            ch = ua.charCodeAt(i);
            buffer.unshift(ch & 0xFF);
            if (buffer.length >= 4) {
                ret = xor(ret, buffer);
                buffer = [];
            }
        }

        if (buffer.length > 0) {
            ret = xor(ret, buffer);
        }

        return ret.toString(16);
    };

    return function () {
        var se = (screen.height * screen.width).toString(16);
        return (T() + '-' + R() + '-' + UA() + '-' + se + '-' + T());
    };
})();

_.getQueryParam = function (url, param) {
    param = param.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regexS = '[\\?&]' + param + '=([^&#]*)',
        regex = new RegExp(regexS),
        results = regex.exec(url);
    if (results === null || (results && typeof (results[1]) !== 'string' && results[1].length)) {
        return '';
    } else {
        return decodeURIComponent(results[1]).replace(/\+/g, ' ');
    }
};

_.xhr = function (cors) {
    if (cors) {
        var xhr = new XMLHttpRequest;
        return "withCredentials" in xhr ? xhr : "undefined" != typeof XDomainRequest ? new XDomainRequest : t
    }
    if (XMLHttpRequest) return new XMLHttpRequest;
    if (window.ActiveXObject) try {
        return new ActiveXObject("Msxml2.XMLHTTP")
    } catch (ex) {
        try {
            return new ActiveXObject("Microsoft.XMLHTTP")
        } catch (ex) { }
    }
};
_.ajax = function (params) {
    function parseJson(params) {
        try {
            return JSON.parse(params)
        } catch (t) {
            return {}
        }
    }
    var xhr = _.xhr(params.cors);

    if (!params.type) {
        params.type = params.data ? "POST" : "GET"
    }

    params = _.extend({
        success: function () { },
        error: function (xhr, textStatus, errorThrown) {
            _.log(xhr.status);
            _.log(xhr.readyState);
            _.log(textStatus);
        },
        complete: function (xhr) { }
    }, params);

    xhr.onreadystatechange = function () {
        if (4 == xhr.readyState) {
            xhr.status >= 200 && xhr.status < 300 || 304 == xhr.status ? params.success(parseJson(xhr.responseText)) : params.error(xhr);
            params.complete(xhr);
            xhr.onreadystatechange = null;
            xhr.onload = null;
        }
    }
    xhr.open(params.type, params.url, params.async === void 0 ? !0 : params.async);
    /*xhr.withCredentials = true;*/
    if (_.isObject(params.header))
        for (var i in params.header) {
            xhr.setRequestHeader(i, params.header[i]);
        }
    if (params.data) {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        "application/json" === params.contentType ? xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8") : xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    xhr.send(params.data || null);
};
_.log = function () {
    if (!config.showLog) return;
    if (typeof console === 'object' && console.log) {
        try {
            console.log.apply(console, arguments);
        } catch (e) {
            console.log(arguments[0]);
        }
    }
};

_.cookie = {
    get: function (name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) == 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    },
    set: function (name, value, days, crossSubDomain, is_secure) {
        //crossSubDomain = typeof crossSubDomain === 'undefined' ? RX.para.crossSubDomain : crossSubDomain;
        var cdomain = '',
            expires = '',
            secure = '';
        days = typeof days === 'undefined' ? 730 : days;

        if (crossSubDomain) {
            var matches = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
                domain = matches ? matches[0] : '';

            cdomain = ((domain) ? '; domain=.' + domain : '');
        }

        if (days !== 0) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }

        if (is_secure) {
            secure = '; secure';
        }

        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
    },

    remove: function (name, crossSubDomain) {
        //crossSubDomain = typeof crossSubDomain === 'undefined' ? RX.para.crossSubDomain : crossSubDomain;
        _.cookie.set(name, '', -1, crossSubDomain);

    }
};

// _.localStorage
_.localStorage = {
    get: function (name) {
        return window.localStorage.getItem(name);
    },

    parse: function (name, defaultValue) {
        var storedValue;
        try {
            storedValue = JSON.parse(_.localStorage.get(name)) || defaultValue || {};
        } catch (err) { }
        return storedValue;
    },

    set: function (name, value) {
        _.isArray(value) || _.isObject(value) && (value = JSON.stringify(value));
        window.localStorage.setItem(name, value);
    },

    remove: function (name) {
        window.localStorage.removeItem(name);
    }
};

_.info = {
    campaignParams: function () {
        var campaign_keywords = 'utm_source utm_medium utm_campaign utm_content utm_term'.split(' '),
            kw = '',
            params = {};
        _.each(campaign_keywords, function (kwkey) {
            kw = _.getQueryParam(location.href, kwkey);
            if (kw.length) {
                params[kwkey] = kw;
            }
        });

        return params;
    },
    searchEngine: function (referrer) {
        if (referrer.search('https?://(.*)google.([^/?]*)') === 0) {
            return 'google';
        } else if (referrer.search('https?://(.*)bing.com') === 0) {
            return 'bing';
        } else if (referrer.search('https?://(.*)yahoo.com') === 0) {
            return 'yahoo';
        } else if (referrer.search('https?://(.*)duckduckgo.com') === 0) {
            return 'duckduckgo';
        } else if (referrer.search('https?://(.*)sogou.com') === 0) {
            return 'sogou';
        } else if (referrer.search('https?://(.*)so.com') === 0) {
            return '360so';
        } else {
            return null;
        }
    },

    browser: function (user_agent, vendor, opera) {
        var vendor = vendor || ''; // vendor is undefined for at least IE9
        if (opera || _.includes(user_agent, " OPR/")) {
            if (_.includes(user_agent, "Mini")) {
                return "Opera Mini";
            }
            return "Opera";
        } else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
            return 'BlackBerry';
        } else if (_.includes(user_agent, "IEMobile") || _.includes(user_agent, "WPDesktop")) {
            return "Internet Explorer Mobile";
        } else if (_.includes(user_agent, "Edge")) {
            return "Microsoft Edge";
        } else if (_.includes(user_agent, "FBIOS")) {
            return "Facebook Mobile";
        } else if (_.includes(user_agent, "Chrome")) {
            return "Chrome";
        } else if (_.includes(user_agent, "CriOS")) {
            return "Chrome iOS";
        } else if (_.includes(vendor, "Apple")) {
            if (_.includes(user_agent, "Mobile")) {
                return "Mobile Safari";
            }
            return "Safari";
        } else if (_.includes(user_agent, "Android")) {
            return "Android Mobile";
        } else if (_.includes(user_agent, "Konqueror")) {
            return "Konqueror";
        } else if (_.includes(user_agent, "Firefox")) {
            return "Firefox";
        } else if (_.includes(user_agent, "MSIE") || _.includes(user_agent, "Trident/")) {
            return "Internet Explorer";
        } else if (_.includes(user_agent, "Gecko")) {
            return "Mozilla";
        } else {
            return "";
        }
    },
    browserVersion: function (userAgent, vendor, opera) {
        var browser = _.info.browser(userAgent, vendor, opera);
        var versionRegexs = {
            "Internet Explorer Mobile": /rv:(\d+(\.\d+)?)/,
            "Microsoft Edge": /Edge\/(\d+(\.\d+)?)/,
            "Chrome": /Chrome\/(\d+(\.\d+)?)/,
            "Chrome iOS": /Chrome\/(\d+(\.\d+)?)/,
            "Safari": /Version\/(\d+(\.\d+)?)/,
            "Mobile Safari": /Version\/(\d+(\.\d+)?)/,
            "Opera": /(Opera|OPR)\/(\d+(\.\d+)?)/,
            "Firefox": /Firefox\/(\d+(\.\d+)?)/,
            "Konqueror": /Konqueror:(\d+(\.\d+)?)/,
            "BlackBerry": /BlackBerry (\d+(\.\d+)?)/,
            "Android Mobile": /android\s(\d+(\.\d+)?)/,
            "Internet Explorer": /(rv:|MSIE )(\d+(\.\d+)?)/,
            "Mozilla": /rv:(\d+(\.\d+)?)/
        };
        var regex = versionRegexs[browser];
        if (regex == undefined) {
            return null;
        }
        var matches = userAgent.match(regex);
        if (!matches) {
            return null;
        }
        return String(parseFloat(matches[matches.length - 2]));
    },

    os: function () {
        var a = userAgent;
        if (/Windows/i.test(a)) {
            if (/Phone/.test(a)) {
                return 'Windows Mobile';
            }
            return 'Windows';
        } else if (/(iPhone|iPad|iPod)/.test(a)) {
            return 'iOS';
        } else if (/Android/.test(a)) {
            return 'Android';
        } else if (/(BlackBerry|PlayBook|BB10)/i.test(a)) {
            return 'BlackBerry';
        } else if (/Mac/i.test(a)) {
            return 'Mac OS X';
        } else if (/Linux/.test(a)) {
            return 'Linux';
        } else {
            return '';
        }
    },

    device: function (user_agent) {
        if (/iPad/.test(user_agent)) {
            return 'iPad';
        } else if (/iPod/i.test(user_agent)) {
            return 'iPod';
        } else if (/iPhone/i.test(user_agent)) {
            return 'iPhone';
        } else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
            return 'BlackBerry';
        } else if (/Windows Phone/i.test(user_agent)) {
            return 'Windows Phone';
        } else if (/Windows/i.test(user_agent)) {
            return 'Windows';
        } else if (/Macintosh/i.test(user_agent)) {
            return 'Macintosh';
        } else if (/Android/i.test(user_agent)) {
            return 'Android';
        } else if (/Linux/i.test(user_agent)) {
            return 'Linux';
        } else {
            return '';
        }
    },

    referringDomain: function (referrer) {
        var split = referrer.split('/');
        if (split.length >= 3) {
            return split[2];
        }
        return '';
    },

    getBrowser: function () {
        return {
            b_dollar_browser: detector.browser.name,
            b_dollar_browser_version: String(detector.browser.version)
        }
    },
    getWindow: function () {
        var winWidth, winHeight;
        // 获取窗口宽度
        if (window.innerWidth)
            winWidth = window.innerWidth;
        else if (document.body && document.body.clientWidth)
            winWidth = document.body.clientWidth;
        // 获取窗口高度
        if (window.innerHeight)
            winHeight = window.innerHeight;
        else if (document.body && document.body.clientHeight)
            winHeight = document.body.clientHeight;
        // 通过深入 Document 内部对 body 进行检测，获取窗口大小
        if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
            winHeight = document.documentElement.clientHeight;
            winWidth = document.documentElement.clientWidth;
        }
        return {
            b_dollar_win_width: winWidth,
            b_dollar_win_height: winHeight
        };
    },

    properties: function () {
        return _.extend(_.generateNewProperties({
            b_dollar_os: detector.os.name,
            b_dollar_os_version: detector.os.fullVersion,
            b_dollar_model: detector.device.name,
            b_dollar_model_version: detector.device.fullVersion
        }), {
                b_dollar_browser_engine: detector.engine.name,
                b_dollar_screen_height: screen.height,
                b_dollar_screen_width: screen.width,
                b_dollar_lib: 'js',
                b_dollar_lib_version: LIB_VERSION
            }, _.info.getBrowser());
    },
    //保存临时的一些变量，只针对当前页面有效
    currentProps: {},
    register: function (obj) {
        _.extend(_.info.currentProps, obj);
    }
};
module.exports = _;
