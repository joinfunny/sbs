var app = require('../app.js');
var pageView = require('../../react_pages/usercenter.jsx');
var React = require('react');
var ReactDom = require('react-dom');

var Controller = app.BaseView.extend({
    render: function(state, dom) {
        return ReactDom.render(React.createElement(pageView, {
            data: state,
            app: app,
            cookie: document.cookie
        }), dom);
    }
});

kz_m.Controllers['usercenter'] = module.exports = Controller;