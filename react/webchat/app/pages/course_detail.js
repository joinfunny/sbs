var app = require('../app.js');
var pageView = require('../../react_pages/course_detail.jsx');
var React = require('react');
var ReactDom = require('react-dom');
var User = require('../models/user.js');

var Controller = app.BaseView.extend({
    wxShareInfo: function() {
        // var link = location.origin+'/'+location.pathname;
        // if(this.fetchData.userArea.jpy) {
        //     var link = location.origin+'/'+this.fetchData.userArea.jpy+'/'+location.pathname;
        // }

        return {
            title: this.fetchData.name,
            link: location.href,
            desc: '我在课栈网发现了'+this.fetchData.school_name+'的'+this.fetchData.name+'的课程，一起来看看吧',
            imgUrl: this.fetchData.logo
        };
    },
    render: function(state, dom) {
        return ReactDom.render(React.createElement(pageView, {
            data: state,
            app: app,
            userid: User.singleton().userId(),
            isLogin: User.singleton().isLogin()
        }), dom);
    }
});

kz_m.Controllers['course_detail'] = module.exports = Controller;