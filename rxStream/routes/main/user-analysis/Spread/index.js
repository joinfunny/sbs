var express = require('express');
var router = express.Router();
var routeUrl = '/main/user-analysis/Spread/index';


router.get(routeUrl, function(req, res, next) {
    res.render(routeUrl.substring(1), {});
});


module.exports = router;