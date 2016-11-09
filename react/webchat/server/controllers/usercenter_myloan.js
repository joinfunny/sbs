'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/usercenter_myloan.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');


class DetailController extends MController {
	getData() {
        return this.fetch('/app/apinew/getmyloan').then((data) => {
            return data;
        });
    }

    render(data, userData) {
        this.component = React.createElement(Page, {
            data: data,
            user: userData,
            query: this.params
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = DetailController;