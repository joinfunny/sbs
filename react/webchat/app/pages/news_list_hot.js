var app = require('../app.js');
var pageView = require('../../react_pages/news_list_hot.jsx');
var React = require('react');
var ReactDom = require('react-dom');


var Controller = app.BaseView.extend({
	isScrollTo: false,
    render: function(data, dom) {
        var view = this;
        this.data = data;
        return ReactDom.render(React.createElement(pageView, {
            data: data,
            query: this.getParams(),
            app: app
        }), dom);
    }
});

kz_m.Controllers['news_list_hot'] = module.exports = Controller;