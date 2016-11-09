var app = require('../app.js');
var pageView = require('../../react_pages/index.jsx');
var React = require('react');
var ReactDom = require('react-dom');

var Controller = app.BaseView.extend({
    viewBeActive: function() {
        app.checkArea();
    },
    render: function(state, dom) {
        return ReactDom.render(React.createElement(pageView, {
            data: state,
            app: app
        }), dom);
    }
});

kz_m.Controllers['index'] = module.exports = Controller;