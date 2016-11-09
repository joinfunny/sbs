'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/usercenter_info.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');

class UsercenterInfoController extends MController {
    render(data, userData) {
        this.component = React.createElement(Page, {
            data: data,
            user: userData,
            query: this.params,
            cookie: this.req.headers['cookie']
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = UsercenterInfoController;