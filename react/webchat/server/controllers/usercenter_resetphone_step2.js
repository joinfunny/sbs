'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/usercenter_resetphone_step2.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');

class UsercenterModifyPasswordController extends MController {
    render(data, userData) {
        this.component = React.createElement(Page, {
            data: data,
            user: userData,
            query: this.params
        });
        return ReactDom.renderToString(this.component);
    }
}

module.exports = UsercenterModifyPasswordController;