var express = require('express');
var crypto = require('crypto');
var async = require('async');

var userModel = require('../models/UserInfo');
var auth = require('../common/authentication');

var router = express.Router();

router.post('/regist', function(req, res, next) {

    var userName = req.body.userName,
        pwd = req.body.pwd,
        telephone = req.body.telephone,
        email = req.body.email;

    userModel.addUser(userName, pwd, email, telephone, function(user) {
        var actionResult = {};
        if (user) {
            actionResult.success = true;
        } else {
            actionResult.success = false;
        }
        console.log(actionResult);
        res.redirect('login');
    });
});

module.exports = router;