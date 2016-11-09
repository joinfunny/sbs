var CityModel = require('../models/city.js');
var cityModel = CityModel.singleton();

cityModel.get();

module.exports = function(req, res, next) {
    var controller = req.controller;
    if(controller) {
        var city = controller.params.city;
        cityModel.get().then(function() {
            if(city) { // 判断城市是否存在
                var areaid = cityModel.findAreaidByCity(city);
                if(!areaid) {
                    return res.page404();
                }
            }
            next();
        });
    } else {
        next();
    }
};