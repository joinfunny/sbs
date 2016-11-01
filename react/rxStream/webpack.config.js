'use strict';

var path = require('path');
var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
    //插件项
    //plugins: [commonsPlugin],
    //页面入口文件配置
    entry: {
        index: path.resolve(__dirname + '/public/src/js/entrys/index.js')
    },
    //入口文件输出配置
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        publicPath: '/',
        filename: "./js/entrys/[name].js"
    },
    module: {
        //加载器配置
        loaders: [{
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }, {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }, {
                test: /\.scss$/,
                loader: 'style!css!sass?sourceMap'
            }, {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=8192'
            }]
    },
    externals: {
        'react': 'React',
        'react-dom':'ReactDOM',
        'react-router':'ReactRouter'
    },
    //其它解决方案配置
    resolve: {
        alias: {
            js: __dirname + "/public/src/js",
            lib: __dirname + "/public/src/js/lib/lib.js"
        }
    }
};