var express = require('express');
var router = express.Router();

router.get('/logOut', function(req, res, next) {
    req.session.account = null;
    res.redirect('login?' + Date.now());
});

module.exports = router;