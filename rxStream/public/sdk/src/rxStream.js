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
  /**
   * 全局设置第一次访问网站时的referrer信息:store._state
   * referrer
   * domain
   */
  setInitReferrer: function () {
    var _referrer = document.referrer;
    store.setPropsOnce({
      b_dollar_page_referrer: _referrer,
      b_dollar_referrer_domain: _.info.referringDomain(_referrer)
    });
  },
  /**
   * Session设置初始化:store._sessionState
   * referrer
   * domain
   */
  setSessionReferrer: function () {
    var _referrer = document.referrer;
    store.setSessionPropsOnce({
      b_dollar_session_referrer: _referrer,
      b_dollar_session_referrer_domain: _.info.referringDomain(_referrer)
    });
  },
  /**
   * 注册当前页面的初始化信息_.info.currentProps
   * pageUrl
   * referrer
   * domain
   */
  setDefaultAttr: function () {
    _.info.register({
      b_dollar_page_url: location.href,
      b_dollar_referrer: document.referrer,
      b_dollar_referring_domain: _.info.referringDomain(document.referrer)
    });
  },
  /**
   * 事件自动追踪
   */
  autoTrack: function () {
    var that = this;
    var compaignParams = _.info.campaignParams();

    /*rxStream.setOnceProfile(_.extend({
        b_dollar_first_visit_time: new Date(),
        b_dollar_first_referrer: document.referrer,
        b_dollar_first_referrer_host: _.info.referringDomain(document.referrer),
        b_dollar_domain: _.info.referringDomain(location.href)
    }, compaignParams));*/

    var h1s = document.body && document.body.getElementsByTagName('h1') || [],
      pageH1 = '';

    if (_.isArray(h1s) && h1s.length > 0) {
      pageH1 = dom.innerText(h1s[0]);
    }

    that.track("e_view_page", {
      properties: _.extend({
        b_page_referrer: document.referrer,
        b_page_referrer_host: _.info.referringDomain(document.referrer),
        b_page_url: location.href,
        b_page_url_path: location.pathname,
        b_page_title: document.title,
        b_page_h1: pageH1,
        b_browser_language: navigator.language
      }, compaignParams),
      subject: {},
      object: {}
    });
    //注册load事件是为了获取到页面资源加载完成时间
    dom.addEvent(window, 'load', function () {
      var pageLoadTime = commonWays.getStayTime();
      core.globalContext.set('pageLoadTime', pageLoadTime);
      _.log('页面加载时间：' + pageLoadTime);
    });
    dom.addEvent(document, 'click', function (e) {
      var preset = dom.getClickPreset(e);
      preset && that.track(preset.event, {
        properties: preset.properties,
        subject: {},
        object: {}
      });
    });
    dom.addEvent(window, 'beforeunload', function (e) {
      var pageLoadTime = core.globalContext.get('pageLoadTime');
      var pageStayTime = commonWays.getStayTime();
      var scrollPos = dom.getPageScroll();
      var properties = _.extend({
        b_page_load_time: pageLoadTime,//页面加载时间
        b_page_stay_time: pageStayTime//页面停留时间
      }, scrollPos);
      //_.log('页面离开：' + JSON.stringify(properties));
      that.track('e_leave_page', {
        properties: properties,
        subject: {},
        object: {}
      }, true);//离开页面时立即将事件池清空，全部发送
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
 * @param {string} properties 要发送的事件数据，JSON对象，包含三个属性：properties,subject,object
 * @param {boolean} sendImmediately 是否立即发送
 * */
rxStream.track = function (event, props, sendImmediately) {
  if (core.check({
    event: event,
    properties: props.properties,
    subject: props.subject,
    object: props.object
  })) {
    core.send(_.extend({
      action: 'track',
      event: event,
      sly: sendImmediately
    }, props));
  }
};

rxStream.setSubject = function (p) {
  if (core.check({
    propertiesMust: p
  })) {
    store.setSubject(p);
  }
};

rxStream.setOnceSubject = function (p) {
  if (core.check({
    propertiesMust: p
  })) {
   store.setSubjectOnce(p);
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
rxStream.appendSubject = function (p) {
  if (core.check({
    propertiesMust: p
  })) {
    _.each(p, function (value, key) {
      if (_.isString(value)) {
        p[key] = [value];
      } else if (_.isArray(value)) {

      } else {
        delete p[key];
        _.log('appendSubject属性的值必须是字符串或者数组');
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
 * @param isSave 是否全局保存，true:更新全局的Cookie，false:仅限于当页更新
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
/**
 * 注册事件
 * @param id 客户系统用户标识
 * @param e 事件名
 * @param p 事件的属性
 */
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
      that[params[0]].apply(that, Array.prototype.slice.call(params[1]));
    });
  }

  if (that.config['autoTrack'] === !0) {
    that.autoTrack();
  }

  //core.auth();

  //_.log('主文件加载成功！');

};
module.exports = rxStream;
