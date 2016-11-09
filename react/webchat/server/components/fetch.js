var request = require('request');
var config = require('../config.js');
var url = require('url');
var path = require('path');
var debug = require('debug');
var log = require('./log.js');
var _ = require('lodash');

/**
 * 获取后台数据，数据统一处理
 */
var fetch = function (apiUrl, reqHeaders, querySearch, java) {
    if (apiUrl.indexOf('http') != 0) {
        if (java && java.isJava) {
            apiUrl = config.javaDomain + apiUrl;
            if (java.params) {
                var parameter = [];
                _.map(querySearch.SortArray, function (n) {
                    if (n == 'userId') {
                        var userId = reqHeaders
                            .cookie
                            .indexOf("bx_user=") >= 0
                            ? decodeURIComponent(reqHeaders.cookie)
                                .split('bx_user=')[1]
                                .split(';')[0]
                                .split(',')[0]
                            : "0";
                        parameter.push(userId);
                    } else if (n == 'userToken') {
                        var userToken = reqHeaders
                            .cookie
                            .indexOf("bx_user=") >= 0
                            ? decodeURIComponent(reqHeaders.cookie)
                                .split('bx_user=')[1]
                                .split(';')[0]
                                .split(',')[3]
                            : "0";
                        parameter.push(userToken);
                    } else {
                        parameter.push(querySearch[n]);
                    };
                });
                parameter = parameter.join('-');
                apiUrl = apiUrl + '/' + parameter;
                querySearch = {};
            }
        } else {
            apiUrl = config.domain + apiUrl;
        }
    }
    var urlParsed = url.parse(apiUrl);
    var headers = {
        host: urlParsed.host,
        'user-agent': (reqHeaders['user-agent'] || '') + " mNodeServer",
        cookie: reqHeaders['cookie']
    };

    if (!querySearch) {
        querySearch = {};
    }

    if (config.debug) {
        querySearch.dev = 1;
    }
    var promise = new Promise(function (resolve, reject) {
        request
            .get({
                url: apiUrl,
                timeout: 10000,
                headers: headers,
                encoding: 'utf8',
                qs: querySearch,
                gzip: true
            }, function (error, response, body) {
                if (error) {
                    return reject([error]);
                }
                if (response.statusCode == 200) {
                    try {
                        var data = JSON.parse(body);
                        if (data.code == 1 || data.code == 10000) {
                            log.info('[fetch] url: %s, headers: %j, query search: %j', apiUrl, headers, querySearch || {});
                            return resolve({
                                data: data.data,
                                headers: response.headers || {},
                                response: response
                            });
                        } else {
                            log.warn('[fetch][result fail] url: %s, headers: %j, query search: %j, data: %j', apiUrl, headers, querySearch || {}, data || {});
                            var e = new Error('data.code != 0');
                            return reject([e, data]);
                        }
                    } catch (e) {
                        log.warn('[fetch][parse fail] url: %s, headers: %j, query search: %j, data: %s', apiUrl, headers, querySearch || {}, (body || '').replace(/\r|\n/g, ''));
                        reject([e, body]);
                    }
                } else {
                    log.error('[fetch][error] url: %s, headers: %j, query search: %j', apiUrl, headers, querySearch || {});
                    var e = new Error('response status code != 200');
                    reject([e, body]);
                }
            });
    });

    return promise;
};

module.exports = fetch;