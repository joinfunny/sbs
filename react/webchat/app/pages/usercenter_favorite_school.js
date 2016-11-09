var app = require('../app.js');
var pageView = require('../../react_pages/usercenter_favorite_school.jsx');
var React = require('react');
var ReactDom = require('react-dom');

var Controller = app.BaseView.extend({
    render: function(state, dom) {
        ReactDom.render(React.createElement(pageView, {
            data: state.result,
            app: app,
            cookie: document.cookie
        }), dom);
    },
    initialize: function() {
    }
});

kz_m.Controllers['usercenter_favorite_school'] = module.exports = Controller;