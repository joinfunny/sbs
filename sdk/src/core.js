var config = require('./config');
var _ = require('./utils');
var store = require('./store');
var md5 = require('./md5');

/**
 * 监听器状态
 * @type {Object}
 */
var MONITORSTATE = {
    SENDING: 'monitor_sending',
    SEND: 'monitor_send',
    AUTHING: 'monitor_authing',
    AUTH: 'monitor_auth',
    SENDINGDATALEN: 'monitor_sending_len'
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
            authingState = sessionProp[MONITORSTATE.AUTHING],
            sendingState = sessionProp[MONITORSTATE.SENDING];


        if (authState) {
            if (!sendingState) {
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
            //如果当前有数据正在发送，则跳过正在发送的数据，将剩下的事件数据一次性全部发送
            var data = session[MONITORSTATE.SENDING] && session[MONITORSTATE.SENDINGDATALEN] ? eventPool.splice(session[MONITORSTATE.SENDINGDATALEN]) : eventPool.splice(0);
            that.globalContext.setTempEventPool(tempEventPool);
            //将事件池的剩下的正在发送的事件清出队列，有一定的概率会丢掉这些尚在发送中的数据。不过这个目前不再考虑了。可以承受范围内的
            that.globalContext.setEventPool(eventPool.splice(0));
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

        var sessionProp = {};

        var data = Array.prototype.slice.call(eventPool, 0);

        var postLength = sessionProp[MONITORSTATE.SENDINGDATALEN] = data.length;

        store.setSessionProps(sessionProp);

        //如果存在临时缓存数据，将临时数据加入发送队列中，并清空临时缓存
        if (tempEventPool.length > 0) {
            var tempData = tempEventPool.splice(0);
            data = Array.prototype.concat.call(tempData, data);
            that.globalContext.setTempEventPool(tempEventPool);
        }

        sessionProp = {};
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
