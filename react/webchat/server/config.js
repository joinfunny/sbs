var env = (process.env.NODE_ENV || 'production').toLowerCase();
var isDebugModel =true;// env === 'development' ? true : false;
var path = require('path');
/**
页面配置示意
{  
    // 前后端同步路由
    routes: [], 
    // 默认页面只有加载style.css，这里定义前后端需要额外加载的样式
    stylesheet: '', 
    // 标识页面逻辑不需要请求同步数据，部分页面只需要页面逻辑没必要再请求数据渲染
    data: false,
    // 标识页面需要登录态，没有登录态302跳转到登陆页
    login: true
}
 */
module.exports = {
    debug: isDebugModel,
    domain: isDebugModel ? 'http://api1.kezhanwang.cn' : require('./config-domain'),
    javaDomain: isDebugModel ?  'http://123.56.27.14' : require('./config-java'),
    logPath: path.join(__dirname, 'log'),
    /**
     * 优先级从上到下，分别由弱到强
     */
    Controllers: {
        // 首页
        index: {
            routes: [
                '/',
                '/:city'
            ]
        },
        // 搜索页面
        search_interface: {
            routes: [
                '/search'
            ]
        },
        // 课程列表
        course_search: {
            routes: [
                '/course', 
                '/course/search',
                '/course/:categid',
                '/:city/course',
                '/:city/course/:categid'
            ]
        },
        // 课程详情
        course_detail: {
            routes: [
                '/course/detail',
                '/course/detail-:id.html',
                '/:city/course/detail-:id.html'
            ]
        },
        // 简介
        briefing: {
            routes: [
                '/briefing/:type/:id.html'
            ],
            stylesheet: 'news.css'
        },
        // 学校列表
        school_search: {
            routes: [
                '/baseschool',
                '/baseschool/search',
                '/baseschool/:cateid',
                '/:city/baseschool',
                '/:city/baseschool/:cateid'
            ]
        },
        // 学校详情
        school_detail: {
            routes: [
                '/baseschool/detail-:id.html',
                '/:city/baseschool/detail-:id.html'
            ]
        },
        // 学校所有课程
        school_allcourse: {
            routes: [
                '/school/:sid.html',
                '/:city/school/:sid.html'
            ]
        },
        // 热门资讯列表
        news_list_hot: {
            routes: ['/news'],
            stylesheet: 'news.css'
        },
        // 资讯详情
        news_detail: {
            routes: [
                '/news/:id.html',
                '/news/:category/:id.html'
            ],
            stylesheet: 'news.css'
        },
        // 用户中心
        usercenter: {
            routes: ['/usercenter'],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 用户信息编辑
        usercenter_info: {
            routes: ['/usercenter/info'],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 我的收藏课程
        usercenter_favorite_course: {
            routes: [
                '/usercenter/favorite/course',
                '/usercenter/favorite'
                ],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 我的收藏机构
        usercenter_favorite_school: {
            routes: [
                '/usercenter/favorite/school'
                ],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 我的报名课程
        usercenter_signup_course: {
            routes: [
                '/usercenter/signup/course',
                '/usercenter/signup'
                ],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 我的分期
        usercenter_myloan: {
            routes: [
                '/usercenter/myloan'
                ],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 我的分期详情
       /* usercenter_myloan_detail: {
            routes: [
                '/usercenter/myloan/detail'
                ],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },*/
        // 我的分期详情
        usercenter_myloan_detail: {
            routes: [
                '/usercenter/myloan/detail',
                '/usercenter/myloan/detail-:lid.html',
                '/:city/usercenter/myloan/detail-:lid.html'
            ],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 我的报名试听
        usercenter_signup_audition: {
            routes: [
                '/usercenter/signup/audition'
                ],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 修改密码
        usercenter_modifypassword: {
            routes: ['/usercenter/modifypassword'],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 修改昵称
        usercenter_reset_name: {
            routes: ['/usercenter/resetname'],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 绑定手机号
        usercenter_resetphone: {
            routes: ['/usercenter/resetphone'],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 修改手机号第一步
        usercenter_resetphone_step1: {
            routes: ['/usercenter/resetphone/step1'],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 修改手机号第二步
        usercenter_resetphone_step2: {
            routes: ['/usercenter/resetphone/step2'],
            stylesheet: 'usercenter.css',
            login: true,
            data: false
        },
        // 登陆
        login: {
            routes: ['/login'],
            stylesheet: 'usercenter.css',
            data: false
        },
        // 注册
        register: {
            routes: ['/register'],
            stylesheet: 'usercenter.css',
            data: false
        },
        // 找回密码
        forget: {
            routes: ['/forget'],
            stylesheet: 'usercenter.css',
            data: false
        },
        // 地图
        map: {
            routes: [
                '/:city/map/:id.html',
                '/map/:id.html'
            ]
        },
        // 城市选择
        city: {
            routes: ['/city']
        },
        // 一级&二级分类
        category: {
            routes: ['/category']
        },
        //关于我们
        about: {
            routes: ['/about'],
            stylesheet: 'usercenter.css'
        },
        //注册协议
        reg: {
            routes: ['/reg'],
            stylesheet: 'reg.css'
        },
        // 意见反馈
        feedback: {
            routes: ['/feedback'],
            stylesheet: 'usercenter.css'
        }
    }
};
