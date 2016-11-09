var app = require('../app.js');
var pageView = require('../../react_pages/school_detail.jsx');
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
            title: this.fetchData.base.name+'学校在课栈网开课啦',
            link: location.href,
            desc: this.fetchData.desp,
            imgUrl: this.fetchData.base.logo
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

kz_m.Controllers['school_detail'] = module.exports = Controller;