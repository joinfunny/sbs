(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @author jiangfeng 
 * @summary SDK基础配置
 */
module.exports = {
    LIB_VERSION: '1.1.0',//SDK版本
    LIB_KEY: 'RXSTREAM201607',//与SDK安装时的Key对应
    sendLimit: 10,//发送限制，多于当前设置条数，就会发送事件
    crossSubDomain: true,//是否跨域
    loadTime: new Date(),//SDK加载时间
    apiHost: 'http://streamcollector.cssrv.dataengine.com/',
    appId: 1
};

},{}],2:[function(require,module,exports){
var config = require('./config');
var _ = require('./utils');
var store = require('./store');

/**
 * 监听器状态
 * @type {Object}
 */
var MONITORSTATE = {
    SENDING: 'monitor-sending',
    SEND: 'monitor-send',
    AUTHING: 'monitor-authing',
    AUTH: 'monitor-auth'
};

module.exports = {
    checkOption: {
        /**
         * event和property里的key要是一个合法的变量名，由大小写字母、数字、下划线和$组成，并且首字符不能是数字。
         */
        regChecks: {
            regName: /^((?!^uniqueId$|^originalId$|^time$|^properties$|^id$|^firstId$|^secondId$|^users$|^events$|^event$|^userId$|^date$|^datetime$)[a-zA-Z_$][a-zA-Z\d_$]{0,99})$/i
        },
        /**
         * 检查属性是否有效
         * @params obj 要检测数的对象
         */
        checkPropertiesKey: function (obj) {
            var me = this,
                flag = true;
            _.each(obj, function (content, key) {
                if (!me.regChecks.regName.test(key)) {
                    flag = false;
                }
            });
            return flag;
        },
        /**
         * 检查参数
         */
        check: function (a, b) {
            if (typeof this[a] === 'string') {
                return this[this[a]](b);
            } else {
                return this[a](b);
            }
        },
        //判断参数格式类型是否为字符串
        str: function (s) {
            if (!_.isString(s)) {
                _.log('请检查参数格式,必须是字符串');
                return false;
            } else {
                return true;
            }
        },
        //
        properties: function (p) {
            _.validateProperties(p);
            if (p) {
                if (_.isObject(p)) {
                    if (this.checkPropertiesKey(p)) {
                        return true;
                    } else {
                        _.log('properties里的key必须是由字符串数字_组成');
                        return false;
                    }
                } else {
                    _.log('properties可以没有，但有的话必须是对象');
                    return false;
                }
            } else {
                return true;
            }
        },
        propertiesMust: function (p) {
            _.validateProperties(p);
            if (p === undefined || !_.isObject(p) || _.isEmptyObject(p)) {
                _.log('properties必须是对象且有值');
                return false;
            } else {
                if (this.checkPropertiesKey(p)) {
                    return true;
                } else {
                    _.log('properties里的key必须是由字符串数字_组成');
                    return false;
                }
            }
        },
        // event要检查name
        event: function (s) {
            if (!_.isString(s) || !this['regChecks']['regName'].test(s)) {
                _.log('请检查参数格式,必须是字符串,且eventName必须是字符串_开头');
                return false;
            } else {
                return true;
            }
        },
        test_id: 'str',
        group_id: 'str',
        uniqueId: function (id) {
            if (_.isString(id) && /^.{1,255}$/.test(id)) {
                return true;
            } else {
                _.log('uniqueId必须是不能为空，且小于255位的字符串');
                return false;
            }
        }
    },
    /**
     * 本地上下文环境
     * 获取当前发送器的授权状态
     * 获取当前发送器的事件池
     * @type {Object}
     */
    globalContext: {
        state: {
        },
        eventPool: [],
        get: function (key) {
            return key ? this.state[key] : this.state;
        },
        set: function (key, value) {
            this.state[key] = value;
        },
        getEventPool: function () {
            var pool = _.localStorage.parse(config.LIB_KEY + 'EventPool' + store.get('appId'), []);
            return pool;
        },
        getTempEventPool: function () {
            var pool = _.localStorage.parse(config.LIB_KEY + 'EventPool_temp', []);
            return pool;
        },
        setEventPool: function (eventPool) {
            _.localStorage.set(config.LIB_KEY + 'EventPool' + store.get('appId'), JSON.stringify(eventPool));
        },
        setTempEventPool: function (eventPool) {
            _.localStorage.set(config.LIB_KEY + 'EventPool_temp', JSON.stringify(eventPool));
        },
        /**
         * 事件入池
         */
        pushEvent: function (event) {
            if (store.getSessionProps()[MONITORSTATE.AUTH]) {
                var pool = this.getEventPool();
                pool.push(event);
                this.setEventPool(pool);
            } else {
                var tempPool = this.getTempEventPool();
                tempPool.push(event);
                this.setTempEventPool(tempPool);
            }
        }
    },

    check: function (prop) {
        var flag = true;
        for (var i in prop) {
            if (!this.checkOption.check(i, prop[i])) {
                return false;
            }
        }
        return flag;
    },
    /**
     * 事件发送
     * @param p 要发送的事件对象
     */
    send: function (p) {
        var data = {
            uniqueId: store.getDeviceId(),
            properties: {}
        };
        _.extend(data, p);
        if (_.isObject(p.properties) && !_.isEmptyObject(p.properties)) {
            _.extend(data.properties, p.properties);
        }
        // profile时不传公用属性
        if (!p.type || p.type.slice(0, 7) !== 'profile') {
            _.extend(data.properties, store.getProps(), store.getSessionProps(), _.info.currentProps, _.info.properties());
        }
        data.time = _.formatDate(new Date());
        data.domain = store.getDomain();
        _.searchObjDate(data);

        _.log(JSON.stringify(data, null, 4));

        //插入事件池
        this.globalContext.pushEvent(data);
        //触发监听
        //原本monitor使用了定时器，但后来发觉如果用户开多个页面的时候每个页面上都会存在定时器来不断的触发事件发送，这样会丧失数据的一致性。并且性能会有很大影响
        //所以目前改为主动触发
        //事件分为两种类型：1、可缓存的事件，2、立即发送的事件。
        //遇到立即发送的事件，会直接发送当前事件池的所有事件，不管回调结果即清空事件池。
        this.monitor(data.sly);
    },

    /**
     * 发送器
     * 每次发送需保证处于授权状态
     * 每次发送需要保证池子里有足够的事件
     * @param sendImmediately 是否立即发送：true/false
     */
    monitor: function (sendImmediately) {
        if (sendImmediately) {
            this.path(true);
            return;
        }

        //授权状态
        var sessionProp = store.getSessionProps(),
            authState = sessionProp[MONITORSTATE.AUTH],
            authingState = sessionProp[MONITORSTATE.AUTHING];


        if (authState) {
            if (!contextState[MONITORSTATE.SENDING]) {
                this.path();
            }
        } else { //未授权或者授权失效
            if (!authingState) {
                this.auth();
            }
        }
    },

    /**
     * TOKEN验证
     * 异步请求，等待返回。
     */
    auth: function () {
        var that = this,
            url = config.apiHost + '/token/' + config.appId + '?randomId=' + store.getSessionId();

        var sessionProp = {};
        sessionProp[MONITORSTATE.AUTHING] = true;
        store.setSessionProps(sessionProp);

        _.ajax({
            url: url,
            type: "GET",
            cors: true,
            data: JSON.stringify({
                message: ""
            }),
            success: function (data) {
                var result = data,
                    authed = result.code === 200;

                sessionProp = {};
                sessionProp[MONITORSTATE.AUTH] = authed;

                if (authed) {
                    sessionProp.token = result.token;
                } else {
                    _.log(result.msg || result.message);
                }

                store.setSessionProps(sessionProp);
            },
            error: function (xhr) {
                _.log(xhr.status);
                _.log(xhr.statusText);
            },
            complete: function (xhr) {
                sessionProp = {};
                sessionProp[MONITORSTATE.AUTHING] = false;
                store.setSessionProps(sessionProp);
            }
        });
    },
    //支持两种发送模式：
    //1、sendImmediately:立即发送模式，ajax同步的方式将监听数据发送
    //2、lately:缓存发送模式，SDK判断缓存数据量，发送数据
    path: function (sendImmediately) {
        var that = this,
            session = store.getSessionProps(),
            authed = session[MONITORSTATE.AUTH];
        if (!authed) return;
        var token = session.token,
            sessionId = store.getSessionId(),
            deviceId = store.getDeviceId(),
            url = config.apiHost + '/receive/',
            limit = config.sendLimit || 1,
            tempEventPool = that.globalContext.getTempEventPool(),
            eventPool = that.globalContext.getEventPool();
        //直接发送时，采用同步方式发送。
        if (sendImmediately === true) {
            //如果存在临时缓存数据，则将临时数据也加入发送队列，并将临时缓存清空保存
            var tempData = tempEventPool.splice(0);
            var data = eventPool.splice(0);
            that.globalContext.setTempEventPool(tempEventPool);
            that.globalContext.setEventPool(eventPool);
            _.log(JSON.stringify(data));
            _.ajax({
                url: url,
                type: "POST",
                //contentType: 'application/json',
                cors: true,
                async: false, //同步请求
                data: JSON.stringify({
                    domain: store.getDomain(),
                    lib: 'js',
                    actions: data
                })
            });
            return;
        }


        if (eventPool.length < limit) return;

        var data = Array.prototype.slice.call(eventPool, 0);
        var postLength = data.length;
        //如果存在临时缓存数据，将临时数据加入发送队列中，并清空临时缓存
        if (tempEventPool.length > 0) {
            var tempData = tempEventPool.splice(0);
            data = Array.prototype.concat.call(tempData, data);
            that.globalContext.setTempEventPool(tempEventPool);
        }

        var sessionProp = {};
        sessionProp[MONITORSTATE.SENDING] = true;
        store.setSessionProps(sessionProp);

        _.ajax({
            url: url,
            type: "POST",
            cors: true,
            data: JSON.stringify({
                datatime: _.formatDate(new Date()),
                domain: store.getDomain(),
                lib: 'js',
                actions: data
            }),
            success: function (data) {
                try {
                    //返回空值：将请求体内的事件踢出栈
                    function exec() {
                        //将请求体内的事件踢出栈
                        var _eventPool = that.globalContext.getEventPool();

                        _.log(JSON.stringify(Array.prototype.splice.call(_eventPool, 0, postLength)));

                        that.globalContext.setEventPool(_eventPool);
                    }
                    if (_.isEmptyObject(data) || (data.status !== void 0 && data.status >= 0)) {
                        exec();
                    } else if (data.status == -1) {
                        //授权失效状态，重新发送授权
                        sessionProp = {};
                        sessionProp[MONITORSTATE.AUTH] = false;
                        store.setSessionProps(sessionProp);
                        that.auth();
                    }
                } catch (ex) {
                    _.log('事件发送返回消息错误');
                }
            },
            error: function (xhr) {
                _.log(xhr.status);
                _.log(xhr.statusText);
            },
            complete: function () {
                sessionProp = {};
                sessionProp[MONITORSTATE.SENDING] = false;
                store.setSessionProps(sessionProp);
            }
        });
    }
};

},{"./config":1,"./store":6,"./utils":8}],3:[function(require,module,exports){
var _ = require('./utils');

var HTML = document.documentElement,
    rLinkButton = /^(A|BUTTON)$/;
module.exports = {
    // 元素注册事件
    // elem {DOMElement}
    // eventType {String}
    // fn {Function}
    // return {undefined}
    addEvent: window.addEventListener ? function (elem, eventType, fn) {
        elem.addEventListener(eventType, fn, false);
    } : function (elem, eventType, fn) {
        elem.attachEvent('on' + eventType, fn);
    },

    innerText: 'innerText' in HTML ? function (elem) {
        return elem.innerText
    } : function (elem) {
        return elem.textContent
    },

    // 从一个元素自身开始，向上查找一个匹配指定标签的元素
    // elem {DOMElement}
    // tagName {String}
    // root {DOMElement} 可指定的根元素
    // return {DOMElement|undefined}
    iAncestorTag: function (elem, tagName, root) {
        tagName.test || (tagName = tagName.toUpperCase());
        root || (root = document);
        do {
            if (tagName.test ? tagName.test(elem.tagName) : elem.tagName === tagName) return elem;
        }
        while (elem !== root && (elem = elem.parentNode));
    },

    // 按钮类型Boolean表
    BUTTON_TYPE: {
        button: !0,
        image: !0, // 图像按钮
        submit: !0,
        reset: !0,
    },

    // 获取点击事件的预置信息
    // elem {DOMEvent}
    // return {Object|undefined}
    getClickPreset: function (e) {
        e || (e = window.event);
        var target = e.target || e.srcElement,
            tagName = target.tagName,
            aTarget, preset, type, text, href;
        switch (tagName) {
            case 'INPUT':
                type = target.type;
                if (dom.BUTTON_TYPE[type]) {
                    preset = {
                        event: 'e_click_btn',
                        properties: {
                            b_btn_type: type,//类型
                            b_btn_text: target.value,//按钮文字
                            b_btn_name: target.getAttribute('name') || '',//按钮nane
                            b_btn_value: target.getAttribute('value') || ''//按钮value
                        }
                    }
                }
                break;
            default:
                var aTarget = dom.iAncestorTag(target, rLinkButton);
                if (aTarget) {
                    switch (aTarget.tagName) {
                        case 'BUTTON':
                            text = _.trim(dom.innerText(aTarget));
                            preset = {
                                event: 'e_click_btn',
                                properties: {
                                    b_btn_type: aTarget.type,//类型
                                    b_btn_text: text,//按钮文字
                                    b_btn_name: aTarget.getAttribute('name') || '',//按钮name
                                    b_btn_value: aTarget.getAttribute('value') || ''//按钮value
                                }
                            }
                            break;
                        case 'A':
                            text = _.trim(dom.innerText(aTarget));
                            href = aTarget.href;
                            preset = {
                                event: 'e_click_link',
                                properties: {
                                    b_link_url: href,//链接地址
                                    b_link_text: text//链接文字
                                }
                            }
                            break;
                    }
                }

        }
        // 鼠标坐标
        if (preset) {
            preset.properties.b_clientX = e.clientX;
            preset.properties.b_clientY = e.clientY;
        }
        return preset;
    },

    //页面位置及窗口大小  
    getPageSize: function () {
        var scrW, scrH;
        if (window.innerHeight && window.scrollMaxY) { // Mozilla
            scrW =
                window.innerWidth + window.scrollMaxX;
            scrH = window.innerHeight +
                window.scrollMaxY;
        } else if (document.body.scrollHeight >
            document.body.offsetHeight) { // all but IE Mac      
            scrW =
                document.body.scrollWidth;
            scrH = document.body.scrollHeight;
        } else
            if (document.body) { // IE Mac      
                scrW = document.body.offsetWidth;

                scrH = document.body.offsetHeight;
            }
        var winW, winH;

        if (window.innerHeight) { // all except IE      
            winW =
                window.innerWidth;
            winH = window.innerHeight;
        } else if (document.documentElement &&
            document.documentElement.clientHeight) { // IE 6 Strict Mode      
            winW =
                document.documentElement.clientWidth;
            winH =
                document.documentElement.clientHeight;
        } else if (document.body) { //   
            other
            winW = document.body.clientWidth;
            winH =
                document.body.clientHeight;
        }
        // for small pages with total size less   
        //then the viewport
        var pageW = (scrW < winW) ? winW : scrW;
        var pageH =
            (scrH < winH) ? winH : scrH;
        return {
            PageWidth: pageW,
            PageHeight: pageH,
            WinWidth: winW,
            WinHeight: winH
        };
    },

    //滚动条位置  
    getPageScroll: function () {
        var x, y;
        if (window.pageYOffset) { // all except IE      
            y = window.pageYOffset;
            x = window.pageXOffset;
        } else
            if (document.documentElement && document.documentElement.scrollTop) {
                // IE 6 Strict      
                x = document.documentElement.scrollLeft;
                y = document.documentElement.scrollTop;
            } else if (document.body) { // all   
                //other IE
                x = document.body.scrollLeft;
                y = document.body.scrollTop;
            }

        return {
            b_scrollX: x,
            b_scrollY: y
        };
    }
}


},{"./utils":8}],4:[function(require,module,exports){
var _ = require('./utils');
var rxStream = require('./rxStream');

var defaultConfig = {
    sendLimit: 10,
    crossSubDomain: true,
    loadTime: 1 * new Date(),
    autoTrack: true,
    showLog: false
};
var rx = window[rxStream.config.LIB_KEY] || rxStream.config.LIB_KEY;
if (rx) {
    rx = window[rx]
}

if (rx.para) {
    _.extend(defaultConfig, rx.para);
}

_.extend(rx, rxStream);

rx.init(defaultConfig);


},{"./rxStream":5,"./utils":8}],5:[function(require,module,exports){
var _ = require('./utils');
var store = require('./store');
var core = require('./core');
var dom = require('./dom');
var config = require('./config');


var rxStream = {};
rxStream._ = _;
rxStream.config = config;
rxStream.core = core;

var commonWays = {
    // 获取谷歌标准参数
    getUtm: function () {
        return _.info.campaignParams();
    },
    /**
     * 获取当前页面停留时间-秒
     */
    getStayTime: function () {
        return ((new Date()) - config.loadTime) / 1000;
    },
    //set init referrer
    setInitReferrer: function () {
        var _referrer = document.referrer;
        store.setPropsOnce({
            b_dollar_page_referrer: _referrer,
            b_dollar_referrer_domain: _.info.referringDomain(_referrer)
        });
    },
    // set init sessionRegister cookie
    setSessionReferrer: function () {
        var _referrer = document.referrer;
        store.setSessionPropsOnce({
            b_dollar_session_referrer: _referrer,
            b_dollar_session_referrer_domain: _.info.referringDomain(_referrer)
        });
    },
    // set default referrr and pageurl
    setDefaultAttr: function () {
        _.info.register({
            b_dollar_page_url: location.href,
            b_dollar_referrer: document.referrer,
            b_dollar_referring_domain: _.info.referringDomain(document.referrer)
        });
    },
    autoTrack: function () {
        var that = this;
        var compaignParams = _.info.campaignParams();
        rxStream.setOnceProfile(_.extend({
            b_dollar_first_visit_time: new Date(),
            b_dollar_first_referrer: document.referrer,
            b_dollar_first_referrer_host: _.info.referringDomain(document.referrer),
            b_dollar_domain: _.info.referringDomain(location.href)
        }, compaignParams));

        var h1s = document.body && document.body.getElementsByTagName('h1') || [];
        var pageH1 = '';
        _.isArray(h1s) && h1s.length > 0 && (pageH1 = dom.innerText(h1s[0]));

        that.track("e_view_page", _.extend({
            b_page_referrer: document.referrer,
            b_page_referrer_host: _.info.referringDomain(document.referrer),
            b_page_url: location.href,
            b_page_url_path: location.pathname,
            b_page_title: document.title,
            b_page_h1: pageH1,
            b_browser_language: navigator.language
        }, compaignParams));
        //注册load事件是为了获取到页面资源加载完成时间
        dom.addEvent(window, 'load', function () {
            var pageLoadTime = commonWays.getStayTime();
            core.globalContext.set('pageLoadTime', pageLoadTime);
            _.log('页面加载时间：' + pageLoadTime);
        });
        dom.addEvent(document, 'click', function (e) {
            var preset = dom.getClickPreset(e);
            preset && that.track(preset.event, preset.properties);
        });
        dom.addEvent(window, 'beforeunload', function (e) {
            var pageLoadTime = core.globalContext.get('pageLoadTime');
            var pageStayTime = commonWays.getStayTime();
            var scrollPos = dom.getPageScroll();
            var properties = _.extend({
                b_page_load_time: pageLoadTime,//页面加载时间
                b_page_stay_time: pageStayTime//页面停留时间
            }, scrollPos);
            _.log('页面离开：' + JSON.stringify(properties));
            that.track('e_leave_page', properties, true);//离开页面时立即将事件池清空，全部发送
        });
    }
};

// 一些常见的方法
rxStream.quick = function () {
    var arg = Array.prototype.slice.call(arguments);
    var arg0 = arg[0];
    var arg1 = arg.slice(1);
    if (typeof arg0 === 'string' && commonWays[arg0]) {
        return commonWays[arg0].apply(this, arg1);
    } else if (typeof arg0 === 'function') {
        arg0.apply(this, arg1);
    } else {
        _.log('quick方法中没有这个功能' + arg[0]);
    }
};

rxStream.autoTrack = function () {
    commonWays.autoTrack.call(this);
};

/*
 * @param {string} event 事件名
 * @param {string} properties 要发送的属性值
 * @param {boolean} sendImmediately 是否立即发送
 * */
rxStream.track = function (event, props, sendImmediately) {
    if (core.check({
        event: event,
        properties: props
    })) {
        core.send({
            action: 'track',
            event: event,
            sly: sendImmediately,
            properties: props
        });
    }
};

/*
 * @param {object} properties
 * */
rxStream.setProfile = function (p) {
    if (core.check({
        propertiesMust: p
    })) {
        core.send({
            action: 'profile_set',
            properties: p
        });
    }
};

rxStream.setOnceProfile = function (p) {
    if (core.check({
        propertiesMust: p
    })) {
        core.send({
            action: 'profile_set_once',
            properties: p
        });
    }
};

/*
 * @param {object} properties
 * */
rxStream.appendProfile = function (p) {
    if (core.check({
        propertiesMust: p
    })) {
        _.each(p, function (value, key) {
            if (_.isString(value)) {
                p[key] = [value];
            } else if (_.isArray(value)) {

            } else {
                delete p[key];
                _.log('appendProfile属性的值必须是字符串或者数组');
            }
        });
        if (!_.isEmptyObject(p)) {
            core.send({
                action: 'profile_append',
                properties: p
            });
        }
    }
};
/*
 * @param {object} properties
 * */
rxStream.incrementProfile = function (p) {
    var str = p;
    if (_.isString(p)) {
        p = {}
        p[str] = 1;
    }

    function isChecked(p) {
        for (var i in p) {
            if (!/-*\d+/.test(String(p[i]))) {
                return false;
            }
        }
        return true;
    }

    if (core.check({
        propertiesMust: p
    })) {
        if (isChecked(p)) {
            core.send({
                action: 'profile_increment',
                properties: p
            });
        } else {
            _.log('profile_increment的值只能是数字');
        }
    }
};

rxStream.deleteProfile = function () {
    core.send({
        action: 'profile_delete'
    });
    store.set('uniqueId', _.UUID());
};
/*
 * @param {object} properties
 * */
rxStream.unsetProfile = function (p) {
    var str = p;
    var temp = {};
    if (_.isString(p)) {
        p = [];
        p.push(str);
    }
    if (_.isArray(p)) {
        _.each(p, function (v) {
            if (_.isString(v)) {
                temp[v] = true;
            } else {
                _.log('profile_unset给的数组里面的值必须时string,已经过滤掉', v);
            }
        });
        core.send({
            action: 'profile_unset',
            properties: temp
        });
    } else {
        _.log('profile_unset的参数是数组');
    }
};
/*
 * @param {string} uniqueId
 * */
rxStream.identify = function (id, isSave) {
    if (typeof id === 'undefined') {
        store.set('uniqueId', _.UUID());
    } else if (core.check({
        uniqueId: id
    })) {

        if (isSave === true) {
            store.set('uniqueId', id);
        } else {
            store.change('uniqueId', id);
        }

    } else {
        _.log('identify的参数必须是字符串');
    }
};

rxStream.trackSignup = function (id, e, p) {
    if (core.check({
        uniqueId: id,
        event: e,
        properties: p
    })) {
        core.send({
            originalId: store.getDeviceId(),
            uniqueId: id,
            action: 'trackSignup',
            event: e,
            properties: p
        });
        store.set('uniqueId', id);
    }
};
/*
 * @param {string} testid
 * @param {string} groupid
 * */
rxStream.trackAbtest = function (t, g) {
    if (core.check({
        test_id: t,
        group_id: g
    })) {
        core.send({
            action: 'trackAbtest',
            properties: {
                test_id: t,
                group_id: g
            }
        });
    }
};

rxStream.register = function (props) {
    if (core.check({
        properties: props
    })) {
        store.setProps(props);
    } else {
        _.log('register输入的参数有误');
    }
};

rxStream.registerOnce = function (props) {
    if (core.check({
        properties: props
    })) {
        store.setPropsOnce('props', props);
    } else {
        _.log('registerOnce输入的参数有误');
    }
};

rxStream.registerSession = function (props) {
    if (core.check({
        properties: props
    })) {
        store.setSessionProps(props);
    } else {
        _.log('registerSession输入的参数有误');
    }
};

rxStream.registerSessionOnce = function (props) {
    if (core.check({
        properties: props
    })) {
        store.setSessionPropsOnce(props);
    } else {
        _.log('registerSessionOnce输入的参数有误');
    }
};

rxStream.init = function (config) {
    var that = this;
    if (config && !_.isEmptyObject(config)) {
        _.extend(that.config, config);
    }

    store.init();

    if (that._rx) {
        _.each(that._rx, function (params) {
            that[params[0]].apply(that, Array.prototype.slice.call(params[1]))
        });
    }

    if (that.config['autoTrack'] === !0) {
        that.autoTrack();
    }

    //core.auth();

    _.log('主文件加载成功！');

};
module.exports = rxStream;

},{"./config":1,"./core":2,"./dom":3,"./store":6,"./utils":8}],6:[function(require,module,exports){
var config = require('./config');
var _ = require('./utils');

var LIB_KEY = config.LIB_KEY;
module.exports = {
    getProps: function () {
        return this._state.props;
    },
    getSessionProps: function () {
        return this._sessionState;
    },
    /**
     * 获取会话的CookieID
     * 默认过期时间为2年
     * 在手动清空Cookie时过期
     */
    getDeviceId: function () {
        return this._state.uniqueId;
    },
    /**
     * 获取本次浏览会话的SessionID
     * 窗口全部关闭，则SessionID过期
     */
    getSessionId: function () {
        return this._sessionState.sessionId;
    },
    getDomain: function () {
        var domain = this._state.domain;
        if (!domain) {
            this.setOnce('domain', document.domain || window.location.host);
        }
        return domain;
    },
    toState: function (ds) {
        var state = null;
        if (ds !== null && (typeof (state = JSON.parse(ds)) === 'object')) {
            this._state = state;
        }
    },
    initSessionState: function () {
        var ds = _.cookie.get(LIB_KEY + 'session');
        var state = null;
        if (ds !== null && (typeof (state = JSON.parse(ds)) === 'object')) {
            this._sessionState = state;
        }
    },
    setOnce: function (name, value) {
        if (!(name in this._state)) {
            this.set(name, value);
        }
    },
    get: function (name) {
        return this._state[name];
    },
    set: function (name, value) {
        this._state[name] = value;
        this.save();
    },
    // 针对当前页面修改
    change: function (name, value) {
        this._state[name] = value;
    },
    setSessionProps: function (newp) {
        var props = this._sessionState;
        _.extend(props, newp);
        this.sessionSave(props);
    },
    setSessionPropsOnce: function (newp) {
        var props = this._sessionState;
        _.coverExtend(props, newp);
        this.sessionSave(props);
    },
    setProps: function (newp) {
        var props = this._state.props || {};
        _.extend(props, newp);
        this.set('props', props);
    },
    setPropsOnce: function (newp) {
        var props = this._state.props || {};
        _.coverExtend(props, newp);
        this.set('props', props);
    },
    sessionSave: function (props) {
        this._sessionState = props;
        _.cookie.set(LIB_KEY + 'session', JSON.stringify(this._sessionState), 0, config.crossSubDomain);
    },
    save: function () {
        if (config.crossSubDomain) {
            _.cookie.set(LIB_KEY + 'jssdkcross', JSON.stringify(this._state), this._state['expires'] || 730, true);
        } else {
            _.cookie.set(LIB_KEY + 'jssdk', JSON.stringify(this._state), this._state['expires'] || 730, false);
        }
    },
    _sessionState: {},
    _state: {},
    init: function () {
        var ds = _.cookie.get(LIB_KEY + 'jssdk');
        var cs = _.cookie.get(LIB_KEY + 'jssdkcross');
        var cross = null;
        if (config.crossSubDomain) {
            cross = cs;
            if (ds !== null) {
                _.log('在根域且子域有值，删除子域的cookie');
                // 如果是根域的，删除以前设置在子域的
                _.cookie.remove(LIB_KEY + 'jssdk', false);
                _.cookie.remove(LIB_KEY + 'jssdk', true);
            }
            if (cross === null && ds !== null) {
                _.log('在根域且根域没值，子域有值，根域＝子域的值', ds);
                cross = ds;
            }
        } else {
            _.log('在子域');
            cross = ds;
        }
        this.initSessionState();
        if (cross !== null) {
            this.toState(cross);
            //如果是根域且根域没值
            if (config.crossSubDomain && cs === null) {
                _.log('在根域且根域没值，保存当前值到cookie中');
                this.save();
            }
        } else {
            _.log('没有值，set值');
            this.set('uniqueId', _.UUID());
        }
        //生成本次回话的SessionID
        this.setSessionPropsOnce({ 'sessionId': _.UUID() })
    }
};


},{"./config":1,"./utils":8}],7:[function(require,module,exports){


var detector = {};

var NA_VERSION = "-1";
var win = window;
var external = win.external;
var userAgent = win.navigator.userAgent || "";
var appVersion = win.navigator.appVersion || "";
var vendor = win.navigator.vendor || "";

var re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;
var re_blackberry_10 = /\bbb10\b.+?\bversion\/([\d.]+)/;
var re_blackberry_6_7 = /\bblackberry\b.+\bversion\/([\d.]+)/;
var re_blackberry_4_5 = /\bblackberry\d+\/([\d.]+)/;

function toString(object) {
    return Object.prototype.toString.call(object);
}

function isObject(object) {
    return toString(object) === "[object Object]";
}

function isFunction(object) {
    return toString(object) === "[object Function]";
}

function each(object, factory) {
    for (var i = 0, l = object.length; i < l; i++) {
        if (factory.call(object, object[i], i) === false) {
            break;
        }
    }
}

// 硬件设备信息识别表达式。
// 使用数组可以按优先级排序。
var DEVICES = [
    ["nokia", function (ua) {
        // 不能将两个表达式合并，因为可能出现 "nokia; nokia 960"
        // 这种情况下会优先识别出 nokia/-1
        if (ua.indexOf("nokia ") !== -1) {
            return /\bnokia ([0-9]+)?/;
        } else {
            return /\bnokia([a-z0-9]+)?/;
        }
    }],
    // 三星有 Android 和 WP 设备。
    ["samsung", function (ua) {
        if (ua.indexOf("samsung") !== -1) {
            return /\bsamsung(?:[ \-](?:sgh|gt|sm))?-([a-z0-9]+)/;
        } else {
            return /\b(?:sgh|sch|gt|sm)-([a-z0-9]+)/;
        }
    }],
    ["wp", function (ua) {
        return ua.indexOf("windows phone ") !== -1 ||
            ua.indexOf("xblwp") !== -1 ||
            ua.indexOf("zunewp") !== -1 ||
            ua.indexOf("windows ce") !== -1;
    }],
    ["pc", "windows"],
    ["ipad", "ipad"],
    // ipod 规则应置于 iphone 之前。
    ["ipod", "ipod"],
    ["iphone", /\biphone\b|\biph(\d)/],
    ["mac", "macintosh"],
    // 小米
    ["mi", /\bmi[ \-]?([a-z0-9 ]+(?= build|\)))/],
    // 红米
    ["hongmi", /\bhm[ \-]?([a-z0-9]+)/],
    ["aliyun", /\baliyunos\b(?:[\-](\d+))?/],
    ["meizu", function (ua) {
        return ua.indexOf("meizu") >= 0 ?
            /\bmeizu[\/ ]([a-z0-9]+)\b/ :
            /\bm([0-9cx]{1,4})\b/;
    }],
    ["nexus", /\bnexus ([0-9s.]+)/],
    ["huawei", function (ua) {
        var re_mediapad = /\bmediapad (.+?)(?= build\/huaweimediapad\b)/;
        if (ua.indexOf("huawei-huawei") !== -1) {
            return /\bhuawei\-huawei\-([a-z0-9\-]+)/;
        } else if (re_mediapad.test(ua)) {
            return re_mediapad;
        } else {
            return /\bhuawei[ _\-]?([a-z0-9]+)/;
        }
    }],
    ["lenovo", function (ua) {
        if (ua.indexOf("lenovo-lenovo") !== -1) {
            return /\blenovo\-lenovo[ \-]([a-z0-9]+)/;
        } else {
            return /\blenovo[ \-]?([a-z0-9]+)/;
        }
    }],
    // 中兴
    ["zte", function (ua) {
        if (/\bzte\-[tu]/.test(ua)) {
            return /\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/;
        } else {
            return /\bzte[ _\-]?([a-su-z0-9\+]+)/;
        }
    }],
    // 步步高
    ["vivo", /\bvivo(?: ([a-z0-9]+))?/],
    ["htc", function (ua) {
        if (/\bhtc[a-z0-9 _\-]+(?= build\b)/.test(ua)) {
            return /\bhtc[ _\-]?([a-z0-9 ]+(?= build))/;
        } else {
            return /\bhtc[ _\-]?([a-z0-9 ]+)/;
        }
    }],
    ["oppo", /\boppo[_]([a-z0-9]+)/],
    ["konka", /\bkonka[_\-]([a-z0-9]+)/],
    ["sonyericsson", /\bmt([a-z0-9]+)/],
    ["coolpad", /\bcoolpad[_ ]?([a-z0-9]+)/],
    ["lg", /\blg[\-]([a-z0-9]+)/],
    ["android", /\bandroid\b|\badr\b/],
    ["blackberry", function (ua) {
        if (ua.indexOf("blackberry") >= 0) {
            return /\bblackberry\s?(\d+)/;
        }
        return "bb10";
    }],
];

// 操作系统信息识别表达式
var OS = [
    ["wp", function (ua) {
        if (ua.indexOf("windows phone ") !== -1) {
            return /\bwindows phone (?:os )?([0-9.]+)/;
        } else if (ua.indexOf("xblwp") !== -1) {
            return /\bxblwp([0-9.]+)/;
        } else if (ua.indexOf("zunewp") !== -1) {
            return /\bzunewp([0-9.]+)/;
        }
        return "windows phone";
    }],
    ["windows", /\bwindows nt ([0-9.]+)/],
    ["macosx", /\bmac os x ([0-9._]+)/],
    ["ios", function (ua) {
        if (/\bcpu(?: iphone)? os /.test(ua)) {
            return /\bcpu(?: iphone)? os ([0-9._]+)/;
        } else if (ua.indexOf("iph os ") !== -1) {
            return /\biph os ([0-9_]+)/;
        } else {
            return /\bios\b/;
        }
    }],
    ["yunos", /\baliyunos ([0-9.]+)/],
    ["android", function (ua) {
        if (ua.indexOf("android") >= 0) {
            return /\bandroid[ \/-]?([0-9.x]+)?/;
        } else if (ua.indexOf("adr") >= 0) {
            if (ua.indexOf("mqqbrowser") >= 0) {
                return /\badr[ ]\(linux; u; ([0-9.]+)?/;
            } else {
                return /\badr(?:[ ]([0-9.]+))?/;
            }
        }
        return "android";
        //return /\b(?:android|\badr)(?:[\/\- ](?:\(linux; u; )?)?([0-9.x]+)?/;
    }],
    ["chromeos", /\bcros i686 ([0-9.]+)/],
    ["linux", "linux"],
    ["windowsce", /\bwindows ce(?: ([0-9.]+))?/],
    ["symbian", /\bsymbian(?:os)?\/([0-9.]+)/],
    ["blackberry", function (ua) {
        var m = ua.match(re_blackberry_10) ||
            ua.match(re_blackberry_6_7) ||
            ua.match(re_blackberry_4_5);
        return m ? {
            version: m[1]
        } : "blackberry";
    }],
];

// 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
// @param {String} ua, userAgent string.
// @return {Object}
function IEMode(ua) {
    if (!re_msie.test(ua)) {
        return null;
    }

    var m,
        engineMode, engineVersion,
        browserMode, browserVersion;

    // IE8 及其以上提供有 Trident 信息，
    // 默认的兼容模式，UA 中 Trident 版本不发生变化。
    if (ua.indexOf("trident/") !== -1) {
        m = /\btrident\/([0-9.]+)/.exec(ua);
        if (m && m.length >= 2) {
            // 真实引擎版本。
            engineVersion = m[1];
            var v_version = m[1].split(".");
            v_version[0] = parseInt(v_version[0], 10) + 4;
            browserVersion = v_version.join(".");
        }
    }

    m = re_msie.exec(ua);
    browserMode = m[1];
    var v_mode = m[1].split(".");
    if (typeof browserVersion === "undefined") {
        browserVersion = browserMode;
    }
    v_mode[0] = parseInt(v_mode[0], 10) - 4;
    engineMode = v_mode.join(".");
    if (typeof engineVersion === "undefined") {
        engineVersion = engineMode;
    }

    return {
        browserVersion: browserVersion,
        browserMode: browserMode,
        engineVersion: engineVersion,
        engineMode: engineMode,
        compatible: engineVersion !== engineMode
    };
}

// 针对同源的 TheWorld 和 360 的 external 对象进行检测。
// @param {String} key, 关键字，用于检测浏览器的安装路径中出现的关键字。
// @return {Undefined,Boolean,Object} 返回 undefined 或 false 表示检测未命中。
function checkTW360External(key) {
    if (!external) {
        return;
    } // return undefined.
    try {
        //        360安装路径：
        //        C:%5CPROGRA~1%5C360%5C360se3%5C360SE.exe
        var runpath = external.twGetRunPath.toLowerCase();
        // 360SE 3.x ~ 5.x support.
        // 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
        // 因此只能用 try/catch 而无法使用特性判断。
        var security = external.twGetSecurityID(win);
        var version = external.twGetVersion(security);

        if (runpath && runpath.indexOf(key) === -1) {
            return false;
        }
        if (version) {
            return {
                version: version
            };
        }
    } catch (ex) { /* */ }
}

var ENGINE = [
    ["edgehtml", /edge\/([0-9.]+)/],
    ["trident", re_msie],
    ["blink", function () {
        return "chrome" in win && "CSS" in win && /\bapplewebkit[\/]?([0-9.+]+)/;
    }],
    ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/],
    ["gecko", function (ua) {
        var match;
        if ((match = ua.match(/\brv:([\d\w.]+).*\bgecko\/(\d+)/))) {
            return {
                version: match[1] + "." + match[2]
            };
        }
    }],
    ["presto", /\bpresto\/([0-9.]+)/],
    ["androidwebkit", /\bandroidwebkit\/([0-9.]+)/],
    ["coolpadwebkit", /\bcoolpadwebkit\/([0-9.]+)/],
    ["u2", /\bu2\/([0-9.]+)/],
    ["u3", /\bu3\/([0-9.]+)/],
];
var BROWSER = [
    // Microsoft Edge Browser, Default browser in Windows 10.
    ["edge", /edge\/([0-9.]+)/],
    // Sogou.
    ["sogou", function (ua) {
        if (ua.indexOf("sogoumobilebrowser") >= 0) {
            return /sogoumobilebrowser\/([0-9.]+)/;
        } else if (ua.indexOf("sogoumse") >= 0) {
            return true;
        }
        return / se ([0-9.x]+)/;
    }],
    // TheWorld (世界之窗)
    // 由于裙带关系，TheWorld API 与 360 高度重合。
    // 只能通过 UA 和程序安装路径中的应用程序名来区分。
    // TheWorld 的 UA 比 360 更靠谱，所有将 TheWorld 的规则放置到 360 之前。
    ["theworld", function () {
        var x = checkTW360External("theworld");
        if (typeof x !== "undefined") {
            return x;
        }
        return "theworld";
    }],
    // 360SE, 360EE.
    ["360", function (ua) {
        var x = checkTW360External("360se");
        if (typeof x !== "undefined") {
            return x;
        }
        if (ua.indexOf("360 aphone browser") !== -1) {
            return /\b360 aphone browser \(([^\)]+)\)/;
        }
        return /\b360(?:se|ee|chrome|browser)\b/;
    }],
    // Maxthon
    ["maxthon", function () {
        try {
            if (external && (external.mxVersion || external.max_version)) {
                return {
                    version: external.mxVersion || external.max_version
                };
            }
        } catch (ex) { /* */ }
        return /\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/;
    }],
    ["micromessenger", /\bmicromessenger\/([\d.]+)/],
    ["qq", /\bm?qqbrowser\/([0-9.]+)/],
    ["green", "greenbrowser"],
    ["tt", /\btencenttraveler ([0-9.]+)/],
    ["liebao", function (ua) {
        if (ua.indexOf("liebaofast") >= 0) {
            return /\bliebaofast\/([0-9.]+)/;
        }
        if (ua.indexOf("lbbrowser") === -1) {
            return false;
        }
        var version;
        try {
            if (external && external.LiebaoGetVersion) {
                version = external.LiebaoGetVersion();
            }
        } catch (ex) { /* */ }
        return {
            version: version || NA_VERSION
        };
    }],
    ["tao", /\btaobrowser\/([0-9.]+)/],
    ["coolnovo", /\bcoolnovo\/([0-9.]+)/],
    ["saayaa", "saayaa"],
    // 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
    ["baidu", /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
    // 后面会做修复版本号，这里只要能识别是 IE 即可。
    ["ie", re_msie],
    ["mi", /\bmiuibrowser\/([0-9.]+)/],
    // Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
    ["opera", function (ua) {
        var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
        var re_opera_new = /\bopr\/([0-9.]+)/;
        return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
    }],
    ["oupeng", /\boupeng\/([0-9.]+)/],
    ["yandex", /yabrowser\/([0-9.]+)/],
    // 支付宝手机客户端
    ["ali-ap", function (ua) {
        if (ua.indexOf("aliapp") > 0) {
            return /\baliapp\(ap\/([0-9.]+)\)/;
        } else {
            return /\balipayclient\/([0-9.]+)\b/;
        }
    }],
    // 支付宝平板客户端
    ["ali-ap-pd", /\baliapp\(ap-pd\/([0-9.]+)\)/],
    // 支付宝商户客户端
    ["ali-am", /\baliapp\(am\/([0-9.]+)\)/],
    // 淘宝手机客户端
    ["ali-tb", /\baliapp\(tb\/([0-9.]+)\)/],
    // 淘宝平板客户端
    ["ali-tb-pd", /\baliapp\(tb-pd\/([0-9.]+)\)/],
    // 天猫手机客户端
    ["ali-tm", /\baliapp\(tm\/([0-9.]+)\)/],
    // 天猫平板客户端
    ["ali-tm-pd", /\baliapp\(tm-pd\/([0-9.]+)\)/],
    // UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
    // UC 桌面版浏览器携带 Chrome 信息，需要放在 Chrome 之前。
    ["uc", function (ua) {
        if (ua.indexOf("ucbrowser/") >= 0) {
            return /\bucbrowser\/([0-9.]+)/;
        } else if (ua.indexOf("ubrowser/") >= 0) {
            return /\bubrowser\/([0-9.]+)/;
        } else if (/\buc\/[0-9]/.test(ua)) {
            return /\buc\/([0-9.]+)/;
        } else if (ua.indexOf("ucweb") >= 0) {
            // `ucweb/2.0` is compony info.
            // `UCWEB8.7.2.214/145/800` is browser info.
            return /\bucweb([0-9.]+)?/;
        } else {
            return /\b(?:ucbrowser|uc)\b/;
        }
    }],
    ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
    // Android 默认浏览器。该规则需要在 safari 之前。
    ["android", function (ua) {
        if (ua.indexOf("android") === -1) {
            return;
        }
        return /\bversion\/([0-9.]+(?: beta)?)/;
    }],
    ["blackberry", function (ua) {
        var m = ua.match(re_blackberry_10) ||
            ua.match(re_blackberry_6_7) ||
            ua.match(re_blackberry_4_5);
        return m ? {
            version: m[1]
        } : "blackberry";
    }],
    ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
    // 如果不能被识别为 Safari，则猜测是 WebView。
    ["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
    ["firefox", /\bfirefox\/([0-9.ab]+)/],
    ["nokia", /\bnokiabrowser\/([0-9.]+)/],
];

// UserAgent Detector.
// @param {String} ua, userAgent.
// @param {Object} expression
// @return {Object}
//    返回 null 表示当前表达式未匹配成功。
function detect(name, expression, ua) {
    var expr = isFunction(expression) ? expression.call(null, ua) : expression;
    if (!expr) {
        return null;
    }
    var info = {
        name: name,
        version: NA_VERSION,
        codename: ""
    };
    var t = toString(expr);
    if (expr === true) {
        return info;
    } else if (t === "[object String]") {
        if (ua.indexOf(expr) !== -1) {
            return info;
        }
    } else if (isObject(expr)) { // Object
        if (expr.hasOwnProperty("version")) {
            info.version = expr.version;
        }
        return info;
    } else if (expr.exec) { // RegExp
        var m = expr.exec(ua);
        if (m) {
            if (m.length >= 2 && m[1]) {
                info.version = m[1].replace(/_/g, ".");
            } else {
                info.version = NA_VERSION;
            }
            return info;
        }
    }
}

var na = {
    name: "na",
    version: NA_VERSION
};
// 初始化识别。
function init(ua, patterns, factory, detector) {
    var detected = na;
    each(patterns, function (pattern) {
        var d = detect(pattern[0], pattern[1], ua);
        if (d) {
            detected = d;
            return false;
        }
    });
    factory.call(detector, detected.name, detected.version);
}

// 解析 UserAgent 字符串
// @param {String} ua, userAgent string.
// @return {Object}
var parse = function (ua) {
    ua = (ua || "").toLowerCase();
    var d = {};

    init(ua, DEVICES, function (name, version) {
        var v = parseFloat(version);
        d.device = {
            name: name,
            version: v,
            fullVersion: version
        };
        d.device[name] = v;
    }, d);

    init(ua, OS, function (name, version) {
        var v = parseFloat(version);
        d.os = {
            name: name,
            version: v,
            fullVersion: version
        };
        d.os[name] = v;
    }, d);

    var ieCore = IEMode(ua);

    init(ua, ENGINE, function (name, version) {
        var mode = version;
        // IE 内核的浏览器，修复版本号及兼容模式。
        if (ieCore) {
            version = ieCore.engineVersion || ieCore.engineMode;
            mode = ieCore.engineMode;
        }
        var v = parseFloat(version);
        d.engine = {
            name: name,
            version: v,
            fullVersion: version,
            mode: parseFloat(mode),
            fullMode: mode,
            compatible: ieCore ? ieCore.compatible : false
        };
        d.engine[name] = v;
    }, d);

    init(ua, BROWSER, function (name, version) {
        var mode = version;
        // IE 内核的浏览器，修复浏览器版本及兼容模式。
        if (ieCore) {
            // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
            if (name === "ie") {
                version = ieCore.browserVersion;
            }
            mode = ieCore.browserMode;
        }
        var v = parseFloat(version);
        d.browser = {
            name: name,
            version: v,
            fullVersion: version,
            mode: parseFloat(mode),
            fullMode: mode,
            compatible: ieCore ? ieCore.compatible : false
        };
        d.browser[name] = v;
    }, d);
    return d;
};


detector = parse(userAgent + " " + appVersion + " " + vendor);

module.exports = detector;


},{}],8:[function(require,module,exports){
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
    /*xhr.withCredentials = !0;*/
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

},{"./config":1,"./uaDetector":7}]},{},[4]);
