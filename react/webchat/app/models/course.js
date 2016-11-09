var app = require('../helper/base.js');
var Cache = require('../helper/cache.js');

var Course = app.BaseModel.extend({
    unfocus: function() {
        var model = this;
        return this.ajax({
            url: ':8478/services/follow/followSku/del',
            api: true,
            isJava: true,
            type: 'post',
            data: {
                skuid: this.get('id'),
                userid: this.get('userid')
            }
        }).done(function() {
            Cache.singletonAjax().clear();
            model.set('isFocus', true);
        });
    },
    focus: function() {
        var model = this;
        return this.ajax({
            url: ':8478/services/follow/followSku/added',
            api: true,
            isJava: true,
            type: 'post',
            data: {
                productid: this.get('id'),
                skuid: this.get('id'),
                userid: this.get('userid')
            }
        }).done(function() {
            Cache.singletonAjax().clear();
            model.set('isFocus', false);
        });
    },
    listenApply: function(name, tel, vcode, type) {
        return this.ajax({
            type: 'post',
            url: '/activity/signup',
            api: true,
            data: {
                name: name,
                tel: tel,
                vcode: vcode,
                cid: this.get('id'),
                aid: this.get('aid'),
                type: type || 1 // 1为普通试听
            }
        });
    },
});

module.exports = Course;