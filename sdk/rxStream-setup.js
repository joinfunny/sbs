//下述代码是我们SDK埋点代码的非压缩版。可参照注释部分灵活调整
(function (para) {
  var sdkUrl = para.sdkUrl,
    sdkName = para.name,
    win = this,
    doc = win.document,
    x = null,
    y = null;
  win['RXSTREAM201607'] = sdkName;
  win[sdkName] = win[sdkName] || function (a) {
    return function () {
      (win[sdkName]._rx = win[sdkName]._rx || []).push([a, arguments]);
    }
  };

  var openFuncs = ['track', 'trackSignup', 'identify'];
  for (var i = 0; i < openFuncs.length; i++) {
    win[sdkName][openFuncs[i]] = win[sdkName].call(null, openFuncs[i]);
  }

  if (!win[sdkName].lt) {
    x = doc.createElement('script'), y = doc.getElementsByTagName('script')[0];
    x.async = true;
    x.src = sdkUrl;
    y.parentNode.insertBefore(x, y);
    win[sdkName].lt = 1 * new Date();
    win[sdkName].para = para;
  }
})({
  sdkUrl: location.protocol+'//'+ window.$$rx.sdkUrl,//此为我们要引入的SDK地址，此参数我们在SDK生成的时候已经输出了，可不用更改
  sendLimit: 1,//SDK支持批量事件一次发送，默认我们设置的为1条事件就触发，这样可以保证事件收集的准确性与及时性。
  showLog: true,//是否在开发者工具的console中输出事件收集日志。
  name: 'rxStream',//外部系统调用时的全局变量名，客户可灵活调整。
  autoTrack: true,//是否开启自动事件收集，如果为true,则系统会自动收集浏览页面、点击按钮、点击链接、离开页面这四项基础事件。如果觉得没用的话，可以写为false.
  apiHost: location.protocol+'//'+ window.$$rx.sdkServerUrl,//服务地址，不可更改。每个客户的serverUrl都不相同。
  appId: window.$$rx.appId
});


//下述代码为我们的一些实践代码，客户可参考使用(代码结构可根据自己项目特性灵活调整..
//下述代码为我们的推荐方案：预先将我们的自定义事件方法定义完整，后续在具体的业务代码中只需要调用某一个方法即可)。
//自定义事件埋点的代码段必须置于上述SDK代码片段之后。
(function () {
  var sdk = window.rxStream || {};
  sdk.__events = {
    /**
     * 浏览滚屏
     * 一些滚屏插件中需要调用此方法
     * 调用方式:开始滚屏时调用：
     * sdk.__events.ViewScreenPage.begin(index);
     * 滚屏结束事件中调用：sdk.__events.ViewScreenPage.end();
     */
    pageExchange: {
      begin: function (index) {
        this.beginDate = new Date();
        this.stayposition = index;
      },
      end: function () {
        if (!this.beginDate) return;
        this.endDate = new Date();
        this.stayposition = this.stayposition || 0;
        this.stayTime = (this.endDate.getTime() - this.beginDate.getTime()) / 1000;

        sdk.track('page_exchange', {
          properties: {
            b_stayTime: this.stayTime,
            b_stayPosition: this.stayposition
          }
        });
      }
    },
    /**
     * 浏览首页
     */
    ViewHomePage: {
      startTime: new Date(),
      track: function () {
        this.endDate = new Date();
        this.pageloadingtime = (this.endDate.getTime() - this.startTime.getTime()) / 1000;
        sdk.track('ViewHomePage', {
          pageLoadingTime: this.pageloadingtime
        });
      }
    },
    /*
     * 点击注册按钮
     */
    RegistUserButtonClick: {
      track: function (userInfo) {
        sdk.track('e_click_btn_sign_up', {});
      }
    },
    /**
     * 注册用户事件
     * userId为SDK敏感属性，不允许将属性定义为userId
     * 其他的敏感属性字段包括：uniqueId，originalId，time，properties，id，firstId，secondId，users，events，event，userId，date，datetime.
     */
    signup: {
      track: function (userInfo) {
        var subject = {
          o_user_name: userInfo.userName || '',
          o_user_telephone: userInfo.tel || ''
        };
        sdk.trackSignup(userInfo.tel, 'userRegister', { subject: subject });
      }
    },
    /**
     * 注册登录
     */
    signIn: {
      track: function (userInfo) {
        var userId = userInfo.id;
        var subject = {
          o_user_name: userInfo.userName || ''
        };
        sdk.trackSignup(userId, 'user_login', { subject: subject });
      }
    },
    view_analysis_list: {
      track: function (data) {
        var properties = {
          b_analysis_type: data.b_analysis_type
        };
        sdk.track('view_analysis_list', { properties: properties });
      }
    },
    addOverview: {
      track: function (data) {
        var properties = {
          b_overview_title: data.b_overview_title,
          b_analysis_count: data.b_analysis_count
        };
        sdk.track('addOverview', { properties: properties });
      }
    }
  }
})();

//测试调用
//window.rxStream.__events.ViewHomePage.track();