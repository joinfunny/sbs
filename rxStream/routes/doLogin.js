var express = require('express');
var crypto = require('crypto');
var async = require('async');
var UserModel = require('../models/UserInfo');
var auth = require('../common/authentication');
var router = express.Router();

var MSG = {
    USERNAME_REQIRED: '用户名不能为空\r\n',
    PWD_REQIRED: '密码不能为空\r\n',
    QUERY_FAILD: '查询失败\r\n',
    USER_NOTEXISTS: '用户名不存在\r\n',
    CAPTCHA_DIFF: '验证码输入有误！\r\n'
};

function fail(res, data) {
    res.redirect('login', {
        data: data
    });
}

router.post('/doLogin', function(req, res, next) {
    var val = req.body;
    val.name = val.userName.trim();
    var fr = val.fr || '/admin';
    delete val.fr;
    if (!val.userName || !val.password) {
        var data = '';
        if (!val.userName) data = MSG.USERNAME_REQIRED;
        if (!val.password) data = MSG.PWD_REQIRED;
        fail(res, data);
        return;
    }
    //验证校验码
    /*if(req.session.captcha!=val.code){
        console.log(MSG.CAPTCHA_DIFF);
        res.redirect('login?'+Date.now());
        return ;
    }*/

    UserModel.validUserInfo(val.name, val.password, function(error, record) {
        if (error) {
            var data = MSG.QUERY_FAILD;
            fail(res, {
                data: data
            });
        } else {
            if (record === null) {
                fail(res, MSG.USER_NOTEXISTS);
                return;
            }
            console.log(record);
            var hash = record.Password;
            delete record.Password;

            var lastTime = record.LastTime;
            req.session.account = {
                uid: record.UniqueID,
                account: record.UserName,
                hash: hash
            };

            auth.updateLastLoginTime(record.UserName, function(error, status) {
                if (!error) {
                    res.redirect('index');
                } else {
                    fail(res, error);
                }
            });
        }
    });
});

module.exports = router;