var app = require('../app.js');
var pageView = require('../../react_pages/search_interface.jsx');
var React = require('react');
var Cache = require('../helper/cache.js');
var ReactDom = require('react-dom');


var Controller = app.BaseView.extend({

    render: function(data, dom) {
        var view = this;
        data = this.data
        return ReactDom.render(React.createElement(pageView, {
            data: data,
            query: this.getParams(),
            app: app,
        }), dom);
    }
});

kz_m.Controllers['search_interface'] = module.exports = Controller;