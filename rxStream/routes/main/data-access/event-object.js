var express = require('express');
var router = express.Router();
var routeUrl = '/main/data-access/event-object';


router.get(routeUrl, function(req, res, next) {
    res.render(routeUrl.substring(1), {});
});


module.exports = router;