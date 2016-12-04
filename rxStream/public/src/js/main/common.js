// 
define([
        'AppPage',
        'bootstrap'
    ],
    function(AppPage, bs) {

        // 框架子页面公用配置

        // 根据子窗口页面地址激活相应的父窗口树形菜单项
        window.parent.postMessage(window.location.href, '*');
        // 折叠父窗口边栏
        //window.parent.postMessage('collapseLeft', '*');
        // 展开父窗口边栏
        //window.parent.postMessage('expandLeft', '*');
        // 子窗口页面打开
        window.parent.postMessage('mainFrameReady', '*');
        // 子窗口页面离开（跳转）
        window.onunload = function(e) {
            window.parent.postMessage('mainFrameUnload', '*');
        }

        // 公用配置

        Object.ns('AppPage', {

            // 显示/隐藏行为分析列表面板
            toggleAnalysisListPanel: function(e) {
                e.stopDelegate();
                _.merge($('.analysis-list-panel'), this).toggleClass('show-analysis');
            },

            // 隐藏行为分析列表面板
            hideAnalysisListPanel: function(e) {
                var button = e.delegateTarget;
                var form = button.form;
                console.log(form)
                var $checkedbox = $('[name=checkbox_analysis]:checked', form);
                var checkedLength = $checkedbox.length;
                console.log($checkedbox.length);
                jQuery('.dashboard-widget-wrapper').hide();
                if (checkedLength > 0) {
                    for (var i = 1; i <= checkedLength; i++) {
                        jQuery('#dashboardWidgetWrapper_' + i).show().animate({
                            'opacity': 1
                        });
                    }
                    jQuery('.dashboard-blank-slate').hide();
                } else {
                    jQuery('.dashboard-blank-slate').show();
                }
                $('.icon-save').removeClass('grey');
                e.stopDelegate();
                $('.analysis-list-panel, [data-e-click="AppPage.toggleAnalysisListPanel"]').removeClass('show-analysis');
            },

            //写cookies
            setCookie: function(name, value) {
                var Days = 30;
                var exp = new Date();
                exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
                document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
            },

            //读取cookies
            getCookie: function(name) {
                var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
                if (arr = document.cookie.match(reg))
                    return unescape(arr[2]);
                else
                    return null;
            },

            // 请求响应提示
            responsePrompt: function(msg, isSuccess, callback, scope) {
                var boxClass = 'prompt-box prompt-box-' + (isSuccess ? 'success' : 'failure'),
                    iconClass = 'glyphicon glyphicon-' + (isSuccess ? 'ok' : 'remove');

                $('<div class="' + boxClass + '"><i class="' + iconClass + '"></i>' + msg + '</div>')
                    .appendTo(document.body)
                    .on('animationend', function(e) {
                        callback && callback.call(scope, msg, isSuccess);
                        $(e.currentTarget).remove();
                    });
            }

        });

        return AppPage;

    });