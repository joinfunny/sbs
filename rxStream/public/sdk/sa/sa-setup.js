(function(para) {
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
      sdk_url: 'http://static.sensorsdata.cn/sdk/sensorsdata.1.3.2.js',
      name: 'sa',
      server_url:'http://xx.com/sa.gif?token=xxx'
    });