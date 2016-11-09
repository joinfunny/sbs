var app = require('../helper/base.js');
var Cache = require('../helper/cache.js');

var School = app.BaseModel.extend({
    focus: function() {
        var self = this;
        return this.ajax({
            url: ':8478/services/follow/followOrga/added',
            api: true,
            isJava: true,
            type: 'post',
            data: {
                orgaid: this.get('id'),
                userid: this.get('userid')
            }
        }).done(function() {
            Cache.singletonAjax().clear();
            self.set('isFocus', true);
        });
    },
    unfocus: function() {
        var self = this;
        return this.ajax({
            url: ':8478/services/follow/followOrga/del',
            api: true,
            isJava: true,
            type: 'post',
            data: {
                orgaid: this.get('id'),
                userid: this.get('userid')
            }
        }).done(function() {
            Cache.singletonAjax().clear();
            self.set('isFocus', false);
        });
    },
});

module.exports = School;