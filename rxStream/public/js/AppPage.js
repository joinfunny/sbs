define([], function() {
  var r20 = /%20/g;
  var rJsonStr = /^\{.*\}$|^\[.*\]$/g;
  // 命名空间
  Object.ns = Object.namespace = function namespace(NS, name, ns) {

    NS || (NS = window);

    // 若为字符串，则定义为命名空间：a.b.c.d...
    if (typeof NS === 'string') {
      ns = name;
      name = NS;
      NS = window;
    }

    if (!name) {
      return;
    } else if (typeof name !== 'string') {
      return _.merge(NS, name)
    }

    var names = name.split('.'),
      i = -1,
      l = names.length - 1;

    // 若未定义，则返回获取的命名空间对象
    if (ns === undefined) {
      while (++i < l) {
        if (!(NS = NS[names[i]])) {
          return;
        }
      }
      return NS[names[l]];
    } else {
      while (++i < l) {
        NS = NS[names[i]] || (NS[names[i]] = {});
      }
      if (NS[names[l]]) {
        return _.merge(NS[names[l]], ns);
      } else {
        return NS[names[l]] = ns;
      }
    }
  }
  _.returnTrue = function returnTrue() {
    return true;
  }
  _.returnFalse = function returnFalse() {
      return false;
    }
    // 新增一个事件委托以及是否终止委托属性
  _.extend($.Event.prototype, {
    stopDelegate: function() {
      this.isDelegateStopped = _.returnTrue;
    },
    isDelegateStopped: _.returnFalse,
  });

  $.extend({

    /**
     * 创建一个预置参数和事件预处理的ajax方法
     * 基于 jQuery.ajax 封装
     * @param  {object} preOptions 预置的参数选项
     * @param  {object} preHandleEvents 预设的事件处理函数hash集
     * @param  {function} presetOptions 预设的参数处理函数
     * @return {object} 返回jquery的类Promise对象
     */
    presetAjax: function(preOptions, preHandleEvents, presetOptions) {

      preOptions = $.extend(true, {}, preOptions);
      preHandleEvents = $.extend({}, preHandleEvents);

      return function ajax(options) {

        var newOptions = $.extend({}, preOptions, options),
          $ajax,
          $ajaxThen,
          results = {};

        presetOptions && presetOptions(newOptions);

        ['success', 'beforeSend', 'error', 'complete'].forEach(function(name) {
          newOptions[name] = this(name, preHandleEvents[name], options[name]);
        }, function(name, preHandleEvent, handleEvent) {
          return function() {
            if (preHandleEvent) {
              results[name] = preHandleEvent.apply(this, arguments);
            }
            if (handleEvent && results[name] !== false) {
              return handleEvent.apply(this, arguments);
            }
          }
        });

        $ajax = $.ajax(newOptions);
        $ajaxThen = $ajax.then(function(res) {
          // 只覆盖属性
          extendBind($ajaxThen, $ajax, true);
          // jquery对原生Promise返回对象不可直接使用
          //return results.success !== false ? res : Promise.reject(res);
          return results.success !== false ? res : $.Deferred().reject(res);
        });

        return extendBind($ajaxThen, $ajax, false);

        // 将原 jQuery ajax 对象的绑定方法和属性，附加到then出的目标对象上
        // 被附加的绑定方法执行时，scope依然为原对象
        function extendBind(target, source, nofn) {
          $.each(source, function(k, v) {
            if (nofn || !(k in target)) {
              if (typeof v !== 'function') {
                target[k] = v;
              } else if (!nofn) {
                target[k] = function(v) {
                  return function() {
                    v.apply(source, arguments);
                  }
                }(v);
              }
            }
          });
          return target;
        }
      }
    }

  });


  Object.ns('AppPage', {

    empty_fn: function() {},

    paramJsonStr: function(jsonStr) {
      return rJsonStr.test(jsonStr) ? encodeURIComponent(jsonStr).replace(r20, "+") : jsonStr;
    },

    paramJsonData: function(jsonData) {
      return encodeURIComponent(JSON.stringify(jsonData)).replace(r20, "+");
    },

    // 查询url的search字段
    queryString: function(query, url, undecode) {
      return AppPage._queryString(query, url, undecode);
    },

    // 查询url的hash字段
    queryHashString: function(query, url, undecode) {
      return AppPage._queryString(query, url, undecode, true);
    },

    // 查询url的search或hash字段
    _queryString: function(query, url, undecode, isHash) {
      var search, index;
      if (!url || typeof url !== 'string') {
        url = window.location[isHash ? 'hash' : 'search'];
      }
      index = url.indexOf(isHash ? '#' : '?');
      if (index < 0) {
        return null;
      }
      search = "&" + url.slice(index + 1);

      return search && new RegExp("&" + query + "=([^&#]*)").test(search) ?
        undecode ? RegExp.$1 : unescape(RegExp.$1) :
        null;
    },

    // 查询url的search字段集合
    queryStringAll: function(query, url, undecode) {
      return AppPage._queryStringAll(query, url, undecode);
    },

    // 查询url的hash字段集合
    queryHashStringAll: function(query, url, undecode) {
      return AppPage._queryStringAll(query, url, undecode, true);
    },

    _queryStringAll: function(query, url, undecode, isHash) {
      var arrStr = [],
        arrMatch, search, index, start;
      if (!url || typeof url !== 'string') {
        url = window.location[isHash ? 'hash' : 'search'];
      }
      index = url.indexOf(isHash ? '#' : '?');
      if (index < 0) {
        return null;
      }
      search = "&" + url.slice(index + 1);

      arrMatch = search.match(new RegExp("&" + query + "=[^&]*", "g"));
      if (arrMatch) {
        start = query.length + 2;
        arrMatch.forEach(function(value) {
          var v = undecode ? value : unescape(value.slice(start));
          arrStr = arrStr.concat(v.split(','));
        });
      }
      return arrStr;
    },

    // 通用DOM事件委托
    delegate: function(e) {

      var target = e.target,
        currentTarget = e.currentTarget,
        eTypeAttr = 'data-e-' + e.type,
        scope,
        NS = currentTarget === this ? window : scope = this,
        eNS;
      //console.log(NS);
      do {
        eNS = target.getAttribute(eTypeAttr);
        if (eNS && (eNS = Object.ns(NS, eNS))) {
          e.delegateTarget = target;
          eNS.call(scope || target, e);
        }
      }
      while (!e.isDelegateStopped() && (target = target.parentNode) && target !== currentTarget);
    },

    // 切换标签，并判断是否实际切换
    switchTab: function(tab, tabClass, activedClass) {
      var $tab = $(tab);
      if (!activedClass) {
        activedClass = tabClass;
        tabClass = '';
      }
      if (!$tab.hasClass(activedClass)) {
        $tab.siblings(tabClass).removeClass(activedClass);
        $tab.addClass(activedClass);
        return true;
      }
      return false;
    },

    // 创建一个基于 jQuery.ajax 请求方法，并统一做预置
    loadApi: $.presetAjax({
      // 预置的参数选项
      type: 'POST',
      dataType: 'json',
      crossDomain: true,
      ignoreSession: false,
      data: {}

      // 预设的事件处理函数hash集
    }, {
      beforeSend: function(jqXHR) {},
      success: function(responseData, textStatus, jqXHR) {
        var data = {};
        try {
          data = this.dataType == 'json' ? responseData : JSON.parse(responseData);
        } catch (ex) {
          data = {
            success: false,
            message: '数据请求格式错误，请检查！'
          };
        }

        if (!data.success) {
          if (data.messageCode == 'ERROR_UNLOGIN') {
            localStorage.removeItem('bas-sessionId');
            AppPage.messageTipsRedirectToLogin('当前用户未登录！');
          } else if (data.messageCode == '100001') {
            localStorage.removeItem('bas-sessionId');
            AppPage.messageTipsRedirectToLogin('当前用户登录状态已失效，请重新登录！');
          } else {
            AppPage.messageTips(data.msg || data.message);
          }
          return false;
        }
      },
      error: function(jqXHR, textStatus) {
        AppPage.messageTips('系统繁忙，请刷新页面重试！');
      },

      // 预设的参数处理函数
    }, function(options) {

      var appId = localStorage.getItem('bas_appId'),
        paramStr;
      if (appId) {
        paramStr = (options.url.indexOf('?') > -1 ? '&' : '?');
        paramStr += 'appId=' + appId;
        options.url += paramStr;
      }
    }),

    messageTipsRedirectToLogin: function(text) {
      AppPage.messageTips(text, function() {
        top.location.href = window.__path + '/login';
      }, 1000);
    },

    messageTips: function(text, callback, duration) {
      var f = $('#mainFrame'),
        frame = f.length > 0 ? f.contents().find('body') : $('body'),
        $tipsBox = $('.message-tips', frame);
      if ($tipsBox.length === 0) {
        $tipsBox = $('<div style="top: -80px" class="message-tips">' + text + '</div>');
        frame.append($tipsBox);
      }
      if ($tipsBox.data('tip')) {
        return;
      }
      $tipsBox.data('tip', true);
      $tipsBox.stop().animate({
        'top': 20
      });
      window.setTimeout(function() {
        $tipsBox.stop().animate({
          'top': -80
        }, function() {
          callback && callback();
          $tipsBox.data('tip', false);
        });
      }, duration || 3000);
    },

    // 本地保存分析类型菜单
    setAnalysisTypeMenu: function(menu) {
      localStorage.setItem('analysisTypeMenu', JSON.stringify(menu));
    },
    // 本地获取分析类型菜单
    getAnalysisTypeMenu: function() {
      var menu = localStorage.getItem('analysisTypeMenu');
      menu = JSON.parse(menu);
      return menu;
    },
    // 本地获取分析类型菜单
    getAnalysisTypeId: function(type) {
      var menu = localStorage.getItem('analysisTypeMenu'),
        id = '';
      menu = menu && JSON.parse(menu);
      menu && menu.some(function(menuItem) {
        if (menuItem.type === type) {
          id = menuItem.id;
          return true;
        }
      })
      return id;
    }

  });
  // 'mousedown mouseup click dblclick'
  $(document).on('click', AppPage.delegate);
  return AppPage;
});