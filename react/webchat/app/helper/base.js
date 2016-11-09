var Backbone = require('backbone');
var _ = require('underscore');
var app = module.exports = {};

var singleton = function() {
    if(!this.__instache) {
        this.__instache = new this();
    }
    return this.__instache;
};

app.ajax = function() {
    return Backbone.ajax.apply(this, arguments);
};

app.BaseView = Backbone.View.extend({
    ajax: app.ajax,
    isScrollTo: true,
    viewBeActive: function() {},
    getSEO: function() {
        if(this.component && this.component.props.getSEO) {
            try {
                return this.component.props.getSEO();
            } catch(e) {}
        }

        return {};
    },
    getParams: function() {
        var params = {};
        location.search.split(/\?|\&/).forEach(function(value) {
            if(value.indexOf('=') != -1) {
                var kv = value.split('=');
                params[kv[0]] = kv[1];
            }
        });
        return params;
    },
    destory: function() {}
}, {
    singleton: singleton
});

app.BaseModel = Backbone.Model.extend({
    ajax: app.ajax
}, {
    singleton: singleton
});

app.BaseCollection = Backbone.Collection.extend({
    ajax: app.ajax
}, {
    singleton: singleton
});