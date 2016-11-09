var app = require('../app.js');
var pageView = require('../../react_pages/usercenter_myloan_detail.jsx');
var React = require('react');
var ReactDom = require('react-dom');

var Controller = app.BaseView.extend({
	viewBeActive: function() {

    },
    render: function(state, dom) {
        return ReactDom.render(React.createElement(pageView, {
                data: state,
                app: app
        }), dom);
    },
    initialize: function() {
    }



    
});

kz_m.Controllers['usercenter_myloan_detail'] = module.exports = Controller;