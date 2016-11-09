'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/usercenter_signup_course.jsx');
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
                    'userToken',    //用户Token
                    'pageIndex', //页数
                    'page'       //每页条数
                    ]}
            var soredata = _.extend({
                    userId:'0',    //用户ID
                    userToken: '0',    //用户Token
                    pageIndex:'1', //页数
                    page:'50'      //每页条数
                }, params,sort)
            resolve(soredata);
        }, function() {
            resolve(params);
        });
        return promise;
    }

    getData() {
        return this.fetch(':8458/services/clue/list/sigupProduct', {isJava:true,params:true}).then((data) => {
            return data;
        });
    }

    render(data, userData) {
        return ReactDom.renderToString(React.createElement(Page, {
            data: data,
            user: userData,
            query: this.params,
            cookie: this.req.headers['cookie']
        }));
    }
}

module.exports = UsercenterInfoController;