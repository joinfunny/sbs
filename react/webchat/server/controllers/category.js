'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/category.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');
var City = require('../models/city.js');

class CategoryController extends MController {
    getQuery() {
        var promise = super.getQuery();

        promise.then(function(data) {
            data.cate3 = 1;
            return data;
        });
        return promise;
    }

    getData() {
        var cookie = this.req.requestCookie;

        var areaid = '110100';
        if(cookie.areaid) {
            areaid = cookie.areaid;
        }
        return this.fetch(':8478/services/category/list/byCity/'+areaid, {isJava: true}).then((data) => {
            return City.singleton().get().then(() => {

                var city = City.singleton().findCityByAreaid(areaid);

                var result = {
                    list: data,
                    userArea: city
                };

                return result;
            });
        });
    }

    render(data) {
        this.component = React.createElement(Page, {
            data: data
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = CategoryController;