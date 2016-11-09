var $ = require('zepto');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('./helper/base.js');
var Cookie = require('./helper/cookie.js');
var Cache = require('./helper/cache.js');

var React = require('react');
var ReactDom = require('react-dom');
var User = require('./models/user.js');
var WXSetup = require('./helper/wx.js');

User.singleton();

require('./helper/ajax.js');

app.TweenLite = require('./vendors/TweenLite.js');

app.Models = {
    Course: require('./models/course.js'),
    CourseSearch: require('./models/course_search.js'),
    School: require('./models/school.js'),
    SchoolSearch: require('./models/school_search.js'),
    User: require('./models/user.js'),
    System: require('./models/system.js'),
    NewsListHot: require('./models/news_list_hot.js'),
    FilterCircle: require('./models/filter_circle.js'),
    FilterCate: require('./models/filter_cate.js'),
    City: require('./models/city.js'),
    Search: require('./models/search.js') 
};
// 自动加载页面
app.autoload = function(filePath, hash) {
    var def = $.Deferred();
    var done = function() {
        if(kz_m.currentController) {
            if(kz_m.currentController != filePath) {
                kz_m.currentControllerInstance.destory();
                kz_m.currentController = filePath;
                kz_m.currentControllerInstance = new kz_m.Controllers[filePath]();
            }
        } else {
            kz_m.currentController = filePath;
            kz_m.currentControllerInstance = new kz_m.Controllers[filePath]();
        }
        def.resolve(kz_m.currentControllerInstance);
    }

    if(kz_m.Controllers[filePath]) {
        done();
    } else {
        var src = kz_m.base + '/js/pages/' + filePath + (hash ? '_'+hash : '') + '.js';
        app.getScript(src).then(done);
    }

    return def.promise();
};

app.getScript = function(src) {
    var def = $.Deferred();
    var script = document.createElement('script');
    var timeout = 10*1000;
    var isTimeout = false;
    var timer = setTimeout(function() {
        isTimeout = true;
        def.reject();
    }, timeout);
    script.src = src;
    script.charset = 'utf-8';
    $(script).on('load', function() {
        clearTimeout(timer);
        if(!isTimeout) {
            def.resolve();
        }
    });

    $(document.head).append(script);

    return def.promise();
};

app.fetchPageData = function(fakeData) {
    var def = $.Deferred();
    var url = Backbone.history.root + Backbone.history.fragment;
    // 取消上一次页面请求
    if(app.fetchPageData.xhr) {
        if(app.fetchPageData.xhr.abort) {
            try {
                app.fetchPageData.xhr.abort();
            } catch(e) {
            }
        }
        app.fetchPageData.xhr = null;
    }

    if($('#state').size()) {
        var state = JSON.parse($('#state').text());
        $('#state').remove();
        // 记录第一次获取的数据
        Cache.singletonAjax().set(url, state);

        def.resolve(state);
    } else {
        if(fakeData) {
            def.resolve({});
        } else {
            var xhr = app.fetchPageData.xhr = Backbone.ajax({
                url: url,
                data: {
                    json: 1
                },
                local_cache: true,
                dataType: 'json',
                cache: false
            });

            xhr.then(function(data) {
                def.resolve(data);
            }).fail(function(xhr, info, showError) {
                def.reject(info);
            });
        }
    }

    return def.promise();
};

app.loadStylesheet = function(style) {
    var id = '#' + style.replace('.', '_');
    if(!$(id).size()) {
        var stylesheet = $('<link>');

        stylesheet.attr('rel', 'stylesheet');
        stylesheet.attr('type', 'text/css');
        stylesheet.attr('href', kz_m.base + '/css/'+style);
        stylesheet.attr('id', style.replace('.', '_'));

        $(document.head).append(stylesheet);
    }
};

app.navigate = function(url, option) {
    var domain = location.protocol + '//' + location.hostname;
    if(url.indexOf(domain) != -1) {
        url = url.replace(domain, '');
    }
    option || (option = {});
    Backbone.history.navigate(url, _.extend(option, {trigger: true}));
};

app.getWX = function() {
    if((/MicroMessenger/i).test(navigator.userAgent)) {
        return WXSetup(kz_m.jsTicket);
    } else {
        var def = $.Deferred();

        def.reject();

        return def.promise();
    }
};

app.tips = app.error = app.success = function(msg) {
    var def = $.Deferred();
    var tipmsg = '<div class="tipmsg" style="position:fixed;border-radius:5px;text-align:center;top:50%;left:50%;width:4.6875rem;background:#1D1A1A;opacity:0.7;color:#fff;margin-left:-2.34375rem;padding: 0.5rem 0;">' + msg + '</div>';
    $("body").append(tipmsg);
    setTimeout(function() {
        $(".tipmsg").remove();
    }, 2000)
    def.resolve();
    return def.promise();
};

app.loading = function(show) {
    var dom = $('#page_loading');

    if(show) {
        dom.show();
    } else {
        dom.hide();
    }
};

