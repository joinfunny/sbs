require([
    'AppPage'
], function (AppPage) {
    var _page = {
        route: {
            doLogin: __api_path + '/services/user/login',
            createAppId: __api_path + '/services/app/create',
            getCaptcha: '/captcha',
            index: __path + '/index'
        },
        _recordCount: 0,
        _errorCount: 3,
        _msgUserName: ['用户名不能为空。', '用户名由字母，数字，特殊字符组成！'],
        _msgPwd: ['密码不可为空。'],
        _msgCode: ['验证码不能为空。', '请输入四位数字的验证码！', '请输入正确的验证码！'],
        init: function () {
            var that = this;
            that.initElements();
            that.initEvents();
            that.goRegUser();
        },
        initElements: function () {
            this.$captcha = $('.captcha');
            this.$btnSubmit = $('#j_btn_login');
            this.$form_userName = $('input[name="username"]');
            this.$form_pwd = $('input[name="password"]');
            this.$form_captcha = $('input[name="code"]');
            this.$form_tip = $('.form-tip>ul');
            this.$goReg = $('.go-reg-bt');
            this.$loginWarp = $('.login-warp');
            this.$loginInner = $('.login-inner');
            this.$regInner = $('.reg-inner');
            this.$closeReg = $('.close-new');
            this.$backLogin = $('.back-login>a');
            this.$loginWarp.addClass('rotate');
        },
        initEvents: function () {
            var that = this;
            that.$btnSubmit.on('click', function () {
                that.submit($(this));
            });
            that.$goReg.on('click', function () {
                that.clearAllTip();
                that.$loginWarp.removeClass('login-w').addClass('reg-w');
                that.$loginInner.animate({'opacity': 0}, 300, function () {
                    that.$loginInner.hide();
                    that.$regInner.show().animate({'opacity': 1}, 300);
                });
            });
            $([that.$backLogin, that.$closeReg]).each(function() {
                $(this).on('click', function() {
                    that.clearAllTip();
                    that.$loginWarp.removeClass('reg-w').addClass('login-w');
                    that.$regInner.animate({
                        'opacity': 0
                    }, 300, function() {
                        that.$regInner.hide();
                        that.$loginInner.show().animate({
                            'opacity': 1
                        }, 300);
                    });
                });
            });
            $(document).on('blur focus', 'input[name]', function (e) {
                var target = $(e.target);
                var dataName = target.name;
                that.clearTip(e);
                switch (dataName) {
                    case 'username':
                        that.validateUserName(target);
                        break;
                    case 'password':
                        that.validatePwd(target);
                        break;
                    case 'code':
                        that.validateCode(target);
                        break;
                }
            }).on('keydown', function (event) {
                var e = event || window.event;
                if (e.keyCode == 13) {
                    that.$btnSubmit.trigger('click');
                }
            });
        },
        goRegUser: function () {
            if (window.location.href.indexOf('registUser') != -1) {
                this.$goReg.trigger('click');
            }
        },
        clearAllTip: function () {
            $('.global-tips').hide();
            $('.error-tips').hide();
            $('input[name]').removeClass('input-error');
        },
        showCaptcha: function () {
            var that = this;
            that.refreshCode();
            that.$captcha.on('click', function () {
                that.refreshCode();
            }).parent().show();
        },
        refreshCode: function () {
            this.$captcha.attr('src', this.route.getCaptcha + '?' + new Date().getTime());
        },
        showTip: function (target, msg) {
            var that = this;
            msg = typeof target == 'string' ? target : msg;
            target = typeof target == 'object' ? target : null;

            if (msg) {
                target ? target.siblings('.error-tips').show().find('i').html(msg) : $('.global-tips').html(msg).show();
                target && target.addClass('input-error');
            } else {
                target && target.removeClass('input-error');
            }
        },
        getTerminalType: function () {
            var system = {
                win: false,
                mac: false,
                xll: false
            };
            //检测平台
            var p = navigator.platform;
            system.win = p.indexOf("Win") == 0;
            system.mac = p.indexOf("Mac") == 0;
            system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
            if (!system.win && !system.mac && !system.xll) {
                return 'MOBILE';
            } else {
                return 'PC';
            }
        },
        clearTip: function (e) {
            var target = e.target, type = e.type, that = this;
            if (type === 'focusin') {
                $(target).removeClass('input-error');
                $(target).siblings('.error-tips').hide();
                $('.global-tips').hide();
            } else if (type == 'focusout') {
                if ($.trim($(target).val()) == '') {
                    that.showTip($(target), '此项不能为空');
                }
            }
        },
        regUserName: function (value) {
            return /^(\d+|[a-zA-Z]+|[~!@#$%^&*?]+)$/.test(value);
        },
        regPwd: function (value) {
            return /(?!^(\d+|[a-zA-Z]+|[~!@#$%^&*?]+)$){6,}^[\w~!@#$%\^&*?]{6,}$/.test(value);
        },
        regCode: function (value) {
            return /^[0-9]{4}$/.test(value);
        },
        validateUserName: function ($dom) {
            var that = this,
                flag = true;
            var userName = $.trim($dom.val());
            if (userName == '') {
                that.showTip($dom, that._msgUserName[0]);
                flag = false;
            }
            /* else if (!that.regUserName(userName)) {
             that.showTip($dom, that._msgUserName[1]);
             flag = false;
             }*/
            return flag;
        },
        validatePwd: function ($dom) {
            var that = this,
                pwd = $.trim($dom.val());
            if (pwd == '') {
                that.showTip($dom, that._msgPwd[0]);
                return false;
            }
            return true;
        },
        validateCode: function ($dom) {
            var that = this,
                captcha = $.trim($dom.val());
            if (captcha == '') {
                that.showTip($dom, that._msgCode[0]);
                return false;
            } else if (!that.regCode(captcha)) {
                that.showTip($dom, that._msgCode[1]);
                return false;
            }
            return true;
        },
        validateForm: function () {
            var that = this,
                formData = {},
                validated = true;
            //that.clearTip();
            formData.userName = $.trim(that.$form_userName.val());
            formData.password = $.trim(that.$form_pwd.val());

            if (that._recordCount >= that._errorCount) {
                formData.captcha = $.trim(that.$form_captcha.val());
            }
            validated = that.validateUserName(that.$form_userName) && validated;
            validated = that.validatePwd(that.$form_pwd) && validated;
            /*if (that._recordCount >= that._errorCount) {
             validated = that.validateCode(that.$form_captcha) && validated;
             }*/

            if (validated) {
                return formData;
            }

            return null;
        },
        submit: function (dom) {
            var that = this;
            //禁用状态禁止提交
            if (that.$btnSubmit.hasClass('disabled')) {
                return;
            }
            //获取提交数据
            var formData = that.validateForm();
            if (!formData) return;
            AppPage.loadApi({
                url: that.route.doLogin,
                type: 'post',
                dataType: 'json',
                data: formData,
                ignoreSession: true,
                beforeSend: function (xhr) {
                    that.$btnSubmit.addClass('disabled');
                },
                success: function (res) {
                    if (res.success) {
                        var data = res.dataObject;
                        // 保存本地存储用户名
                        localStorage.setItem('bas_userName', data.userName);
                        localStorage.setItem('bas_userId', data.userId);
                        localStorage.setItem('bas_userId_personal',data.userId);
                        rxStream.__events.signIn.track({id:data.userId,name:data.userName});
                        if (data.appmetaList.length > 0) {
                            var appList = data.appmetaList;
                            localStorage.setItem('bas_appId', appList[0].id);
                            localStorage.setItem('bas_appId_personal', appList[0].id);
                            if(data.appmetaList[0].sdkInfoList.length > 0){
                              localStorage.setItem('bas_appStatus', appList[0].sdkInfoList[0].status);
                            }
                            localStorage.setItem('bas_appObject', data.appmetaList);

                            window.location = that.route.index;
                        } else {
                            that.createApp();
                            localStorage.removeItem("bas_appStatus");
                            localStorage.removeItem("bas_appObject");
                        }
                    } else {
                        that.showTip(res.msg);
                        that._recordCount+=1;
                    }
                },
                error: function (xhr, status) {
                    that.showTip('请求失败！');
                },
                complete: function (xhr, status) {
                    if (that._recordCount == that._errorCount) {
                        that.showCaptcha();
                    } else if (that._recordCount > that._errorCount) {
                        that.refreshCode();
                    }
                    that.$btnSubmit.removeClass('disabled');
                }
            });
        },
        createApp:function(){
          var that=this;
          AppPage.loadApi({
                url: that.route.createAppId,
                type: 'post',
                dataType: 'json',
                data: {sdkType:'web'},
                ignoreSession: true,
                async:false,
                success: function (res) {
                    if (res.success) {
                        var appId = res.dataObject;
                        localStorage.setItem('bas_appId', appId);
                        window.location = that.route.index;
                    } else {
                        that.showTip(res.msg);
                    }
                },
                error: function (xhr, status) {
                    that.showTip('App创建失败！');
                }
            });
        },
        // 测试环境用户自动登录
        debugAutoLogin: function () {
            $('input[name=username]').val('瑞雪:test');
            $('input[name=password]').val('abc.1234');
            this.$btnSubmit.trigger('click');
        }
    }
    _page.init();

})