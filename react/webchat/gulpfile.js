var gulp = require('gulp');
var webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var spritesmith = require('gulp.spritesmith');
var path = require("path");
var clean = require('gulp-clean');
var copy = require('gulp-copy');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var urlAdjuster = require('gulp-css-url-adjuster');
var fs = require('fs');
var md5 = require('MD5');

gulp.task('sprite', function() {
    var spriteData = gulp
        .src('assets/sprite/icons/img/*.png')
        .pipe(spritesmith({
            imgName: 'icons.png',
            imgPath: '../images/icons.png',
            cssName: 'icons.less',
            cssTemplate: 'assets/sprite/icons/less.mustache',
            cssHandlebarsHelpers: {
                rem: function (num) {
                    return num+'/@rem';
                },
                // 解决宽度不足先这样干，后面再来想办法
                sizeHalf: function (num) {
                    num = Math.floor(num/2);

                    return num+'px';
                }
            },
            padding: 8
        }));
    spriteData.css.pipe(gulp.dest('assets/sprite/icons/'));
    spriteData.img.pipe(gulp.dest('assets/images/'));
    return spriteData;
});

// webpack
gulp.task('webpack', function() {
    var compiler = webpack({
        context: path.join(__dirname, 'app'),
        entry: {
            'pages/index': './pages/index.js',
            'pages/login': './pages/login.js',
            'pages/forget': './pages/forget.js',
            'pages/register': './pages/register.js',
            'pages/usercenter': './pages/usercenter.js',
            'pages/map': './pages/map.js',
            'pages/city': './pages/city.js',
            'pages/category': './pages/category.js',
            'pages/course_search': './pages/course_search.js',
            'pages/course_detail': './pages/course_detail.js',
            'pages/school_search': './pages/school_search.js',
            'pages/school_detail': './pages/school_detail.js',
            'pages/school_allcourse': './pages/school_allcourse.js',
            'pages/news_detail': './pages/news_detail.js',
            'pages/news_list_hot': './pages/news_list_hot.js',
            'pages/usercenter_info': './pages/usercenter_info.js',
            'pages/usercenter': './pages/usercenter.js',
            'pages/usercenter_favorite_course': './pages/usercenter_favorite_course.js',
            'pages/usercenter_favorite_school': './pages/usercenter_favorite_school.js',
            'pages/usercenter_signup_course': './pages/usercenter_signup_course.js',
            'pages/usercenter_modifypassword': './pages/usercenter_modifypassword.js',
            'pages/usercenter_reset_name': './pages/usercenter_reset_name.js',
            'pages/usercenter_resetphone': './pages/usercenter_resetphone.js',
            'pages/usercenter_resetphone_step1': './pages/usercenter_resetphone_step1.js',
            'pages/usercenter_resetphone_step2': './pages/usercenter_resetphone_step2.js',
            'pages/usercenter_myloan': './pages/usercenter_myloan.js',
            'pages/usercenter_myloan_detail': './pages/usercenter_myloan_detail.js',
            'pages/about': './pages/about.js',
            'pages/feedback': './pages/feedback.js',
            'pages/usercenter_signup_audition': './pages/usercenter_signup_audition.js',
            'pages/search_interface': './pages/search_interface.js',
            'pages/briefing': './pages/briefing.js'
        },
        output: {
            path: path.join(__dirname, '/dist/static/mh5/js'),
            filename: '[name].js'
        },
        module: {
            loaders: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['react', 'es2015']
                    }
                },
                {
                    test: path.join(__dirname, '/node_modules/zepto/zepto.min.js'),
                    loader: 'exports?window.Zepto'
                }
            ]
        },
        resolve: {
            alias: {
                jquery: 'zepto',
                zepto: path.join(__dirname, '/app/vendors/zepto.js'),
                backbone: path.join(__dirname, '/app/vendors/backbone.js')
            }
        },
        plugins: [
            new CommonsChunkPlugin("app.js")
        ]
    });

    compiler.run((err, stats) => {
        console.log(stats.toString());
    });

   compiler.watch({}, (err, stats) => {
       console.log(stats.toString());
   });
});

// copy目录
gulp.task('copy', ['clean'], function () {
    return gulp
    .src('./**', {cwd: 'dist/static'})
    .pipe(copy('dist/static_min/'));
});

// 压缩css
gulp.task('cssmin', ['cssUrlRewrite'], function () {
    return gulp
    .src('dist/static_min/**/*.css')
    .pipe(cssmin({s0: true}))
    .pipe(gulp.dest('dist/static_min'));
});

// css url rewrite
gulp.task('cssUrlRewrite', ['copy'], function () {
    return gulp
    .src('dist/static_min/mh5/css/*.css')
    .pipe(urlAdjuster({
        replace:  function (url) {
            if(url.indexOf('data:') == 0) { //base64不处理
                return url;
            } else {
                var p = url.replace('../', 'dist/static_min/mh5/');
                var absPath = path.resolve(p);
                var buf = fs.readFileSync(absPath);
                var hash = md5(buf);
                var info = path.parse(url);
                return info.dir + '/' + info.name + '_' + hash.substr(-6) + info.ext;
            }
        },
    }))
    .pipe(gulp.dest('dist/static_min/mh5/css'));
});

gulp.task('uglify', ['copy'], function() {
    return gulp.src('dist/static_min/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/static_min'));
});

// 清空压缩目录
gulp.task('clean', function () {
    return gulp
    .src('dist/static_min', {read: false})
    .pipe(clean());
});

gulp.task('release', ['clean', 'copy', 'cssUrlRewrite', 'cssmin', 'uglify']);