app.titleToggle = function(seoInfo) {
    seoInfo || (seoInfo = {});
    if(seoInfo.title) {
        document.title = seoInfo.title;
    } else {
        document.title = "课栈网_我们成就你的梦";
    }
    if(/iPhone|iPad|iPod/i.test(navigator.userAgent)) { // 针对ios的webview做特殊处理
        var $iframe = $('<iframe src="/favicon.ico"></iframe>').on('load', function() {
          setTimeout(function() {
            $iframe.off('load').remove();
          }, 0)
        }).appendTo($(document.body));
    }
};

app.checkLogin = function(replace) {
    if(!User.singleton().isLogin()) {
        app.navigate('/login?jumpurl='+encodeURIComponent(location.href), {replace: replace ? true : false});
        return false;
    }
    return true;
};
// 检测地区
app.checkArea = function() {
    var system = app.Models.System.singleton();
    var areaid = Cookie.get('areaid');
    if(location.href.indexOf('gps=0') != -1) {
        try {
            history.replaceState({}, document.title, location.pathname);
        } catch(e) {}
        return;
    }

    this.checkArea = function() {};
    // 有areaid表示用户手动选择了城市，不再判断城市
    system.getArea().then(function(data) {
        if(data) {
            var ipid = data.id || 110100;
        } else {
            var ipid = 110100;
        }

        if(data.gps == -1) {
            if(!areaid) { // 之前没有设置过城市
                // gps定位失败
                app.tips('定位当前城市失败');
                // 设置默认北京
                system.setAreaid(ipid);
                setTimeout(function() {
                    kzApp.navigate('/city');
                });
            }
        } else {
            // 定位有取到位置
            if(data) { // 在服务城市内
                var address = data;
                if(!areaid && address.id == ipid) { // 没有设置过，且定位ip和默认ip相同，就按当前定位的为准
                    system.setAreaid(address.areaid);
                } else if(areaid != address.id) { // 没有设定城市，或者设置城市不同
                    if(confirm('当前城市为:'+address.name+'，是否切换到'+address.name+'？')) {
                        // 设置新城市id，并刷新页面
                        location.href = '/'+address.code + '?gps=0';
                    } else if(!areaid) { // 设置ip的城市为默认城市，不刷新页面
                        system.setAreaid(ipid);
                    }
                } else {
                    // 定位城市和设置城市相同不处理
                }
            } else { // 不在服务城市内
                if(!areaid) {
                    alert('当前城市暂未开通服务，请选择其他城市浏览');
                    kzApp.navigate('/city');
                    system.setAreaid(ipid);
                } else {
                    if(confirm('当前城市暂未开通服务，请选择其他城市浏览')) {
                        kzApp.navigate('/city');
                    }
                }
            }
        }
    });
};
var Router = Backbone.Router.extend({
    controllers: {},
    firstScreen: undefined,

    initialize: function() {
        var router = this;

        _.each(kz_m.route, function(config, route) {
            router.route(route, router.generate(config, route));
        });
    },
    generate: function(config) {
        var router = this;
        return function() {
            if(config.l) { // 判断登录态
                if(!app.checkLogin(true)) {
                    return;
                }
            }
            var pageController = app.autoload(config.c, config.h);
            var pageData = app.fetchPageData(config.d === false);
            if(config.s) {
                app.loadStylesheet(config.s);
            }

            app.loading(true);
            $.when(pageController, pageData).then(function(controller, data) {
                controller.fetchData = data;
                controller.viewBeActive();
                var component = controller.render(data, $('#controller').get(0));
                if(component) {
                    controller.component = component;
                }
                if(controller.isScrollTo){
                    setTimeout(function() {
                        window.scrollTo(0, 0);
                    });
                }
                if(router.firstScreen === undefined) {
                    router.firstScreen = true;
                } else {
                    router.firstScreen = false;
                    app.titleToggle(controller.getSEO());
                    _hmt.push(['_trackPageview', location.pathname]);
                }
                router.wxShare(controller);
            }).always(function() {
                app.loading(false);
            });
        }
    },
    wxShare: function(controller) {
        if(controller.wxShareInfo) {
            var shareInfo = controller.wxShareInfo();
        } else {
            var shareInfo = {
                title: '课栈网，我们成就你的梦',
                link: 'http://'+location.hostname,
                desc: '专注教育培训领域综合服务平台，一站式培训解决方案。',
                imgUrl: 'http://res1.kezhanwang.cn/static/mh5/images/share_logo_d1ae03.jpg'
            };
        }

        app.getWX().then(function(wx) {
            wx.share(shareInfo);
        });
    }
});

if(navigator.userAgent.match(/iphone|android/i)) {
$(document.body).delegate('.ps', 'tap click', function(e) {
    var target = $(e.currentTarget);
    var href = target.attr('href');

    if(e.type == 'tap') {
        app.router.navigate(href, {trigger: true});
    }
    return false;
});
} else {
$(document.body).delegate('.ps', 'click', function(e) {
    var target = $(e.currentTarget);
    var href = target.attr('href');

    app.router.navigate(href, {trigger: true});
    return false;
}); 
}


app.router = new Router();

window.scrollTo(0, 0);
setTimeout(function() {
    window.scrollTo(0, 0);
    Backbone.history.start({
        pushState: true
    });
});

var FastClick = require('./vendors/fastclick.js');
$(function() {
    FastClick.attach(document.body);
});

module.exports = window.kzApp = app;