'use strict';

var path = require('path');
var webpack = require('webpack');
var commonsPlugin = new webpack
    .optimize
    .CommonsChunkPlugin('common.js');

module.exports = {
    //插件项 plugins: [commonsPlugin], 页面入口文件配置
    entry: [
        // 写在入口文件之前
        "webpack-dev-server/client?http://127.0.0.1:3000",
        "webpack/hot/only-dev-server",
        './public/src/js/entrys/index.js'
    ],
    //入口文件输出配置
    output: {
        //打包文件存放的绝对路径
        path: __dirname + '/public/dist/',
        //打包后的文件名
        filename: "stream.bundle.js",
        //publicPath:'/js/'
    },
    module: {
        //加载器配置
        loaders: [
            {
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
            }
        ]
    },
    /*externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'react-router': 'ReactRouter'd
    },*/
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ]
};