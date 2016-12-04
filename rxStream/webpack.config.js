/**
 * Created by 刘晓帆 on 2016-4-11.
 * webpack配置文件
 */
'use strict';
var webpack = require('webpack');

var path = require('path');
var fs = require('fs');
var node_modules = path.resolve(__dirname, 'node_modules');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var srcDir = 'src';

function getEntry() {
    var jsPath = path.resolve(srcDir, 'js/entry');
    var dirs = fs.readdirSync(jsPath);
    var matchs = [], files = {};
    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);
        if (matchs) {
            files[matchs[1]] = path.resolve(srcDir, 'js/entry', item);
        }
    });
    files['hotserver'] = 'webpack/hot/dev-server';
    return files;
}


module.exports = {
    cache: true,
    //devtool: "eval-source-map",//启用sourceMap
    entry: getEntry(),
    //单页面入口
    //entry: [
    //    'webpack/hot/only-dev-server',
    //    path.resolve(__dirname, 'src/js/entry/index.js')
    //],
    output: {
        path: path.resolve(__dirname, 'dist'),
        //publicPath: '/mkt', //测试服务器地址
        publicPath: '/',//本地开发地址
        //filename: 'index.js',
        filename: "./js/[name].js"
    },
    module: {
        loaders: [
            //{ test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,  loader: "url"},
            //{ test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/, loader: 'file'},
            {test: /\.html$/, loader: 'html-loader', exclude: /node_modules/},
            //{test: /\.js?$/, loaders: ['babel'], exclude: /node_modules/},
            {test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/},
            //{test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /\.jsx$/, exclude: /node_modules/, loader: 'babel-loader'},
            //{test: /\.css$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
            //{test: /\.scss$/, exclude: /node_modules/, loaders: ["style?sourceMap", "css?sourceMap", "sass?sourceMap"]},
            //{test: /\.(png|jpg|gif)$/, exclude: /node_modules/, loader: 'url?limit=25000&name=img/[name].[ext]'}
        ]
    },
    resolve: {
        alias: {

            js: __dirname + "/src/js",
            lib: __dirname + "/src/js/libs/lib.js",
            app: __dirname + "/src/js/app.js",
            util: __dirname + "/src/js/util",
            module: __dirname + "/src/module",
            html: __dirname + "/src/html",
            plugins: __dirname + "/src/js/plugins",
            component: __dirname + "/src/js/component"
        }
    },
    plugins: [
        //new webpack.HotModuleReplacementPlugin(),
        //new TransferWebpackPlugin([{from: 'html', to: 'html'}], path.join(__dirname, "src")),
        new webpack.NoErrorsPlugin(),
        new webpack.ProvidePlugin({
            //jQuery: "jquery",
            //$: "jquery",
            //_: "_",
            //Backbone: "Backbone",
            util: "util"
        }),
        //new ExtractTextPlugin("styles.css"),
        //new webpack.optimize.CommonsChunkPlugin('js/commons.js', getEntry()),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            minChunks: 3
        }),
        new webpack.BannerPlugin(new Date().toLocaleDateString() + ' author:liuxiaofan')

    ]
};
