'use strict';

var path = require('path');
var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
    //插件项
    //plugins: [commonsPlugin],

    //页面入口文件配置
    entry: [
        // 写在入口文件之前
        "webpack-dev-server/client?http://0.0.0.0:3000",
        "webpack/hot/only-dev-server",
        path.resolve(__dirname + '/public/src/js/entrys/index.js')
    ],
    //入口文件输出配置
    output: {
        //打包文件存放的绝对路径
        path: path.resolve(__dirname, 'public/dist'),
        //网站运行时的访问路径
        publicPath: '/',
        //打包后的文件名
        filename: "./js/entrys/index.js"
    },
    module: {
        //加载器配置
        loaders: [{
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'react-hot!babel-loader?cacheDirectory'
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
        'react-dom': 'ReactDOM',
        'react-router': 'ReactRouter'
    },
    //其它解决方案配置
    resolve: {
        alias: {
            js: __dirname + "/public/src/js",
            lib: __dirname + "/public/src/js/lib/lib.js"
        }
    }
};