var express = require('express');
var router = express.Router();

router.get('/introduce', function(req, res, next) {
    res.render('introduce/index', {});
});
router.get('/introduce/index', function(req, res, next) {
    res.render('introduce/index', {});
});

module.exports = router;