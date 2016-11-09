'use strict';

var MCModel = require('../components/mcmodel.js');
var _ = require('lodash');

class City extends MCModel {
    _get() {
        // return this.fetch('/app/mdomain/coursecitylist').then((data) => {
        return this.fetch('/app/apinew/coursecitylist').then((data) => {
            return this.parse(data.data);
        });
    }
    /**
     * 格式化成 {pingyin: 城市信息}
     */
    parse(data) {
        var result = {};
        _.map(data.all, (arr) => {
            _.map(arr.list, (item) => {
                if(item.code) {
                    //上线注释掉
                    result[item.code] = item;
                }
            });
        });
        return result;
    }

    /**
     * find city by areaid
     */
    findCityByAreaid(areaid) {
        if(this.cachedata) {
            for(var i in this.cachedata) {
                if(this.cachedata[i].areaid == areaid) {
                    return this.cachedata[i];
                }
            }
        }

        return {};
    }

    findAreaidByCity(city) {
        if(this.cachedata) {
            if(city in this.cachedata) {
                return this.cachedata[city].id;
            }
        }

        return;
    }

    static parse2areaid(params) {
        var promise = new Promise(function(resolve, reject) {
            // 解析城市拼音到areaid
            City.singleton().get().then(function(data) {
                if(params.city in data) {
                    params.areaid = data[params.city].id;
                    delete params.city;
                }
                resolve(params);
            }, function() {
                resolve(params);
            });
        });

        return promise;
    }
}

module.exports = City;