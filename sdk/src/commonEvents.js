var _ = require('./utils');
var store = require('./store');
var core = require('./core');
var dom = require('./dom');
var rxStream = require('./rxStream');
var JSON = require('./JSON');


//浏览页面:一进入页面就开始发送一个track，将referURL，进入页面的时间等记录
var config = rxStream.loadTime;
var tools = {
  // 获取谷歌标准参数
  getUtm: function () {
    return _.info.campaignParams();
  },
  // 获取当前页面停留时间
  getStayTime: function () {
    return ((new Date()) - config.loadTime) / 1000;
  }
};
var commonEvents = {
  /**
   * 浏览页面
   */
  trackViewPage: function () {
    var compaignParams = _.info.campaignParams();
    var h1s = document.body && document.body.getElementsByTagName('h1') || [];
    var pageH1 = '';
    _.isArray(h1s) && h1s.length > 0 && (pageH1 = dom.innerText(h1s[0]));

    rxStream.track("e_view_page", _.extend({
      b_page_referrer: document.referrer,
      b_page_referrer_host: _.info.referringDomain(document.referrer),
      b_page_url: location.href,
      b_page_url_path: location.pathname,
      b_page_title: document.title,
      b_page_h1: pageH1,
      b_browser_language: navigator.language
    }, compaignParams));
  },
  /**
   * 离开页面
   * 需要监听onload时间，用以获取页面的整体资源加载时间
   */
  trackLeavePage: function () {
    dom.addEvent(window, 'load', function () {
      var pageLoadTime = tools.getStayTime();
      core.globalContext.set('pageLoadTime', pageLoadTime);
      _.log('页面加载时间：' + pageLoadTime);
    });
    dom.addEvent(window, 'beforeunload', function (e) {
      var pageLoadTime = core.globalContext.get('pageLoadTime');
      var scrollPos = dom.getPageScroll();
      var properties = $.extend({
        b_page_load_time: pageLoadTime,
        b_page_stay_time: tools.getStayTime()
      }, scrollPos);
      _.log('页面离开：' + JSON.stringify(properties));
      rxStream.track('e_leave_page', properties, true);
    });
  },
  /*
   * 点击元素
   */
  trackClick: function () {
    dom.addEvent(document, 'click', function (e) {
      var preset = dom.getClickPreset(e);
      preset && rxStream.track(preset.event, preset.properties);
    });
  }

};

module.exports = commonEvents;
