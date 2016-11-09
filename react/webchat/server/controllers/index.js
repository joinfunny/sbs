'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/index.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');
var City = require('../models/city.js');

class IndexController extends MController {
    getQuery() {
        var params = this.params;
        return City.parse2areaid(params);
    }

    getData(cookie) {
        //如果请求时参数中无aresid数据，默认给 cookie中参数
        if(!this.params.areaid){this.params.areaid = cookie.areaid}
        return this.fetch('/app/apinew/mmyhome').then(function(data) {
            // 移除无用数据防止页面输出数据太多
            if(data.courseList && data.courseList.length > 0) {
                data.courseList.map(function(cateList) {
                    if(cateList.courses && cateList.courses.length > 0) {
                        cateList.courses.map(function(item) {
                            delete item.desp;
                            delete item.school_desp;
                        });
                    }
                });
            }
            return data;
        });
    }

    // getSEO(data) {
    //     var city = data.userArea;

    //     return {
    //         title : '【'+city.name+'培训】_机构_课程 - 课栈网',
    //         keywords : city.name+'培训机构,'+city.name+'培训课程',
    //         description : '课栈网'+city.name+'频道专注各类培训主要介绍内容有：'+city.name+'培训机构,'+city.name+'培训课程等内容，找'+city.name+'相关培训就上课栈网.'
    //     }
    // }

    render(data) {
        this.component = React.createElement(Page, {
            data: data
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = IndexController;