var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var config = require('./config.js');
var debug = require('debug');
var debugHttp = debug('http');
var path = require('path');
var app = express();
var log = require('./components/log.js');
var fs = require('fs');
if(!config.debug) {
// 防止全局异常错误
process.on("uncaughtException", function(e) {
    e || (e = {});
    log.error('[crash][msg] %s', e.message || '');
    log.error('[crash][stack] %s', (e.stack||'').replace(/\n/g, ''));

    if(app.close) {
        try {
            app.close();
        } catch(e) {}
    }
    process.exit(-1);
});
process.on('message', function(msg) {
    if (msg === 'shutdown') {
        if(app.close) {
            try {
                app.close();
            } catch(e) {}
        }
        process.exit(0);
    }
});
}

require('babel-register')({
    presets: ['react'],
    extensions: ['.jsx']
});
debug('general')(config);
// set ejs view render engine
app.set('views', __dirname + '/layouts');
app.engine('html', require('ejs').renderFile);

app.use(favicon(__dirname + '/favicon.ico'));
// set static in debug env.
app.use('/static', express.static(__dirname + '/../dist/static'));

if(config.debug) {
    app.use('/robots.txt', function(req, res) {
        res.end('User-agent: * \r\nDisallow: /');
    });

    app.use(function (req, res, next) {
        console.log('[request url]:'+req.url);
        var startTime = new Date();

        var calResponseTime = function () {
            var endTime = new Date(); //获取时间 t2
            var deltaTime = endTime - startTime;
            console.log('time dot:'+deltaTime);
        }

        // res.once('fetched', calResponseTime);
        res.once('finish', calResponseTime);
        res.once('close', calResponseTime);
        return next();
    });
} else {
    app.use('/robots.txt', function(req, res) {
        res.end('User-agent: * \r\nDisallow: /*?*');
    });
}
app.use(function(req, res, next) {
    res.page404 = function() {
        res.status(404);
        res.render('../pages/404.ejs', {});
        res.flush();
        res.end();
    };

    next();
});
app.use(function(req, res, next) {
    debug('GET '+req.path);
    next();
});
app.use(bodyParser.json());
app.use(require('compression')());
app.use(require('./middleware/cookieParse.js'));
app.use(require('./middleware/router.js').router);
app.use(require('./middleware/city.js'));
app.use(require('./middleware/renderData.js'));
app.use(require('./middleware/render.js'));

// default show 404 page
app.use('*', function(req, res) {
    res.page404();
});
app.listen(80);
/*if(config.debug) {
    app.listen(80);
} else {
    var sock = path.join(__dirname, '../../m.kezhanwang.cn.sock');
    app.listen(sock, function() {
        fs.chmodSync(sock, '777');
    });
}
*/