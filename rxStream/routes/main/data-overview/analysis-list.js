var express = require('express');
var router = express.Router();
var routeUrl = '/main/data-overview/analysis-list';

router.get(routeUrl + '/:id', function(req, res, next) {
    var id = req.params.id;
    var data = {};
    if (id != 'new' /* && !isNaN(id)*/ ) {
        data.id = id;
    } else {
        data.id = "";
    }
    data.formData = "";
    res.render(routeUrl.substring(1), data);
});

router.post(routeUrl + '/:id', function(req, res, next) {
    var id = req.params.id;
    var data = {};
    if (id != 'new' /* && !isNaN(id)*/ ) {
        data.id = id;
    } else {
        data.id = "";
    }
    if (req.body && req.body.postData) {
        data.formData = req.body.postData; // JSON.stringify();
    }
    res.render(routeUrl.substring(1), data);
});


module.exports = router;