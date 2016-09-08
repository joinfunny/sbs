(function(para) {
  var p = para.sdk_url,
    n = para.name,
    w = this,
    d = w.document,
    s = 'script',
    x = null,
    y = null;
  w['bassdk201603'] = n;
  w[n] = w[n] || function(a) {
    return function() {
      (w[n]._q = w[n]._q || []).push([a, arguments]);
    }
  };
  var ifs = ['track', 'quick', 'register', 'registerOnce', 'registerSession', 'registerSessionOnce', 'trackSignup', 'trackAbtest', 'setProfile', 'setOnceProfile', 'appendProfile', 'incrementProfile', 'deleteProfile', 'unsetProfile', 'identify', 'userIdentify'];
  for (var i = 0; i < ifs.length; i++) {
    w[n][ifs[i]] = w[n].call(null, ifs[i]);
  }
  if (!w[n]._t) {
    x = d.createElement(s), y = d.getElementsByTagName(s)[0];
    x.async = 1;
    x.src = p;
    y.parentNode.insertBefore(x, y);
    w[n]._t = 1 * new Date();
    w[n].para = para;
  }
})({
  sdk_url: 'http://bas.ruixuesoft.com/sdk/bas-data.1.0.0.js',
  name: 'bas',
  server_url: 'http://monitor.ruixuesoft.com/monitor/services/monitor/send',
  topic_u: 'bas_user',
  topic_e: 'bas_event'
});


/**
 * Bas埋点常用API使用说明：
 * 注册用户（登录场景同样适用）场景：
 *  //userId为注册完成后生成的用户Id
 *  //bas.trackSignup是为了更新以前只有cookie_id的数据，将其对应的userId补全
    bas.trackSignup(userId, 'signUp', {
        ReferrerUrl: document.referrer,
        FromUrl: '',
        userName: userInfo.userName,
        companyName: userInfo.companyName,
        telephone: userInfo.tel,
        email: userInfo.email
    });
    //bas.userIdentify是为了将本地的cookie_id赋值为userId。
    bas.userIdentify(userId, true);

    
    topic设置为**_user，是为了收集注册用户的数据
    properties.topic = 'bas_rongcapital_users';
    bas.track('signUp', properties);
      
 */

;
(function() {
  var bas = window.bas || {};
  bas.__events = {

    ViewScreenPage: {
      begin: function(index) {
        this.beginDate = new Date();
        this.stayposition = index;
      },
      end: function() {
        this.endDate = new Date();
        this.stayposition = this.stayposition || 0;
        this.stayTime = (this.endDate.getTime() - this.beginDate.getTime()) / 1000;
        bas.track('ViewScreenPage', {
          staytime: this.stayTime,
          stayposition: this.stayposition
        })
      }
    },
    ViewHomePage: {
      startTime: new Date(),
      track: function() {
        this.endDate = new Date();
        this.pageloadingtime = (this.endDate.getTime() - this.startTime.getTime()) / 1000;
        bas.track('ViewHomePage', {
          pageloadingtime: this.pageloadingtime
        })
      }
    },
    RegistUserButtonClick: {
      track: function(userInfo) {
        bas.track('RegistUserButtonClick', {})
      }
    },
    signup: {
      track: function(userInfo) {
        var propertys = {
          topic: 'h5plus_user',
          $id: userInfo.userId || userInfo.telephone,
          $name: userInfo.userName||'',
          $province: userInfo.province||'',
          $city: userInfo.city||'',
          telephone: userInfo.telephone||''
        };
        bas.track('ComplateButtonClick', propertys);
        bas.trackSignup(propertys.$id, 'ComplateButtonClick', {});
        bas.userIdentify(propertys.$id, true);
      }
    }
  }
})();