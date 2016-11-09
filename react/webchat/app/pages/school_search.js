var app = require('../app.js');
var pageView = require('../../react_pages/school_search.jsx');
var React = require('react');
var ReactDom = require('react-dom');


var Controller = app.BaseView.extend({
    wxShareInfo: function() {
        // var link = location.origin+'/'+location.pathname;
        // if(this.fetchData.userArea.jpy) {
        //     var link = location.origin+'/'+this.fetchData.userArea.jpy+'/'+location.pathname;
        // }

        return {
            title: '课栈网'+this.fetchData.cateName+'机构列表',
            link: location.href,
            desc: '我在课栈网发现了好多有趣机构，一起看看吧',
            imgUrl: 'http://res1.kezhanwang.cn/static/mh5/images/share_logo_d1ae03.jpg'
        };
    },
    viewBeActive: function() {
        app.checkArea();
        if(this.component) {
            var params = this.getParams();
            this.component.viewBeActive(params);
        }
    },
    render: function(data, dom) {
        var view = this;

        this.data = data;

        return ReactDom.render(React.createElement(pageView, {
            data: data,
            query: this.getParams(),
            app: app
        }), dom);
    }
});

kz_m.Controllers['school_search'] = module.exports = Controller;