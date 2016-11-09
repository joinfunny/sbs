'use strict';

var MCModel = require('../components/mcmodel.js');

class Category extends MCModel {
    constructor() {
        super();
    }

    _get() {
        return this.fetch(':8478/services/category/info/all', {}, {isJava:true}).then((data) => {
            return this.flatten(data.data);
        });
    }

    flatten(data) {
        var result = {};

        for(var i in data) {
            var cate1item = data[i];
            result[cate1item.categid] = {
                cate1id: cate1item.categid,
                cate2id: '',
                cate3id: '',
                type: 'cate1id',
                name: cate1item.categname
            }
            if(cate1item.childList) {
                for(var j in cate1item.childList) {
                    var cate2item = cate1item.childList[j];
                    result[cate2item.categid] = {
                        cate1id: cate1item.categid,
                        cate2id: cate2item.categid,
                        cate3id: '',
                        type: 'cate2id',
                        name: cate2item.categname
                    }
                    if(cate2item.childList) {
                        for(var j in cate2item.childList) {
                            var cate3item = cate2item.childList[j];
                            result[cate3item.categid] = {
                                cate1id: cate1item.categid,
                                cate2id: cate2item.categid,
                                cate3id: cate3item.categid,
                                type: 'cate3id',
                                name: cate3item.categname
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    getCateById(id) {
        var item = {};
        var data = this.cachedata;

        if(id in data) {
            item = data[id];
        }

        return {
            categoneid: item.cate1id || '',
            categtwoid: item.cate2id || '',
            categid: item.cate3id || ''
        }
    }

    // static singleton() {
    //     if(!this.__instance) {
    //         this.__instance = new this();
    //     }

    //     return this.__instance;
    // }
}

module.exports = Category;