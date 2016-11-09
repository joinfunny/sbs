'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/course_search.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');
var Category = require('../models/category.js');
var City = require('../models/city.js');
var _ = require('lodash');

class SearchController extends MController {

    getQuery() {
        var params = this.params;
        return City.parse2areaid(params)
    }

    // getSEO(data) {
    //     var city = data.userArea;

    //     if(data.cateName) { // 分类
    //         return {
    //             title: '【'+city.name+data.cateName+'培训】_课程_价格 - 课栈网',
    //             keywords: city.name+data.cateName+'培训,'+city.name+data.cateName+'课程,'+city.name+data.cateName+'价格',
    //             description: '课栈网提供精准的'+data.cateName+'机构及其相关详细信息,主要包含了:'+city.name+data.cateName+'培训,'+city.name+data.cateName+'课程,'+city.name+data.cateName+'价格等，第一时间获取'+data.cateName+'相关信息,就上课栈网.'
    //         }
    //     } else {
    //         return {
    //             title : '【'+city.name+'培训】_课程_价格 - 课栈网',
    //             keywords : city.name+'培训课程,'+city.name+'培训价格',
    //             description : '课栈网提供精准的'+city.name+'培训相关详细信息,主要包含了:'+city.name+'培训课程,'+city.name+'培训价格等，第一时间获取'+city.name+'培训信息,就上课栈网.'
    //         }
    //     }
    // }

    getData() {
        return Category.singleton().get().then(() => {
            this.params = _.extend({p:1, pageszie:15}, this.params);
            if(this.params.categid) {
                var cate = Category.singleton().getCateById(this.params.categid);
                this.params = _.extend(this.params, cate);
                // delete this.params['categid'];
            }
            this.params.areaid = this.params.areaid || this.req.requestCookie.areaid || '';
            // return this.fetch(':8478/services/product/list',{isJava:true,params:true}).then((data) => {
            return this.fetch('/app/apinew/courselist').then((data) => {
                var categoneid = parseInt(this.params.categoneid);
                var categtwoid = parseInt(this.params.categtwoid);
                var categid = parseInt(this.params.categid);

                if(_.isNaN(categoneid)) {
                    categoneid = '';
                }

                if(_.isNaN(categtwoid)) {
                    categtwoid = '';
                }
                
                if(_.isNaN(categid)) {
                    categid = '';
                }
                

                data.categoneid = categoneid;
                data.categtwoid = categtwoid;
                data.categid = categid;

                if(data.page.totalPages > data.page.nowPage) {
                    data.page.hasnext = true;
                }else {
                    data.page.hasnext = false;
                }
                return data;
            });
        });
    }

    render(data) {
        this.component = React.createElement(Page, {
            data: data,
            query: this.params
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = SearchController;