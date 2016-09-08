var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.redirect('introduce');
    return;
});
router.get('/index', function(req, res, next) {
    var userName = req.session[config.session.__USER_NAME__];
    if (userName) {
        res.render('index', {
            'title': 'rxStream',
            'userName': userName,
            'sdkUrl': config.sdkUrl,
            'sdkServerUrl': config.sdkServerUrl
        });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;