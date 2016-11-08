'use strict';

var util = require('./libs/util');
var path = require('path');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var wechat_ticket_file = path.join(__dirname, './config/wechat_ticket.txt');
var config = {
    wechat: {
        appID: 'wx7089d2c439445f5d', //wx7089d2c439445f5d
        appSecret: '5a27bb29e30f5f7be47d10ee77921978', //5a27bb29e30f5f7be47d10ee77921978
        token: 'asldfkalsdjfsalf',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data);
        },
        getTicket: function() {
            return util.readFileAsync(wechat_ticket_file);
        },
        saveTicket: function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_ticket_file, data);
        }
    }
}

module.exports = config;