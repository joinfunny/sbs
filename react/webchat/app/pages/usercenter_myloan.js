var app = require('../app.js');
var pageView = require('../../react_pages/usercenter_myloan.jsx');
var React = require('react');
var ReactDom = require('react-dom');

var Controller = app.BaseView.extend({
    render: function(state, dom) {
        ReactDom.render(React.createElement(pageView, {
            data: state,
            app: app,
            cookie: document.cookie,
            query: this.getParams()
           
        }), dom);
    },
    initialize: function() {
    }
});

kz_m.Controllers['usercenter_myloan'] = module.exports = Controller;