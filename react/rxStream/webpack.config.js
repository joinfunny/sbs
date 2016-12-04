'use strict';

var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var srcDir = './public/src';
function getEntry() {
    var jsPath = path.resolve(srcDir, 'js/entrys');
    var dirs = fs.readdirSync(jsPath);
    var matchs = [], files = {};
    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);
        if (matchs) {
            files[matchs[1]] =[
                "webpack-dev-server/client?http://127.0.0.1:3000",
                "webpack/hot/only-dev-server",
                path.resolve(srcDir, 'js/entrys', item)
            ] ;
        }
    });
    /*files['hotServer']= [
                "webpack-dev-server/client?http://127.0.0.1:3000",
                "webpack/hot/only-dev-server"];*/
    return files;
}

console.log(getEntry());

var commonsPlugin = new webpack
    .optimize
    .CommonsChunkPlugin('common.js');

module.exports = {
    //插件项 plugins: [commonsPlugin], 页面入口文件配置
    entry: getEntry(),
    //入口文件输出配置
    output: {
        //打包文件存放的绝对路径
        path: __dirname + '/public/dist/',
        //打包后的文件名
        filename: "[name].bundle.js",
        //publicPath:'/js/'
    },
    devServer:{
        inline:true
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