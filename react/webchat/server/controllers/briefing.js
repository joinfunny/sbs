'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/briefing.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');

class NewsDetailController extends MController {
    getQuery() {
        return super.getQuery().then(function(params) {
            params.json = 1;
            return params;
        });
    }

    getData() {
        var params = this.params;
        if(params.type == 'sch'){
            return this.fetch(':8478/services/organize/info/orgabase/'+params.id, {isJava:true}).then((data) => {
                var page = {
                    title: data.organame,
                    content: decodeURIComponent(data.organizeDesc),
                    type: this.params.type
                }
                return page;
            });
        }else if(params.type == 'course'){
            return this.fetch(':8478/services/product/info/'+params.id+'/desc', {isJava:true}).then((data) => {
                var page = {
                    title: data.productname,
                    content: decodeURIComponent(data.productDesc),
                    type: this.params.type
                }
                return page;
            });
        }
    }

    render(data) {
        this.component = React.createElement(Page, {
            data: data, 
            userAgent: this.req.headers['user-agent']
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = NewsDetailController;