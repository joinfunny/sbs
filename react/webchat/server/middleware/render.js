'use strict';

var react = require('react');
var config = require('../config.js');
var minify = require('html-minifier').minify;
var router = require('./router.js');
var debug = require('debug');
var FrontEnd = require('../components/frontend.js');
var log = require('../components/log.js');
var pageRoutes = router.pageRoutes;

var defaultRenderOption = function() {
    return {
        page: '', 
        state: '',
        config: config,
        routes: JSON.stringify(pageRoutes, null, config.debug ? 4 : null),
        js: '',
        css: ''
    };
};

class Render {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.isAsync = req.query.json;

        req.renderDataPromise.then((result) => {
            var data = result[0];
            var userData = result[1];
            var jsTicket = result[2];
            this.fetchDataSuccess(data, userData, jsTicket);
        }, (failInfo) => {
            this.fetchDataError(failInfo[0], failInfo[1]);
        }).catch((e) => {
            log.error('[fetch][catch] %s', (e.stack||'').replace(/\n/g, ''));
            this.fetchDataError(e);
        });
    }

    fetchDataSuccess(data, userData, jsTicket) {
        this.bridgeCookie();
        if(this.isAsync) {
            this.res.json({
                code: 1,
                data: data,
                msg: ''
            });
        } else {
            if(this.checkLogin(userData)) {
                this.renderPage(data, userData, jsTicket);
            }
        }
    }

    fetchDataError(e, data) {
        data || (data = {});
        if(this.isAsync) {
            this.res.json({
                code: 500,
                data: data,
                msg: data.msg || '拉取数据失败！',
                e: (e && e.stack) || e
            });
        } else {
            // 500 报错
            this.res.status(500);
            if(config.debug) {
                if(e) {
                    this.res.write(e.stack || e);
                }
                if(data) {
                    this.res.write('\r\n\r\nresult data:\r\n');
                    this.res.write(JSON.stringify(data, '', 4));
                }
            } else {
                this.res.render('../pages/500.ejs', {message: data.msg});
            }
            this.res.end();
        }
    }

    bridgeCookie() {
        var response = this.req.controller.response;
        if(response) {
            var headers = response.headers;

            if(headers && headers['set-cookie']) {
                this.res.setHeader('Set-Cookie', headers['set-cookie']);
            }
        }
    }

    getSEO(data) {
        var result = this.req.controller.getSEO(data);

        return result;
    }

    checkLogin(user) {
        var req = this.req;
        var config = req.controllerConfig;
        var url = req.protocol + '://' + req.get('host') + req.originalUrl;
        var jumpurl = '/login?jumpurl=' + encodeURIComponent(url);

        if(config.login && !user.userid) { // 需要登录态的页面判断下
            // 302跳转到登陆页
            this.res.status(302);
            this.res.set('Location', jumpurl);
            this.res.end();
            return false;
        }

        return true;
    }

    renderPage(data, userData, jsTicket) {
        var req = this.req;
        var res = this.res;
        var controller = req.controller;

        var page = controller.render(data, userData);
        var renderOption = defaultRenderOption();

        renderOption.FrontEnd = FrontEnd;
        renderOption.js = req.controllerName;
        renderOption.page = page;
        renderOption.state = JSON.stringify(data || {}, null, config.debug ? 4 : null);
        renderOption.css = req.controllerConfig.stylesheet;
        renderOption.user = JSON.stringify(userData || {}, null, config.debug ? 4 : null);
        renderOption.seo = this.getSEO(data);
        renderOption.jsTicket = jsTicket;
        renderOption.query = JSON.stringify(controller.params || {}, null, config.debug ? 4 : null);
        // layout
        res.render(controller.layout, renderOption, function(err, html) {
            // use default option to continue render layout when error come to pass.
            if(err) {
                debug('http')('render page error:');
                debug('http')(JSON.stringify(err));
                res.render(controller.layout, defaultRenderOption());
                res.end();
                return;
            }
            if(config.debug) {
                res.end(html);
            } else {
                // minify html in production env.
                res.end(minify(html, {
                    removeAttributeQuotes: true,
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: true
                }));
            }
        });
    }
}

module.exports = function(req, res, next) {
    if(req.renderDataPromise) {
        new Render(req, res);
    } else {
        next();
    }
};