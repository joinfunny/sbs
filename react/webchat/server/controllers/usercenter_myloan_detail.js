'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/usercenter_myloan_detail.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');


class DetailController extends MController {
	getQuery() {
        return super.getQuery().then(function(params) {
            params.isJson = 1;
            return params;
        });
    }

    getData() {
        return this.fetch('/m/mloan/detail').then(function(data) {
            return data;
        });
    }


    render(data, userData) {
        this.component = React.createElement(Page, {
            data: data,
            user: userData
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = DetailController;