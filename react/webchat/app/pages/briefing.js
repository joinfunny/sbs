var app = require('../app.js');
var pageView = require('../../react_pages/briefing.jsx');
var React = require('react');
var ReactDom = require('react-dom');


var Controller = app.BaseView.extend({
    wxShareInfo: function() {
        var description = this.fetchData.content;

        description = description.replace(/<[^>]+>/g,"");
        description = description.replace(/&.*?;/g, "");
        description = description.replace(/\s/g, "");
        description = description.trim();

        var imgUrl = 'http://res1.kezhanwang.cn/static/mh5/images/share_logo_d1ae03.jpg';
        return {
            title: this.fetchData.title,
            link: location.href,
            desc: description.slice(0,45),
            imgUrl: imgUrl
        };
    },
    render: function(data, dom) {
        var view = this;

        this.data = data;

        return ReactDom.render(React.createElement(pageView, {
            data: data,
        }), dom);
    }
});

kz_m.Controllers['briefing'] = module.exports = Controller;