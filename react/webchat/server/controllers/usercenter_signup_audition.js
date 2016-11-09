'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/usercenter_signup_audition.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');

class UsercenterInfoController extends MController {
    getData() {
        return this.fetch('/app/apiv20/mylisten').then((data) => {
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