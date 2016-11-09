var app = require('../app.js');
var pageView = require('../../react_pages/school_allcourse.jsx');
var React = require('react');
var ReactDom = require('react-dom');

var Controller = app.BaseView.extend({
    render: function(state, dom) {
        return ReactDom.render(React.createElement(pageView, {
            data: state,
            app: app
        }), dom);
    }
});

kz_m.Controllers['school_allcourse'] = module.exports = Controller;