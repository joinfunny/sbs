var app = require('../helper/base.js');


var FilterCate = app.BaseModel.extend({
    fetchData: function() {
        var model = this;
        var data = this.get('data');

        if(data) {
            var def = $.Deferred();
            var promise = def.promise();

            def.resolve(data);

            return def.promise();
        } else {
            var promise = Backbone.ajax({
                url: ":8478/services/category/info/all",
                type: 'get',
                isJava: true,
                api: true
            });

            return promise.then(function(data) {
                data = model.parse(data);

                model.set({
                    data: data
                });

                return data;
            });
        }
    }
});

module.exports = FilterCate;