var express = require('express');
var router = express.Router();

router.get('/login', function(req, res, next) {
    req.session[config.session.__LOGIN_TIME__] = Date.now();
    req.session[config.session.__LOGIN_COUNT__] = 0;
    res.render('login', {});
});

module.exports = router;