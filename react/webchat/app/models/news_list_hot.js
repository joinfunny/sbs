var app = require('../helper/base.js');

var NewsListHot = app.BaseModel.extend({
    defaults: function() {
        return {
            p: 1,
            json: 1
        }
    },
    reset: function() {
        this.set('p', 1);
    },
    fetchNext: function() {
        var model = this;
        var data = this.toJSON();
        var promise = Backbone.ajax({
            url: '/news',
            data: data
        });

        promise.then(function() {
            model.set('p', data.p++);
        });

        return promise;
    }
});

module.exports = NewsListHot;