;(function(para) {
  var p = para.sdk_url, n = para.name, w = window, d = document, s = 'script',x = null,y = null;
  w['sensorsDataAnalytic201505'] = n;
  w[n] = w[n] || function(a) {return function() {(w[n]._q = w[n]._q || []).push([a, arguments]);}};
  var ifs = ['track','quick','register','registerOnce','registerSession','registerSessionOnce','trackSignup', 'trackAbtest', 'setProfile','setOnceProfile','appendProfile', 'incrementProfile', 'deleteProfile', 'unsetProfile', 'identify'];
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
  sdk_url: 'https://www.sensorsdata.cn/sdk/sensorsdata.sdk.js',
  name: 'sa',
  server_url: 'https://sensorswww.cloud.sensorsdata.cn:4006/sa.gif?token=6b551cb59b1c1973'
});

sa.quick('setSessionReferrer');

// track官网访问
sa.track('www_visit',{page:location.href});
sa.quick('autoTrack');

(function(i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function() {
      (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
  a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-65370777-1', 'auto');
ga('send', 'pageview');


// 统计的方法
var saStartTime = new Date();

function getHostUrl() {
  var split = document.referrer.split("/");
  if (split.length >= 3) {
    return split[2];
  }
  return "";
}

function getFromUrl() {
  var fromUrl = '没有来源';

  var search = location.search;
  try{
    var temp = '';
    if(!/utm_source=/.test(search) && !/ch=/.test(search)){
      temp = sa.store._sessionState._session_from_url;
      if(temp){
        return fromUrl;
      } 
    }
  }catch(e){};

  if ( search && search.slice(1)) {
    var searchUrl = search.slice(1);
    var matchCh = searchUrl.match(/ch=([^&]+)/);
    var matchUtm = searchUrl.match(/utm_source=([^&]+)/);
    var type = Object.prototype.toString;
    if(type.call(matchUtm) === '[object Array]' && matchUtm[1]){
      fromUrl = matchUtm[1];
    }
    if (type.call(matchCh) === '[object Array]' && matchCh[1]) {
      fromUrl = matchCh[1];
    }
  }
  sa.registerSessionOnce({_session_from_url: fromUrl});
  return fromUrl;
}

function saTrackPage(trackName, callback) {
  var fromUrl = getFromUrl();
        
  sa.track(trackName, {
    pageUrl: location.href,
    referrerUrl: document.referrer,
    fromUrl: fromUrl,
    referrHostUrl: getHostUrl()
  });

  if (callback) {
    callback(fromUrl);
  }
}

function getSaScroll() {
  if ($('#desc_wrapper_2').length < 1 || $('#desc_wrapper_2').length < 1) {
    return 1;
  }

  var pos = [
    $('#desc_wrapper_1').offset().top + 100,
    $('#desc_wrapper_2').offset().top + 100,
    $('#desc_wrapper_3').offset().top
  ];
  var top = $(window).scrollTop();
  var height = $(window).height();

  for (var i = 0; i < pos.length; i++) {
    if (top + height < pos[i]) {
      return i + 1;
    }
  }
  return i + 1;


}


function saTrackLeave(trackName) {
  window.onbeforeunload = function() {
    var end = new Date();
    var duration = (end.getTime() - saStartTime.getTime()) / 1000;
    sa.track(trackName, {
      pageUrl: location.href,
      pageStayTime: duration,
      pagePosition: getSaScroll()
    });
  };
}



var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "//hm.baidu.com/hm.js?6a4234645eea169646c16959cb1c29b0";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();


