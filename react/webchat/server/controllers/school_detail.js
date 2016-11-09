'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/school_detail.jsx');
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
                    'id',      //机构ID
                    'userId'
                    ]}
            return _.extend({
                    userId:'0' // 用户ID 会在fetch文件获取cookie替换
                }, params, sort)
        });
    }

    // getSEO(data) {
    //     return {
    //         title : data.base.name+' - 课栈网',
    //         keywords : data.base.name,
    //         description : '课栈网提供全方位的'+data.base.name+'服务,包括了'+data.base.name+'培训机构等相关信息,了解更多的'+data.base.name+'培训相关问题就上课栈网.'
    //     }
    // }

    getData(cookie) {
        var promises = [];
        var data = {
            base : {},
            course : [],
            comment: [],
            similar_schools: []
        }                       
        var schoolDetails = this.fetch(':8478/services/organize/info', {isJava:true,params:true});
        var schoolClass = this.fetch(':8478/services/product/list/0-0-0-'+this.params.id+'--0-0-0-0-0-0-0-0-0-1-4', {isJava:true});
        var likeClass = this.fetch(':8478/services/product/info/byView/'+cookie.areaid, {isJava:true});
        
        promises.push(schoolDetails);
        promises.push(schoolClass);
        promises.push(likeClass);
        return Promise.all(promises).then((result) => {
            data.base = result[0];
            data.course = result[1].result;
            data.similar_schools = result[2];

            if(data.base.isfollow == 1){
                data.base.isFocus = false
            }else if (data.base.isfollow == 2){
                data.base.isFocus = true
            }
            return data
        })
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