var express = require('express');
var captchapng = require('captchapng');
var router = express.Router();

router.get('/captcha', function(req, res, next) {
    var captcha = parseInt(Math.random() * 9000 + 1000);
    req.session.captcha = captcha;
    var p = new captchapng(100, 30, captcha); // 宽、高、验证码
    p.color(0, 0, 0, 0); // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(imgbase64);
});
module.exports = router;