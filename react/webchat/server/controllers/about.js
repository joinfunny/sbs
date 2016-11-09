'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/about.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');


class DetailController extends MController {


    render() {
        this.component = React.createElement(Page, {});

        return ReactDom.renderToString(this.component);
    }
}

module.exports = DetailController;