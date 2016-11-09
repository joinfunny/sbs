'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/login.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');

class LoginController extends MController {
    render(data) {
        this.component = React.createElement(Page, {
            data: data,
            userAgent: this.req.headers['user-agent']
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = LoginController;