var fs = require('fs');
var serPath = './services';

function getServices(path) {
    var fileList = [],
        folderList = [],
        walk = function(path, fileList, folderList) {
            files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = path + '/' + item,
                    stats = fs.statSync(tmpPath);
                if (stats.isDirectory()) {
                    walk(tmpPath, fileList, folderList);
                    folderList.push(tmpPath);
                } else {
                    fileList.push(tmpPath);
                }
            });
        };

    walk(path, fileList, folderList);
    return fileList;
}

function registor(app) {
    var path = require('path');
    var services = getServices(serPath);
    services.forEach(function(item, index) {
        var route = require('.' + item).router;
        app.use('/', route);
    });
}
module.exports = registor;