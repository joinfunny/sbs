'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/news_detail.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');

class NewsDetailController extends MController {
    getQuery() {
        return super.getQuery().then(function(params) {
            params.json = 1;
            return params;
        });
    }

    getData() {
        var view = this;
        var params = this.params;
        var promise = Promise.all([
            this.fetch(':8478/services/news/info/'+params.id, {isJava: true}),   
            this.fetch(':8478/services/news/info/'+params.id+'/content', {isJava: true}),
            this.fetch(':8478/services/news/list/othernews/'+params.id, {isJava: true}),       
        ]).then(function(resultData) {
            var result = resultData[0];
            result.content = decodeURIComponent(resultData[1]);
            result.tagNames = result.keyword.split(',');
            result.updatetime = new Date(parseInt(result.updatetime)).toLocaleString();
            var data = {
                result: result,
                articleRelate: resultData[2]
            }
            return data
        })
        return promise
    }

    // getSEO(data) {
    //     var description = data.content;
    //     try {
    //         description = description.replace(/<[^>]+>/g,"");
    //         description = description.replace(/&.*?;/g, "");
    //         description = description.trim();
    //     } catch(e) {}
    //     return {
    //         title : data.title+' - 课栈网',
    //         keywords : data.title,
    //         description : description.substr(0, 80)
    //     }
    // }

    render(data) {
        this.component = React.createElement(Page, {
            data: data, 
            userAgent: this.req.headers['user-agent']
        });

        return ReactDom.renderToString(this.component);
    }
}

module.exports = NewsDetailController;