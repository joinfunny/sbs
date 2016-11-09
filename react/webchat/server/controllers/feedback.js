'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/feedback.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');


class DetailController extends MController {

    render(userData) {
        this.component = React.createElement(Page, {
        	user: userData,
            query: this.params,
            cookie: this.req.headers['cookie']
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = DetailController;