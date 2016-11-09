'use strict';

var MModel = require('../components/mmodel.js');

class JSTicket extends MModel {
    get(url) {
        return this.fetch('/m/wechat/js', {
            url: url
        }).then((data) => {
            return data.data;
        });
    }
}

module.exports = JSTicket;