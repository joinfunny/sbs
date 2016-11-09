var app = require('../app.js');
var pageView = require('../../react_pages/forget.jsx');
var React = require('react');
var ReactDom = require('react-dom');

var Controller = app.BaseView.extend({
    initialize: function() {

    },
    render: function(state, dom) {
        var view = this;
        
        return ReactDom.render(React.createElement(pageView, {
            data: state,
            app: app,
            query: this.getParams()
        }), dom);
    }
});

kz_m.Controllers['forget'] = module.exports = Controller;