'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/map.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');
var City = require('../models/city.js');
var _ = require('lodash');

class MapController extends MController {
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

    getData() {
        return this.fetch(':8478/services/organize/info', {isJava:true,params:true});
    }

    render(data) {
        this.component = React.createElement(Page, {
            data: data,
            query: this.params
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = MapController;