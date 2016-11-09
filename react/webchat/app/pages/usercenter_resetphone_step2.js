var app = require('../app.js');
var pageView = require('../../react_pages/usercenter_resetphone_step2.jsx');
var React = require('react');
var ReactDom = require('react-dom');

var Controller = app.BaseView.extend({
    render: function(state, dom) {
        return ReactDom.render(React.createElement(pageView, {
            data: state,
            app: app,
            query: this.getParams()
        }), dom);
    }
});

kz_m.Controllers['usercenter_resetphone_step2'] = module.exports = Controller;