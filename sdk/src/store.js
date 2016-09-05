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

