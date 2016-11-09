'use strict';

var MModel = require('./mmodel.js');
/**
 * 带cache的抽象类
 */
class MCModel extends MModel {
    constructor() {
        super();
        // 缓存数据
        this.cachedata;
        // 过期时间
        this.expired = 0;
        // 缓存默认1天
        this.timeout = 1 * 24 * 60 * 60 * 1000;
    }

    get() {
        if (Date.now() > this.expired) {
            this.cachedata = false;
        }
        if (this.cachedata) {
            return Promise.resolve(this.cachedata);
        } else {
            var promise = this._get();

            promise.then((data) => {
                this.cachedata = data;
                this.expired = Date.now() + this.timeout;
            });

            return promise;
        }
    }

    _get() {
        throw new Error('_get() method are not implemented!');
    }
}

module.exports = MCModel;