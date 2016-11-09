var app = require('../helper/base.js');
var Cache = require('../helper/cache.js');
var Cookie = require('../helper/cookie.js');

var User = app.BaseModel.extend({
    login: function(username, password) {
        var model = this;
        var promise = Backbone.ajax({
            url: '/app/appusernew/uinfo',
            type: 'post',
            api: true,
            data: {
                tp:'get',
                em: username, // 电话 or 邮箱
                pw: password
            }
        });

        return promise.then(function(data) {
            return model.fetchUserInfo();
        });
    },
    logout: function() {
        var model = this;
        var promise = Backbone.ajax({
            url: '/page/logout',
            api: true,
            data: {
                json: 1
            }
        });

        promise.then(function() {
            model.clear();
        });
        return promise;
    },
    register: function(data) {
        var model = this;
        var promise = Backbone.ajax({
            url: ':8468/services/passport/register',
            type: 'post',
            isJava: true,
            api: true,
            data: {
                'mobile': data.phone,
                'password': data.password,
                'validCode': data.vcode,
                'fromtype': '0',
                'from': '0',
                'cpsid': '0',
                'registip': '0'
            }
        });

        return promise.then(function(data) {
            Cookie.set('bx_user', data, {domain:'.kezhanwang.cn'});
            return model.fetchUserInfo();
        });
    },
    changePwd: function(oldpwd, newpwd, checkpwd) {
        return Backbone.ajax({
            url: ':8468/services/user/info/pwd',
            type: 'post',
            api: true,
            isJava: true,
            data: {
                "userid": this.get('userid'), 
                "password": newpwd, 
                "passwordOld": oldpwd,
                "token": Cookie.get('bx_user').split(',')[3]
            }
        });
    },
    // resetPwd: function(mobile, code, pwd, repwd) {
    //     return Backbone.ajax({
    //         url: ':8468/services/passport/pwd',
    //         type: 'post',
    //         isJava: true,
    //         api: true,
    //         data: {
    //             mobile: mobile,
    //             validCode: code,
    //             password: pwd
    //         }
    //     });
    // },
    resetPwd: function(mobile, code, pwd, repwd) {
        var model = this;
        var promise = Backbone.ajax({
            url: ':8468/services/passport/pwd',
            type: 'post',
            isJava: true,
            api: true,
            data: {
                mobile: mobile,
                validCode: code,
                password: pwd
            }
        });

        return promise.then(function(data) {
            Cookie.set('bx_user', data, {domain:'.kezhanwang.cn'});
            return model.fetchUserInfo();
        });
    },
    resetInfo: function(name, gender) {
        var model = this;
        var promise = Backbone.ajax({
            url: ':8468/services/user/info/username',
            type: 'post',
            isJava: true,
            api: true,
            data: {
                "userid": this.get('userid'), 
                "username": name,
                "gender": gender,
                "token": Cookie.get('bx_user').split(',')[3]
            }
        }).done(function() {
            Cache.singletonAjax().clear();
        });
        return promise.then(function(data) {
            return model.fetchUserInfo();
        });
    },
    getCode: function(tel, vcode) {
        return Backbone.ajax({
            url: '/app/appuser/code',
            type: 'post',
            api: true,
            data: {
                tel: tel,
                tp: "sent",
                vcode: vcode
            }
        });
    },
    // 修改手机号码的验证码
    phoneCode: function(tel) {
        return Backbone.ajax({
            url: ':8468/services/user/smscod/checkuser/'+tel,
            type: 'get',
            api: true,
            isJava: true
        });
    },
    newPhoneCode: function(tel) {
        return Backbone.ajax({
            url: ':8468/services/user/smscod/updatemobile/'+tel,
            type: 'get',
            api: true,
            isJava: true
        });
    },
    resetPhone: function(tel, code) {
        var model = this;
        var promise = Backbone.ajax({
            url: '/app/appuser/Update',
            type: 'post',
            api: true,
            data: {
                new_tel: tel,
                new_code: code
            }
        }).done(function() {
            Cache.singletonAjax().clear();
        });
        return promise.then(function(data) {
            return model.fetchUserInfo();
        });
    },
    resetOldPhone: function(tel, co) {
        var model = this;
        var promise = Backbone.ajax({
            url: ':8468/services/user/info/checkuser',
            type: 'post',
            api: true,
            isJava: true,
            data: { 
                "userid": this.get('userid'), 
                "mobile": tel+'', 
                "validCode": co,
                "token": Cookie.get('bx_user').split(',')[3]
            }
        });
        return promise;
    },
    resetNewPhone: function(tel, code, oldCode, oldTer) {
        var model = this;
        var promise = Backbone.ajax({
            url: ':8468/services/user/info/mobile',
            type: 'post',
            api: true,
            isJava: true,
            data: { 
                "userid": this.get('userid'), 
                "mobile": tel, 
                "validCode": code,
                "oldMobile": oldTer, 
                "oldValidCode": oldCode,
                "token": Cookie.get('bx_user').split(',')[3]
            }
        }).done(function() {
            Cache.singletonAjax().clear();
        });
        return promise.then(function(data) {
            return model.fetchUserInfo();
        });
    },
    delListen: function(cid) {
        return this.ajax({
            type: 'post',
            url: '/app/apiv20/cancellisten',
            api: true,
            data: {
                cid: cid
            }
        });
    },
    getFeedback: function(opts) {
        return this.ajax({
            type: 'post',
            url: '/app/appuser/addAdvice',
            api: true,
            data: {
                name: opts.name,
                phone: opts.phone,
                msg: opts.msg
            }
        });
    },
    fetchUserInfo: function() {
        var model = this;
        var promise = Backbone.ajax({
            url: '/app/appusernew/uinfo',
            api: true,
            data: {
                tp: 'get',
                uid: Cookie.get('bx_user').split(",")[0]
            }
        });
        return promise.then(function(data) {
            model.set(data);
            return promise;
        });
    },
    isLogin: function() {
        return !!this.get('userid');
    },
    userId: function() {
        return this.get('userid');
    },
    initialize: function() {
        var json = $('#user').text();

        $('#user').remove();

        try {
            json = JSON.parse(json);
            this.set(json);
        } catch(e) {}
    }
});

module.exports = User;