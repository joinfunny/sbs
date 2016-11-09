'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/search_interface.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');
var City = require('../models/city.js');

class SearchInerfaceController extends MController {

    getData() {
        //return this.fetch('/app/apiv20/articles');
    }

    render(data) {
        this.component = React.createElement(Page, {data: data});

        return ReactDom.renderToString(this.component);
    }
}

module.exports = SearchInerfaceController;
