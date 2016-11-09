var bone = require('bone');
var less = bone.require('bone-act-less');
var layout = bone.require('bone-act-htmllayout');
var autoprefixer = bone.require('bone-act-autoprefixer');
var include = bone.require('bone-act-include');
var path = require('path');
var dist = bone.dest('dist');
var static = dist.dest('static/mh5');

static.dest('css')
    .src('~/assets/less/**/style.less')
    .dir('./')
    .act(less)
    .act(autoprefixer({
        browsers: ['> 1%'],
    }, {
        filter: {
            ext: '.less'
        }
    }))
    .rename(function(fileName, filePath, fileInfo) {
        return path.basename(fileInfo.dir)+ '.css';
    });

dist.dest('pages')
    .src('~/pages/*.html')
    .act(layout)
    .act(include);

static.dest('images')
    .src('~/assets/images/*');


bone.task('page', {
    cli: require('bone-cli-connect')({
        base: 'dist',
        livereload: true
    })
});

// scp命令
bone.cli(require('kz-devscp')({
    host: '172.100.50.171',
    username: 'root',
    password: 'kz123456!',
    root: '/a/domains',
    pages: 'mh5'
}));

bone.cli(require('bone-cli-build')());

// calc hash
bone.task('hash',  require('kz-task-hash')({
    distPath: '~/dist/static_min',
    versionPath: '~/dist/version.json'
}));


// release
bone.task('release', 'build', {
    exec: 'gulp release',
    desc: '上线代码构建'
}, 'hash', 'deploy');

// 发布static到线上
bone.task('deploy', require('kz-task-deploy')({
    url: 'http://172.100.50.171/deploy',
    headers: {
        host: 'frontend.com',
    }
}));