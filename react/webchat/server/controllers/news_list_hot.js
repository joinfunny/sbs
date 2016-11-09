'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/news_list_hot.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');
var _ = require('lodash');

class IndexController extends MController {

    getSEO(data) {
        return {
            title : '教育培训资讯_培训机构资讯 - 课栈网',
            keywords : '教育培训资讯,培训机构资讯',
            description : '课栈网为您提供行业内最全的课程培训信息及其机构信息,课栈网还推出课程优惠券,可以帮助您既学习感兴趣的课程又得到实惠,找课程及其培训机构就上课栈网'
        }
    }
    getQuery() {
        var params = this.params;
        var promise = new Promise(function(resolve, reject) {
            var sort = {
                SortArray:[
                    'cateid',       //1级分类ID
                    'cateid2',      //2级分类ID
                    'cateid3',      //3级分类ID
                    'cateid4',      //4级分类ID
                    'schoolid',     //机构ID
                    'wd',           //关键词
                    'p',    //页数
                    'page'          //每页条数
                    ]}
            var soredata = _.extend({
                    cateid: '0',       //1级分类ID
                    cateid2: '0',      //2级分类ID
                    cateid3: '0',      //3级分类ID
                    cateid4: '0',      //4级分类ID
                    schoolid: '0',     //机构ID
                    wd: '',           //关键词
                    p:'1', //页数
                    page:'15'      //每页条数
                }, params,sort)
            resolve(soredata);
        }, function() {
            resolve(params);
        });
        return promise;
    }

    getData() {
        var view = this;
        var promise = Promise.all([
            this.fetch(':8478/services/news/category/list/tree', {isJava: true}),   //分类列表
            this.fetch(':8478/services/news/list', {isJava: true, params: true})  // 学校详情
        ]).then(function(result) {
            var cateList = result[0];
            var result = result[1].result;
            var cate = { '0':{categid: 0,categname: '全部'}};
            var cateid2 = view.params.cateid2||0;
            var cateid3 = view.params.cateid3||0;
            cateList.map((item, key)=>{
                var chiledList = item.childList;
                chiledList.map((child, index)=>{
                    delete child.childList
                })
                cate[item.categid] = item;
            })
            var data = {
                cateList: cate, //分类列表
                adList: {}, //轮播图
                result: result, //咨询列表
                cateid2: cateid2,
                cateid3: cateid3,
            };
            return data;
        });

        return promise;
    }

    render(data) {
        this.component = React.createElement(Page, {data: data});

        return ReactDom.renderToString(this.component);
    }
}

module.exports = IndexController;