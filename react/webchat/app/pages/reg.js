var app = require('../app.js');
var pageView = require('../../react_pages/reg.jsx');
var React = require('react');
var ReactDom = require('react-dom');

var Controller = app.BaseView.extend({
    wxShareInfo: function() {
        return {
            title: this.fetchData.name,
            link: location.href,
            desc: '我在课栈网发现了'+this.fetchData.school_name+'的'+this.fetchData.name+'的课程，一起来看看吧',
            imgUrl: this.fetchData.logo
        };
    },
    render: function(state, dom) {
        return ReactDom.render(React.createElement(pageView, {}), dom);
    }
});

kz_m.Controllers['reg'] = module.exports = Controller;