var app = require('../helper/base.js');
var Cookie = require('../helper/cookie.js');
var Cache = require('../helper/cache.js');

var System = app.BaseModel.extend({
    sendVCode: function(tel) {
        return Backbone.ajax({
            url: '/app/appuser/code',
            type: 'post',
            api: true,
            data: {
                tp: 'sent',
                tel: tel 
            }
        });
    },
    registerCode: function(tel) {
        return Backbone.ajax({
            url: ':8468/services/passport/smscode/register/'+tel,
            type: 'get',
            isJava: true,
            api: true
        });
    },
    smsCode: function(tel) {
        return Backbone.ajax({
            url: ':8468/services/passport/smscode/pwd/'+tel,
            type: 'get',
            isJava: true,
            api: true
        });
    },
    checkVCode: function(tel, co) {
        return Backbone.ajax({
            url: '/app/appuser/code',
            type: 'post',
            api: true,
            data: {
                tp: 'ckco',
                tel: tel,
                co: co
            }
        }).then(function(data) {
            var def = $.Deferred();

            if(data.result == 1) {
                alert('手机验证码错误！');
                return def.reject();
            } else {
                return def.resolve();
            }
        });
    },
    coord2Cityid: function(position) {
        return Backbone.ajax({
            url: ':8478/services/area/address/'+(position.lng||116.403958)+','+(position.lat||39.915049),
            type: 'get',
            isJava: true,
            api: true
        });
    },
    getLocation: function() {
        var def = $.Deferred();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                def.resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, function(error) {
                def.reject(-1);
            });
        } else {
            def.reject(-1);
        }

        this.getLocation = function() {
            return def.promise();
        };
        return this.getLocation();
    },
    getArea: function() {
        var def = $.Deferred();
        var model = this;

        this.getLocation().always(function(result) {
            var position = result == -1 ? {} : result;
            var promise = model.coord2Cityid(position);

            promise.done(function(data) {
                if(data == true) data = {};
                data.gps = result;
                def.resolve(data);
            });

            promise.fail(function(xhr, data, showError) {
                showError(false);
                def.resolve({
                    gps: result
                });
            });
        });

        this.getArea = function() {
            return def.promise();
        };

        return this.getArea();
    },
    setAreaid: function(areaid) {
        return Backbone.ajax({
            url: '/',
            type: 'get',
            dataType: 'text',
            data: {
                areaid: areaid
            }
        });
    },
    clearPageCache: function() {
        Cache.singletonAjax().clear();
    }
    // setAreaid: function(areaid) {
    //     Cookie.set('areaid', areaid, {
    //         domain: '.kezhanwang.cn',
    //         expires: 30,
    //         path: '/'
    //     });
    // },
    // clearAreaid: function() {
    //     Cookie.remove('areaid', {
    //         domain: '.kezhanwang.cn',
    //         expires: 30,
    //         path: '/'
    //     });
    // }
}, {
    REGEXP: {
        mobilephone: /^[1-9][0-9]{10}$/i
    }
});

module.exports = System;