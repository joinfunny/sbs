var app = require('../helper/base.js');
var Cookie = require('../helper/cookie.js');

var FilterCircle = app.BaseModel.extend({
    parse: function(data) {
        var list = [];

        for(var i in data) {
            list.push({
                index: i.toUpperCase(),
                data: data[i]
            });
        }

        return list;
    },
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
                url: "/app/apinew/getbusinessarea",
                api: true,
                data: {
                    areaid: Cookie.get('areaid')
                }
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
}, {
    singletonByArea: function(id) {
        if(!this.__instache_map) {
            this.__instache_map = {};
        }
        if(!id) {
            return this.singleton();
        } else {
            this.__instache_map[id] = new this();
            return this.__instache_map[id];
        }
    }
});

module.exports = FilterCircle;