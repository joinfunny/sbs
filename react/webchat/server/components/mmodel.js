'use strict';

var fetch = require('./fetch.js');

class MModel {
    fetch(url, query, java) {
        return fetch.call(this, url, {}, query, java);
    }

    static singleton() {
        if (!this.__instance) {
            this.__instance = new this();
        }

        return this.__instance;
    }
}

module.exports = MModel;