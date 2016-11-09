'use strict';
var react = require('react');
var fetch = require('./fetch.js');
var _ = require('lodash');

var abstractMethod = ['getData', 'render'];
var checkAbstract = function (instance) {
    abstractMethod.forEach((method) => {
        if (instance[method] == MController.prototype[method]) {
            instance[method]();
        }
    });
};
/**
 * MController
 * 抽象类Controller，子类继承必须重写抽象函数
 */
class MController {
    constructor(req, res) {
        // check abstract method is be implemented.
        checkAbstract(this);
        // layout页面
        this.layout = 'layout.ejs';
        this.req = req;
        this.res = res;
        this.params = _.extend({}, req.query, req.params);
        this.query = _.extend({}, req.query);
        this.city = req.city || {};
        // 存储react create 实例的对象
        this.component = null;
        // fetch返回数据
        this.response;

        res.setHeader('Content-Type', 'text/html');
        this.initialize();
    }

    initialize() {}

    getSEO(data) {

        if (this.component && this.component.props.getSEO) {
            return this
                .component
                .props
                .getSEO();
        } else {
            return {
                // title keywords description
            };
        }
    }
    /**
     * 同步接口请求的参数
     */
    getQuery() {
        var promise = Promise.resolve(this.params);

        return promise;
    }

    /**
     * 页面数据
     * 当参数json=1时用来做异步接口数据
     */
    getData(params) {
        var promise = Promise.resolve({});

        return promise;
    }
    /**
     * 渲染页面函数
     */
    render(data) {
        throw new Error('render not implement!');
    }

    fetch(url, java) {
        return this
            .getQuery()
            .then((query) => {
                return fetch.call(this, url, this.req.headers, query, java);
            })
            .then((response) => {
                this.response = response;

                return Promise.resolve(response.data);
            });

    }
}

module.exports = MController;