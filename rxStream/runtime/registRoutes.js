function registor(app) {
    var path = require('path');
    var requires = [
        '../routes/index',
        '../routes/captcha',
        '../routes/login',
        '../routes/logout',
        '../routes/registUser',
        '../routes/introduce/index',
        '../routes/main/data-overview/analysis-list',
        '../routes/main/data-overview/behavior',
        '../routes/main/data-overview/overview-list',
        '../routes/main/user-analysis/Event/analysis',
        '../routes/main/user-analysis/Event/index',
        '../routes/main/user-analysis/Funnel/analysis',
        '../routes/main/user-analysis/Funnel/index',
        '../routes/main/user-analysis/Retained/analysis',
        '../routes/main/user-analysis/Retained/index',
        '../routes/main/user-analysis/Revisit/analysis',
        '../routes/main/user-analysis/Revisit/index',
        '../routes/main/user-analysis/Spread/analysis',
        '../routes/main/user-analysis/Spread/index',
        '../routes/main/user-analysis/Worth/analysis',
        '../routes/main/user-analysis/Worth/index',
        '../routes/main/data-access/custom-event',
        '../routes/main/data-access/event-object',
        '../routes/error'
    ];

    requires.forEach(function(item, index) {
        var route = require(item);
        app.use('/', route);
    });
}
module.exports = registor;