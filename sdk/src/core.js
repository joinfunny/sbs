var config = require('./config');
var _ = require('./utils');
var store = require('./store');
var md5 = require('./jMd5');
var JSON = require('./JSON');

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
    /**
     * 事件属性字段验证
     */
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
    /**
     * 主体对象属性字段验证
     */
    subject: function (p) {
      _.validateProperties(p);
      if (p) {
        if (_.isObject(p)) {
          if (this.checkPropertiesKey(p)) {
            return true;
          } else {
            _.log('subject里的key必须是由字符串数字_组成');
            return false;
          }
        } else {
          _.log('subject可以没有，但有的话必须是对象');
          return false;
        }
      } else {
        return true;
      }
    },
    /**
     * 客体对象属性字段验证
     */
    object: function (p) {
      _.validateProperties(p);
      if (p) {
        if (_.isObject(p)) {
          if (this.checkPropertiesKey(p)) {
            return true;
          } else {
            _.log('object里的key必须是由字符串数字_组成');
            return false;
          }
        } else {
          _.log('object可以没有，但有的话必须是对象');
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
    },
    userId: function (id) {
      if (_.isString(id) || _.isNumber(id) && /^.{1,255}$/.test(id)) {
        return true;
      } else {
        _.log('userId必须是不能为空，且小于255位的字符串');
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
    lock: false,
    eventPool: [],
    get: function (key) {
      return key ? this.state[key] : this.state;
    },
    set: function (key, value) {
      this.state[key] = value;
    },
    getEventPool: function () {
      var pool = _.localStorage.parse(config.LIB_KEY + 'EventPool' + config.appId, []);
      return pool;
    },
    /*getTempEventPool: function () {
      var pool = _.localStorage.parse(config.LIB_KEY + 'EventPool_temp_' + config.appId, []);
      return pool;
    },*/
    setEventPool: function (eventPool) {
      _.localStorage.set(config.LIB_KEY + 'EventPool' + config.appId, JSON.stringify(eventPool));
    },
    /*setTempEventPool: function (eventPool) {
      _.localStorage.set(config.LIB_KEY + 'EventPool_temp_' + config.appId, JSON.stringify(eventPool));
    },*/
    /**
     * 事件入池
     */
    pushEvent: function (event) {
      event.__UUID__ = _.UUID();
      event.sending = false;
      var pool = this.getEventPool();
      pool.push(event);
      this.setEventPool(pool);
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
  send: function (props) {
    var data = {
      properties: {},
      subject: {},
      object: {}
    };
    _.extend(data, props);
    if (_.isObject(props.properties) && !_.isEmptyObject(props.properties)) {
      _.extend(data.properties, props.properties);
    }
    if (_.isObject(props.subject) && !_.isEmptyObject(props.subject)) {
      _.extend(data.subject, props.subject);
    }
    if (_.isObject(props.object) && !_.isEmptyObject(props.object)) {
      _.extend(data.object, props.object);
    }
    // profile时不传公用属性
    if (!props.action || props.action.slice(0, 7) !== 'profile') {
      //优先级：系统默认属性<本页设置的属性<session属性<全局存储属性<事件属性
      _.extend(data.properties, store.getProps(), store.getSessionProps(), _.info.currentProps, _.info.properties());
      _.extend(data.subject, store.getSubject(), store.getSessionSubject(), _.info.currentSubject);
      _.extend(data.object, store.getObject(), store.getSessionObject(), _.info.currentObject);
    }
    data.time = _.formatDate(new Date());
    //data.domain = store.getDomain();
    _.searchObjDate(data);

    _.log('追踪到事件：\r\n' + JSON.stringify(data, null, 4));

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
    var that = this;
    if (sendImmediately) {
      this.path(true);
      return;
    }

    //授权状态
    var session = store.getSession(),
      authState = session[MONITORSTATE.AUTH],
      authingState = session[MONITORSTATE.AUTHING],
      sendingState = session[MONITORSTATE.SENDING];

    //如果授权通过
    if (authState) {
      //是否处于发送事件状态，如果没有在发送，则发送
      if (!sendingState) {
        this.path();
      }
    } else { //未授权或者授权失效
      if (!authingState) {
        this.auth(function (authState) {
          authState && that.path();
        });
      }
    }
  },
  /**
   * TOKEN验证
   * param cb 回调函数，在授权成功后可以进行的操作
   * 异步请求，等待返回。
   */
  auth: function (cb) {

    var url = config.apiHost + '/token/' + config.appId + '?randomId=' + store.getSessionId() + '&domain=' + store.getDomain();

    store.setSession(MONITORSTATE.AUTHING, true);

    _.ajax({
      url: url,
      type: "GET",
      cors: true,
      success: function (data) {
        var result = data,
          authed = result.code === 200;

        store.setSession(MONITORSTATE.AUTH, authed);

        if (authed) {
          store.setSession('token', result.token);
        } else {
          _.log(result.msg || result.message);
        }
      },
      error: function (xhr) {
        _.log(xhr.status);
        _.log(xhr.statusText);
      },
      complete: function (xhr) {
        store.setSession(MONITORSTATE.AUTHING, false);
        var authState = store.getSession(MONITORSTATE.AUTH);
        cb && cb(authState);
      }
    });
  },
  //支持两种发送模式：
  //1、sendImmediately:立即发送模式，ajax异步的方式发送事件数据，不对事件数据进行监听
  //2、lately:缓存发送模式，SDK判断缓存数据量，发送数据
  path: function (sendImmediately, cb) {
    var that = this,
      session = store.getSession(),
      authed = session[MONITORSTATE.AUTH],
      sendingState = session[MONITORSTATE.SENDING];

    if (!authed || sendingState) {
      return;
    }

    var url = config.apiHost + '/receive',
      limit = config.sendLimit || 1;

    //更新状态正在发送数据中
    store.setSession(MONITORSTATE.SENDING, true);

    var sendingEvents = that.getWaitSendEvents(),
      postLength = sendingEvents.length,
      i = 0,
      dataIds = [];

    if (!sendImmediately && postLength < limit) {
      store.setSession(MONITORSTATE.SENDING, false);
      return;
    }

    _.each(sendingEvents, function (item) {
      item.sending = true;
      dataIds.push(item.__UUID__);
      i++;
    });

    var postEvents = that.getPackingEvents(sendingEvents);

    /**
     * 200 成功
     * 402 token失效
     * 403 传参错误
     * 500 系统错误
     */
    _.ajax({
      url: url,
      type: "POST",
      cors: true,
      contentType: "application/json",
      data: postEvents,
      success: function (data) {
        try {
          //返回空值：将请求体内的事件踢出栈
          if (_.isEmptyObject(data) || (data.code === 200)) {
            that.removeSendedEvents(dataIds);
          } else if (data.code === 402) {
            //授权失效状态，重新发送授权
            store.setSession(MONITORSTATE.AUTH, false);
            //进行授权请求，请求通过后发起一次事件发送
            that.auth(function (authState) {
              authState && that.path();
            });
          } else {
            //发送失败，将本次发送的数据状态更新为未发送状态
            that.resetUnsendedEvents(dataIds);
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
        store.setSession(MONITORSTATE.SENDING, false);
        _.log('事件发送完毕.');
      }
    });

    if (sendImmediately) {
      that.removeSendedEvents(dataIds);
      store.setSession(MONITORSTATE.SENDING, false);
    }
  },
  /**
   * 获取事件池内等待发送的数据
   */
  getWaitSendEvents: function () {
    var that = this,
      eventPool = that.globalContext.getEventPool(),
      events = [];
    events = _.arrayFilter(eventPool, function (event, index, arr) {
      return !event.sending;
    });
    _.log('获取到待发送数据：\r\n' + JSON.stringify(events, null, 4));
    return events;
  },
  /**
   * 删除已经发送出去的事件
   */
  removeSendedEvents: function (sendedEventIds) {
    var that = this,
      eventPool = that.globalContext.getEventPool();
    eventPool = _.arrayFilter(eventPool, function (event, index, arr) {
      return sendedEventIds.indexOf(event.__UUID__) === -1;
    });
    that.globalContext.setEventPool(eventPool);
  },
  /**
   * 重置发送失败的事件
   */
  resetUnsendedEvents: function (unSendedEventIds) {
    var that = this,
      eventPool = that.globalContext.getEventPool();
    _.each(eventPool, function (event) {
      if (unSendedEventIds.indexOf(event.__UUID__) >= 0) {
        event.sending = false;
      }
    });
    that.globalContext.setEventPool(eventPool);
  },
  getPackingEvents: function (events) {
    var session = store.getSession(),
      token = session.token,
      sessionId = session.sessionId, deviceId = store.getDeviceId(),
      eventsStr = JSON.stringify(events),
      cache = store.get(),
      dataStr = JSON.stringify({
        "appId": config.appId,
        "uniqueId": deviceId,
        "userId": cache ? cache['userId'] : '',
        "events": eventsStr
      }),
      sign = md5(dataStr + token),
      postData = JSON.stringify({
        "datatime": _.formatDate(new Date()),
        //"domain": store.getDomain(),
        "lib": 'js',
        "sign": sign,
        "appId": config.appId,
        "randomId": sessionId,
        "data": dataStr
      });
    _.log('发送事件数据：\r\n' + JSON.stringify(events, null, 4));
    return postData;
  }
};
