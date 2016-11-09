var app = require('../helper/base.js');

var CourseSearch = app.BaseModel.extend({
    defaults: function() {
        return {
            wd: '',
            p: 1,
            json: 1
        }
    },
    fetchNext: function() {
        var model = this;
        var data = this.toJSON();

        var promise = Backbone.ajax({
            url: '/course',
            data: data
        });

        return promise;
    }
});

module.exports = CourseSearch;