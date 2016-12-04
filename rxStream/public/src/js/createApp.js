/**
 * Created by fisher810 on 2016-7-11.
 */
define([
    'dot',
    'plugins/ZeroClipboard/ZeroClipboard'
], function(dot, clip) {

    function CreateAppStep() {}

    // 原型
    CreateAppStep.prototype = _.create(EventEmitter.prototype, {
        'constructor': CreateAppStep
    });
    $.extend(CreateAppStep.prototype, {
        $mark: $('.create-app-mark'),
        $dialog: $('.dialog-mark'),
        $dialogInner: $('.create-app-dialog'),
        slideButton: [{
            'active': 'active',
            'text': '隐藏',
            'current': '电商DEMO数据'
        }, {
            'active': '',
            'text': '显示',
            'current': '个人数据'
        }],
        init: function() {
            this.bindHandleEvent();
            this.initClipboard();
            this.initSlideButton();
            $(document).on('click', this.handleEvent);
            return this;
        },
        initMark: function() {
            this.$mark.addClass('show-mark');
            //this.$dialogInner.css('top', ($(window).height() - this.$dialogInner.innerHeight()) / 2);
        },
        initClipboard: function() {
            var client = new clip(document.getElementById("copyScript"));

            client.on("ready", function(readyEvent) {
                // alert( "ZeroClipboard SWF is ready!" );

                client.on("aftercopy", function(event) {
                    // `this` === `client`
                    // `event.target` === the element that was clicked
                    //alert("Copied text to clipboard: " + event.data["text/plain"] );
                    alert('已复制到剪贴板！')
                });
            });
        },
        click: function(e) {
            var role = e.target.getAttribute('role');
            switch (role) {
                case 'closeMark':
                    this.closeMark(e);
                    break;
                case 'connectOwnWeb':
                    this.connectOwnWeb(e);
                    break;
                case 'appList':
                    this.selectAppType(e);
                    break;
                case 'cancelOperate':
                    this.cancelOperate(e);
                    break;
                case 'goStep2':
                    this.goStep2(e);
                    break;
                case 'copyScript':
                    this.copyScript(e);
                    break;
                case 'checkSdk':
                    this.checkSdk(e);
                    break;
                case 'complete':
                    this.complete(e);
                    break;
                case 'topConnectWeb':
                    this.topConnectWeb(e);
                    break;
                case 'connectDemo':
                    this.connectDemo(e);
                    break;
                case 'connectData':
                    this.connectData(e);
                    break;
                case 'slideData':
                    this.slideData(e);
                    break;
                case 'selectInputVal':
                    this.selectInputVal(e);
                    break;
                default:
            }
        },
        selectInputVal: function(e) {
            var $target = $(e.target);
            $target.select();
        },
        //转换数据模板
        initSlideButton: function() {
            var data = localStorage['bas_userId'] == 1 ? this.slideButton[0] : this.slideButton[1];
            var interText = dot.template($("#slide-button-temp").text());
            $('.header-left').html(interText(data));
        },
        //切换数据
        slideData: function(e) {
            var target = e.target;
            var $target = $(target).hasClass('slideChild') ? $(target).parent() : $(target);
            if ($target.hasClass('active')) { //切到个人数据
                localStorage.setItem('bas_userId', localStorage['bas_userId_personal']);
                localStorage.setItem('bas_appId', localStorage['bas_appId_personal']);
                localStorage.setItem('bas-sessionId', localStorage['bas-sessionId_personal']);
                $target.removeClass('active');
                $('.slide-tips i').html('显示');
                $('.slide-current i').html('个人数据');
            } else {
                //电商DEMO数据
                localStorage.setItem('bas_userId',1);
                localStorage.setItem('bas_appId',1);
                localStorage.setItem('bas-sessionId',1);
                $target.addClass('active');
                $('.slide-tips i').html('隐藏');
                $('.slide-current i').html('电商DEMO数据');
            }
            window.location.reload(true);
        },
        //关闭遮罩
        closeMark: function(e) {
            this.$mark.removeClass('show-mark');
        },
        connectData: function() {
            this.$dialogInner.attr('class', 'create-app-dialog step-1');
            this.$dialog.show();
        },
        //打开步骤dialog
        connectOwnWeb: function(e) {
            this.$mark.removeClass('show-mark');
            this.$dialog.show();
        },
        //选择app类型
        selectAppType: function(e) {
            var $target = $(e.target),
                type = $target.attr('data-type');
            if (type == 'android') {
                return;
            }
            $target.addClass('active').siblings().removeClass('active');
        },
        //获取选中的app类型
        getSelectAppType: function() {
            return $('.app-type-list li.active').attr('data-type');
        },
        //取消操作
        cancelOperate: function() {
            this.timer && clearInterval(this.timer);
            this.$dialog.hide();
        },
        //复制代码
        copyScript: function() {

        },
        checkSdk: function() {
            this.travel = 1;
            this.$dialogInner.attr('class', 'create-app-dialog step-3');
            $('.complete').hide();
            $('.test-success').hide();
            $('.test-failed').hide();
            this.intervalTime();
        },
        checkSdkAjax: function() {
            var that = this,
                data = {},
                appId = localStorage['bas_appId'],
                url = __api_path + '/services/app/checksdk/' + appId;
            var ajaxDefer = that.createAjaxDefer(data, url,'get');
            ajaxDefer.then(function(res) {
                    if (res.success) {
                        if (res.dataObject && res.dataObject.length > 0) {
                            $('.test-success').show();
                            $('.test-failed').hide();
                            that.initWebList(res.dataObject);
                            localStorage.setItem('bas_appStatus', 1);
                            $('.complete').show();
                        } else {
                            that.travel++;
                            if (that.travel > 5) {
                                $('.test-success').hide();
                                $('.test-failed').show();
                            } else {
                                that.intervalTime();
                            }
                        }
                    }
                },
                function(err) {
                    $('.test-success').hide();
                    $('.test-failed').show();
                });
        },
        //倒计时定时器
        intervalTime: function() {
            var that = this,
                time = 10,
                $interval = $('.interval-time'),
                $progress = $('.progress ins', $interval),
                $travel = $('.travel', $interval),
                $time = $('.time', $interval);
            that.timer = null;
            $travel.html(this.travel);
            $time.html(time);
            $interval.show();
            $progress.css('width', 0);
            that.timer = setInterval(function() {
                time--;
                if (time == 0) {
                    that.checkSdkAjax();
                    clearInterval(that.timer);
                    $interval.hide();
                } else {
                    $time.html(time);
                    if (time == 1) {
                        $progress.css('width', '100%');
                    } else {
                        $progress.css('width', 10 * (10 - time) + '%');
                    }
                }
            }, 1000);
        },
        //完成操作
        complete: function() {
            var that = this,
                data = { data: JSON.stringify(that.getWebList()) },
                appId = localStorage['bas_appId'],
                url = __api_path + '/services/app/metaupdate/' + appId;
            var ajaxDefer = this.createAjaxDefer(data, url);
            ajaxDefer.then(function(res) {
                    if (res.success) {
                        that.$dialog.hide();
                        document.getElementById("mainFrame").src = 'main/user-analysis/Event/analysis?new';
                    }
                },
                function(err) {});
        },
        //获取别名
        getWebList: function() {
            var data = [];
            $('.app-list .list-c').each(function() {
                var obj = {};
                obj.id = $(this).data('id');
                obj.label = $(this).find('input').val();
                obj.domain = $(this).find('.web-name').html();
                data.push(obj);
            });
            return data;
        },
        initWebList: function(data) {
            var interText = dot.template($("#web-list-temp").text());
            $('.app-list').html(interText(data));
        },
        //顶部接入数据
        topConnectWeb: function() {
            var appId = localStorage['bas_appId'],
                status = localStorage['bas_appStatus'];
            if (!appId || status != 1) {
                this.$dialog.show();
            }
        },
        //接入电商demo数据
        connectDemo: function() {
            var $but = $('.slide-button');
            this.$mark.removeClass('show-mark');
            if (!$but.hasClass('active')) {
                $but.trigger('click');
            }
        },
        //第二步
        goStep2: function(e) {
            this.timer && clearInterval(this.timer);
            var $target = $(e.target),
                that = this,
                appId = localStorage['bas_appId'];
            if (!$target.hasClass('disabled') && !appId) {
                $('.next', this.$dialogInner).addClass('disabled');
                var data = {
                        sdkType: that.getSelectAppType()
                    },
                    userId = localStorage['bas_userId'],
                    url = __api_path + '/services/app/create';
                var ajaxDefer = this.createAjaxDefer(data, url);
                ajaxDefer.then(function(res) {
                        $('.next', that.$dialogInner).removeClass('disabled');
                        if (res.success) {
                            that.$dialogInner.attr('class', 'create-app-dialog step-2');
                            localStorage.setItem('bas_appId', res.dataObject);
                            localStorage.setItem('bas_appId_personal', res.dataObject);
                            that.initCodeTemplate(res.dataObject);
                        }
                    },
                    function(err) {
                        $('.next', that.$dialogInner).removeClass('disabled');
                    });
            }
            if (appId) {
                that.$dialogInner.attr('class', 'create-app-dialog step-2');
                that.initCodeTemplate(appId);
            }
        },
        //渲染sdk code 模板
        initCodeTemplate: function(data) {
            var interText = sdkObj.sdkScript.replace('{{appId}}', data);
            $('.code-inner', this.$dialogInner).val('<script>' + interText + '</script>');
        },
        // 事件函数统一路由
        handleEvent: function(e) {
            switch (e.type) {
                case 'click':
                    this.click(e);
                    break;
                default:
            }
        },
        // @requestData 请求数据（见API）
        // return defer
        createAjaxDefer: function(requestData, url,method) {
            var that = this;
            //var dataStr = JSON.stringify(requestData);
            //console.log(JSON.stringify(data, null, 4))
            return AppPage.loadApi({
                url: url,
                data: method === 'get' ? '':requestData,
                method:method||'post',
                crossDomain: true,
                beforeSend: function() {
                    // 遮罩
                    that.loadingMask(true);
                },
                complete: function() {
                    // 去除遮罩
                    that.loadingMask(false);
                }
            })
        },
        loadingMask: function(b) {
            var $loading = $('.step-loading', this.$dialogInner);
            b ? $loading.show() : $loading.hide();
        }
    });

    // 静态成员
    $.extend(CreateAppStep, {
        create: function() {
            return new CreateAppStep().init();
        }
    });

    return CreateAppStep;
});