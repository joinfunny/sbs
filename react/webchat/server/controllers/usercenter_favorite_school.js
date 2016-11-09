'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/usercenter_favorite_school.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');
var _ = require('lodash');

class UsercenterInfoController extends MController {
    getQuery() {
        var params = this.params;
        var promise = new Promise(function(resolve, reject) {
            var sort = {
                SortArray:[
                    'userId',    //用户ID
                    'pageIndex', //页数
                    'page'       //每页条数
                    ]}
            var soredata = _.extend({
                    userId:'0',    //用户ID
                    pageIndex:'1', //页数
                    page:'20'      //每页条数
                }, params,sort)
            resolve(soredata);
        }, function() {
            resolve(params);
        });
        return promise;
    }
    getData() {
        return this.fetch(':8478/services/follow/followOrga/list', {isJava:true, params:true}).then((data) => {
            return data;
        });
    }

    render(data, userData) {
        return ReactDom.renderToString(React.createElement(Page, {
            data: data.result,
            user: userData,
            query: this.params,
            cookie: this.req.headers['cookie']
        }));
    }
}

module.exports = UsercenterInfoController;