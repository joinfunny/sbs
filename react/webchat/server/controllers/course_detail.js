'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/course_detail.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');
var City = require('../models/city.js');
var _ = require('lodash');

class DetailController extends MController {
    getQuery() {
        var params = this.params;
        return City.parse2areaid(params).then(function(data){
            var sort = {
                SortArray:[
                    'id',//一级分类
                    'userId'
                    ]}
            return _.extend({
                    userId:'0' // 用户ID
                }, params, sort)
        });
    }

    // getSEO(data) {
    //     return {
    //         title : data.name+' - 课栈网',
    //         keywords : data.name,
    //         description : '课栈网提供全方位的'+data.name+'服务,包括了'+data.name+'培训机构等相关信息,了解更多的'+data.name+'培训相关问题就上课栈网.'
    //     }
    // }

    getData() {
        var view = this;
        return view.fetch(':8478/services/product/info',{isJava:true,params:true}).then((data)=>{
            if(data.isfollow == 1){
                data.isFocus = false
            }else if (data.isfollow == 2){
                data.isFocus = true
            }
            if(data.supporttrial == 1){
                data.is_listen = false
            }else if (data.supporttrial == 2){
                data.is_listen = true
            }
            return view.fetch(':8478/services/product/list/'+data.categoneid+'-'+data.categtwoid+'-'+data.categid+'-0--0-0-0-0-0-0-0-0-0-1-4',{isJava:true}).then((course_list)=>{
                data.course_list = course_list.result;
                return data;
            })
        });
    }

    render(data, user) {
        this.component = React.createElement(Page, {
            data: data,
            userid: user.userid,
            isLogin: !!user.userid
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = DetailController;