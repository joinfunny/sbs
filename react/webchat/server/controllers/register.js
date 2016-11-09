'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/register.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');

class RegisterController extends MController {
    render(data) {
        this.component = React.createElement(Page, {
            data: data
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = RegisterController;