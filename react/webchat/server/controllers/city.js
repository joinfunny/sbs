'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/city.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');

class CityController extends MController {
    getData() {
        return this.fetch('/app/apinew/coursecitylist');
    }

    render(data) {
        this.component = React.createElement(Page, {
            data: data
        });
        
        return ReactDom.renderToString(this.component);
    }
}

module.exports = CityController;