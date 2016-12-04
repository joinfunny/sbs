(function (window) {
    var _page = {
        route: {
            doRegistUser: __api_path + '/services/user/signup',
            doLogin: __api_path + '/services/user/login',
            createAppId: __api_path + '/services/app/create',
            getCaptcha: '/captcha',
            login: '/login',
            index: __path + '/index'
        },
        _recordCount: 0,
        _errorCount: 3,
        _msgCompanyName: ['企业全称不可为空。'],
        _msgUserAppellation: ['称呼不可为空。'],
        _msgUserName: ['用户名不能为空。', '用户名仅限字母，数字，下划线，长度20个以内！'],
        _msgPwd: ['密码不可为空。'],
        _msgPwd1: ['重复密码不可为空。', '两次密码输入不一致！'],
        _msgTel: ['手机号不能为空。', '请输入正确的手机号码！'],
        _msgEmail: ['邮箱不能为空。', '请输入正确的邮箱号！'],
        _msgCode: ['验证码不能为空。', '请输入四位数字的验证码！', '请输入正确的验证码！'],
        init: function () {
            var that = this;
            that.initElements();
            that.initEvents();
        },
        initElements: function () {
            /*this.$captcha = $('.captcha');*/
            this.$btnSubmit = $('#j_btn_registUser');
            //this.$form_companyName = $('input[name="companyName"]');
            this.$form_userAppellation = $('input[name="userAppellation"]');
            this.$form_userName = $('input[name="regUserName"]');
            this.$form_pwd = $('input[name="regPwd"]');
            //this.$form_pwd1 = $('input[name="pwd1"]');
            this.$form_tel = $('input[name="tel"]');
            this.$form_email = $('input[name="email"]');
            /*this.$form_captcha = $('input[name="code"]');*/
            this.$form_tip = $('.error-tips');
            this.$form_userName.val('');
            this.$form_pwd.val('');
        },
        initEvents: function () {
            var that = this;
            that.$btnSubmit.on('click', function () {
                that.submit($(this));
            });
            $(document).on('blur focus', 'input[name]', function (e) {
                var target = $(e.target);
                var dataName = target.attr('name');
                that.clearTip(e);
                if (e.type == 'focusout') {
                    switch (dataName) {
                        case 'regUserName':
                            that.validateUserName(target);
                            break;
                        case 'regPwd':
                            that.validatePwd(target);
                            break;
                        case 'userAppellation':
                            that.validateUserAppellation(target);
                            break;
                        case 'pwd1':
                            that.validatePwd1(target);
                            break;
                        case 'tel':
                            that.validateTel(target);
                            break;
                        case 'email':
                            that.validateEmail(target);
                            break;
                        case 'code':
                            that.validateCode(target);
                            break;
                    }
                }
            }).on('keydown', function (event) {
                var e = event || window.event;
                if (e.keyCode == 13) {
                    that.$btnSubmit.trigger('click');
                }
            });

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
        regTel: function (value) {
            return /^0?1[3|4|5|7|8][0-9]\d{8}$/.test(value);
        },
        regEmail: function (value) {
            return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value);
        },
        userNameReg: function (value) {
            return /^[0-9a-zA-Z_]{1,20}$/.test(value);
        },
        regPwd: function (value) {
            return /(?!^(\d+|[a-zA-Z]+|[~!@#$%^&*?]+)$){6,}^[\w~!@#$%\^&*?]{6,}$/.test(value);
        },
        regCode: function (value) {
            return /^[0-9]{4}$/.test(value);
        },
        validateCompanyName: function ($dom) {
            var that = this,
                flag = true;
            var companyName = $.trim($dom.val());
            if (companyName == '') {
                that.showTip($dom, that._msgCompanyName[0]);
                flag = false;
            }
            return flag;
        },
        validateUserAppellation: function ($dom) {
            var that = this,
                flag = true;
            var userAppellation = $.trim($dom.val());
            if (userAppellation == '') {
                that.showTip($dom, that._msgUserAppellation[0]);
                flag = false;
            }
            flag ? $dom.addClass('right') : $dom.removeClass('right');
            return flag;
        },
        validateUserName: function ($dom) {
            var that = this,
                flag = true;
            var userName = $.trim($dom.val());
            if (userName == '') {
                that.showTip($dom, that._msgUserName[0]);
                flag = false;
            } else if (!that.userNameReg(userName)) {
                that.showTip($dom, that._msgUserName[1]);
                flag = false;
            }
            flag ? $dom.addClass('right') : $dom.removeClass('right');
            return flag;
        },
        validatePwd: function ($dom) {
            var that = this,
                pwd = $.trim($dom.val()),
                flag = true;
            if (pwd == '') {
                that.showTip($dom, that._msgPwd[0]);
                flag = false;
            }
            flag ? $dom.addClass('right') : $dom.removeClass('right');
            return flag;
        },
        validatePwd1: function ($dom) {
            var that = this,
                pwd1 = $.trim($dom.val());
            if (pwd1 == '') {
                that.showTip($dom, that._msgPwd1[0]);
                return false;
            } else {
                var pwd = $.trim(that.$form_pwd.val());
                if (pwd1 != pwd) {
                    that.showTip($dom, that._msgPwd1[1]);
                }
                return false;
            }
            return true;
        },
        validateTel: function ($dom) {
            var that = this,
                tel = $.trim($dom.val()),
                flag = true;
            if (tel == '') {
                that.showTip($dom, that._msgTel[0]);
                flag = false;
            } else if (!that.regTel(tel)) {
                that.showTip($dom, that._msgTel[1]);
                flag = false;
            }
            flag ? $dom.addClass('right') : $dom.removeClass('right');
            return flag;
        },
        validateEmail: function ($dom) {
            var that = this,
                email = $.trim($dom.val()),
                flag = true;
            if (email == '') {
                that.showTip($dom, that._msgEmail[0]);
                flag = false;
            } else if (!that.regEmail(email)) {
                that.showTip($dom, that._msgEmail[1]);
                flag = false;
            }
            flag ? $dom.addClass('right') : $dom.removeClass('right');
            return flag;
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
            //formData.companyName = $.trim(that.$form_companyName.val());
            formData.userName = $.trim(that.$form_userName.val());
            formData.password = $.trim(that.$form_pwd.val());
            formData.userAppellation = $.trim(that.$form_userAppellation.val());
            //formData.password1 = $.trim(that.$form_pwd1.val());
            formData.tel = $.trim(that.$form_tel.val());
            formData.email = $.trim(that.$form_email.val());
            /*if (that._recordCount >= that._errorCount) {
             formData.captcha = $.trim(that.$form_captcha.val());
             }*/
            if (formData.userName == '' || !that.userNameReg(formData.userName)) {
                validated = that.validateUserName(that.$form_userName) && validated;
            } else if (formData.password == '') {
                validated = that.validatePwd(that.$form_pwd) && validated;
            } else if (formData.userAppellation == '') {
                validated = that.validateUserAppellation(that.$form_userAppellation) && validated;
            } /*else if (formData.password1 == '' || formData.password != formData.password1) {
             validated = that.validatePwd1(that.$form_pwd1) && validated;
             }*/ else if (formData.tel == '' || !that.regTel(formData.tel)) {
                validated = that.validateTel(that.$form_tel) && validated;
            } else if (formData.email == '' || !that.regEmail(formData.email)) {
                validated = that.validateEmail(that.$form_email) && validated;
            }
            // validated = that.validateCompanyName(that.$form_companyName) && validated;
            // validated = that.validateUserName(that.$form_userName) && validated;
            // validated = that.validatePwd(that.$form_pwd) && validated;
            // validated = that.validateTel(that.$form_tel) && validated;
            // validated = that.validateEmail(that.$form_email) && validated;
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
            formData.terminalType = that.getTerminalType();
            $.ajax({
                url: that.route.doRegistUser,
                type: 'post',
                dataType: 'json',
                crossDomain: true,
                ignoreSession: false,
                data: formData,
                beforeSend: function (xhr) {
                    that.$btnSubmit.addClass('disabled');
                },
                success: function (data) {
                    if (data.success) {
                        that.showTip('恭喜您，注册已成功！');

                        if (data.userId) {
                            delete formData.password;
                            formData.userId = data.dataObject;
                            formData.telephone = formData.tel;
                        }

                        setTimeout(function () {
                            that.LoginSubmit({userName: formData.userName, password: formData.password});
                        }, 2000);

                    } else {
                        that.showTip(data.msg);
                        that._recordCount++;
                    }
                },
                error: function (xhr, status) {
                    that.showTip('请求失败！');
                },
                complete: function (xhr, status) {
                    /*if (that._recordCount == that._errorCount) {
                     that.showCaptcha();
                     } else if (that._recordCount > that._errorCount) {
                     that.refreshCode();
                     }*/
                    that.$btnSubmit.removeClass('disabled');
                }
            })
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
        LoginSubmit: function (data) {
            var that = this;

            var formData = data;

            AppPage.loadApi({
                url: that.route.doLogin + '?userName=' + encodeURIComponent(formData.userName) + '&password=' + formData.password,
                type: 'post',
                dataType: 'json',
                data: formData,
                ignoreSession: true,
                async: false,
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
                        that._recordCount++;
                    }
                },
                error: function (xhr, status) {
                    that.showTip('登录请求失败！');
                    window.location.href = that.route.login;
                },
                complete: function (xhr, status) {
                    if (that._recordCount == that._errorCount) {
                        that.showCaptcha();
                    } else if (that._recordCount > that._errorCount) {
                        that.refreshCode();
                    }
                    that.$btnSubmit.removeClass('disabled');
                }
            })
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
    };
    _page.init();
})(this);