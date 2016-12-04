/**
 * Created by 刘晓帆 on 2016-4-11.

 * gulp配置
 */
'use strict';
//引入插件
var del = require('del');
var shell = require('gulp-shell');
var connect = require('gulp-connect');
var Proxy = require('gulp-connect-proxy');
var livereload = require('gulp-livereload');
var replace = require('gulp-replace');
var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");
var md5 = require("gulp-md5-plus");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js");
var htmlmin = require('gulp-htmlmin');
var gulpSequence = require('gulp-sequence');
var rename = require("gulp-rename");
var sass = require('gulp-sass');
var clean = require('gulp-clean');

var opts = {
    mainVersion: '1.0.0',//主版本号
    allFileSrc: ['**/*.*'],
    srcDir: './src',
    rootPath: '/',
    buildDir: './dist'
};

gulp.task("webpack-dev-server", shell.task(['webpack-dev-server --inline --progress --colors --hot --display-error-details --content-base src/']));
gulp.task("server:dev", function () {
    //开发版80端口
    connect.server({
        root: opts.srcDir,
        port: 80,
        livereload: true,
        middleware: function (connect, opt) {
            opt.route = '/proxy';
            var proxy = new Proxy(opt);
            return [proxy];
        }
    });
    //压缩版8088端口
    connect.server({
        root: opts.buildDir,
        port: 8088,
        livereload: true,
        middleware: function (connect, opt) {
            opt.route = '/proxy';
            var proxy = new Proxy(opt);
            return [proxy];
        }
    });

});

gulp.task("webpack", shell.task(['webpack -p --progress --colors']));
//gulp.task('watch', function () {
//    livereload.listen();
//    gulp.watch(opts.srcDir + '/**/*.html', ['html']);
//});

gulp.task('copy:js', function (cb) {
    gulp.src([
            opts.srcDir + '/js/**/libs/*.js',
            opts.srcDir + '/js/**/plugins/*.js'
        ])
        .pipe(gulp.dest(opts.buildDir + '/js/'))
        .on('finish', cb);
});
gulp.task('copy:img', function (cb) {
    gulp.src([
            opts.srcDir + '/img/**/*.*'
        ])
        .pipe(gulp.dest(opts.buildDir + '/img'))
        .on('finish', cb);
});
gulp.task('copy:ico', function (cb) {
    gulp.src([
            opts.srcDir + '/favicon.ico'
        ])
        .pipe(gulp.dest(opts.buildDir))
        .on('finish', cb);
});
gulp.task('copy:json', function (cb) {
    gulp.src([
            opts.srcDir + '/apidata/**/*.*'
        ])
        .pipe(gulp.dest(opts.buildDir + '/apidata'))
        .on('finish', cb);
});
gulp.task('copy:css', function (cb) {
    gulp.src([
            opts.srcDir + '/css/**/*.css',
            opts.srcDir + '/css/**/*.eot',
            opts.srcDir + '/css/**/*.ttf',
            opts.srcDir + '/css/**/*.woff',
            opts.srcDir + '/css/**/*.woff2',
        ])
        .pipe(gulp.dest(opts.buildDir + '/css'))
        .on('finish', cb);
});
//gulp.task('md51', function (cb) {
//    gulp.src([opts.buildDir + '/js/*.js'])
//        .pipe(md5(1, opts.buildDir + '/**/*.html'))
//        .pipe(gulp.dest(opts.buildDir + '/js'))
//        .on('finish', cb);
//});
gulp.task('md510', function (cb) {
    gulp.src([opts.buildDir + '/js/*.js'])
        .pipe(md5(9, opts.buildDir + '/**/*.html'))
        .pipe(gulp.dest(opts.buildDir + '/js'))
        .on('finish', cb);
});
gulp.task('replace', function () {
    var indexV = gulp.src([opts.srcDir + '/index.html'])
        .pipe(replace('http://localhost:8080/', './'))
        .pipe(gulp.dest(opts.buildDir));
    var htmlV = gulp.src([opts.srcDir + '/html/**/*.html', '!/**/tpl.html'])
        .pipe(replace('http://localhost:8080/', '../../'))
        .pipe(gulp.dest(opts.buildDir + '/html'));
});
gulp.task('html:min', function (cb) {
    gulp.src(opts.buildDir + '/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(opts.buildDir))
        .on('finish', cb);
});
gulp.task("clean", function (cb) {
    gulp.src(opts.buildDir)
        .pipe(clean({read: false}))
        .on('finish', cb);
})
gulp.task('default', ['server:dev', 'webpack-dev-server', 'sassfile', 'watchsass']);
gulp.task('watchsass', function () {
    gulp.watch(opts.srcDir+'/css/**/*.scss', ['sassfile']);
});

gulp.task('sassfile', function () {
    return gulp.src(opts.srcDir+'/css/page/*.scss')
        .pipe(sass().on('error', sass.logError)).pipe(gulp.dest(opts.srcDir+'/css/page/'));
});
gulp.task('htmlfile', function () {
    gulp.src(opts.buildDir + '/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(opts.buildDir))
});
gulp.task('build', gulpSequence(
    'clean',
    'sassfile',
    ['copy:json', 'copy:css', 'copy:img', 'copy:js', 'copy:ico'],
    'webpack',
    'replace',
    //'md51',
    'html:min'
    //'md510',
));




