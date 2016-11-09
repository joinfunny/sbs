var Backbone = require('backbone');
var Cache = require('./cache.js');
var app = require('./base.js');
try {
    document.domain = 'kezhanwang.cn';
} catch(e) {}


function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
}

// serialize payload and append it to the URL for GET requests
function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
}

Backbone.ajax = function(option) {
    var def = $.Deferred();
    var promise = def.promise();
    var oldSuccess = option.success;
    var oldError = option.error;
    var codeArr = {
            '-1':'系统繁忙/系统错误',
            '10000':'没有数据',
            '10001':'未登录',
            '10002':'需要关注(微信站)',
            '10003':'登录Token验证失败',
            '40000':'未知错误',
            '40001':'非法请求',
            '40002':'参数错误',
            '40003':'非法字符',
            '40004':'图片验证码错误',
            '40005':'短信验证码错误',
            '40006':'状态错误',
            '40007':'没有权限',
            '40101':'手机号码为空',
            '40102':'用户或密码为空',
            '40103':'客户姓名为空',
            '40200':'输入格式不符合要求(通用)',
            '40201':'不是数字类型',
            '40202':'手机格式错误',
            '40203':'邮箱格式错误',
            '40204':'用户名不符合要求',
            '40205':'密码不符合要求',
            '40206':'图片校验码不符合要求',
            '40207':'短信验证码不符合要求',
            '40301':'用户不存在',
            '40302':'手机不存在',
            '40303':'邮箱不存在',
            '40311':'用户名已存在',
            '40312':'手机号已存在',
            '40313':'邮箱已存在',
            '40314':'原手机号不存在',
            '40401':'手机号未验证',
            '40402':'邮箱未验证',
            '40601':'密码错误',
            '41001':'密码错误',
            '41002':'用户已经被禁用或锁定',
            '41003':'密码错误超过5次,需要等待半个小时',
            '41004':'微信登录失败',
            '42001':'请输入由中英文、数字或下划线组成的2-20位的用户名',
            '44001':'需要GET请求',
            '44002':'需要POST请求',
            '44003':'需要HTTPS请求',
            '44004':'不合法的URL',
            '50001':'未提交审核',
            '50002':'审核中',
            '50003':'审核未获通过',
            '60001':'课程编号为空',
            '60002':'SKU编号为空',
            '60003':'评论分数为空',
            '60004':'评论内容为空',
            '60005':'用户编号为空',
            '60006':'用户名称为空',
            '60007':'已赞过',
            '60008':'已踩过',
            '60101':'回复内容为空',
            '60102':'评论编号为空',
            '60105':'用户编号为空',
            '60106':'用户名称为空',
            '60201':'用户编号为空',
            '60202':'机构编号为空',
            '60203':'机构已关注过',
            '60204':'课程编号为空',
            '60205':'课程已关注过',
            '60301':'课程名称为空',
            '60302':'一级分类为空',
            '60303':'二级分类为空',
            '60304':'三级分类为空',
            '60305':'机构编号为空',
            '60306':'课程类型错误',
            '60307':'机构不存在',
            '60401':'机构名称为空',
            '60402':'机构类型错误',
            '60403':'结算标识错误',
            '60404':'订单是否需要确认错误',
            '60405':'机构状态错误',
            '60501':'是否实名认证错误',
            '60502':'是否优质伙伴错误',
            '60503':'是否营业执照错误',
            '60504':'是否办学资质错误',
            '60505':'是否跟踪服务错误',
            '60506':'是否试听错误',
            '60507':'是否贷款错误',
            '60508':'机构全称错误',
            '60509':'机构全称已经存在',
            '60601':'课程ID串错误',
            '60602':'状态错误',
            '60603':'用户或token错误',
            '60701':'机构ID串错误',
            '60702':'状态错误',
            '60703':'用户或token错误',
            '70101':'无效的课程',
            '70102':'课程已下架',
            '70103':'商品缺货',
            '70201':'无效的订单原始数据',
            '70213':'发票抬头为空',
            '70214':'没有选择发票内容',
            '70215':'没有执行机构',
            '70216':'缺少必选的原因',
            '70230':'机构前后不一致',
            '70231':'操作者与责任者不一致',
            '70301':'没有改变',
            '70302':'已经支付',
            '70303':'未支付',
            '70401':'没有支付方式参数',
            '70402':'没有支付通道参数',
            '70403':'没有流水号参数',
            '70404':'支付金额为零',
            '70405':'支付金额与应付金额不等',
            '70406':'支付金额大于应付金额',
            '70411':'不需要拆单',
            '70412':'不完全收款，上课操作终止',
            '70413':'收款失败，上课操作终止',
            '72002':'客户所在区域为空',
            '72003':'意向内容为空',
            '72004':'意向强度为空',
            '72011':'机构前后不一致',
            '72012':'操作者与责任者不一致',
            '72021':'没有改变',
            '72401':'没有指定客服',
            '72402':'参数不全',
            '72403':'没有指定客服',
            '72501':'参数不全',
            '72502':'没有指定客服',
            '72801':'参数不全',
            '72802':'必须有退回原因',
            '73002':'试听类型没有指定',
            '73003':'随堂试听必须指定课程',
            '73004':'专场试听必须指定专场',
            '73011':'机构前后不一致',
            '73012':'操作者与责任者不一致',
            '73021':'没有改变',
            '73031':'存在处理中的试听报名',
            '73401':'没有指定客服',
            '73402':'参数不全',
            '73403':'没有指定客服',
            '73601':'没有指定试听时间',
            '73901':'没有指定失败原因'
        };
    option.dataType = option.dataType || 'json';

    if(!option.data) {
        option.data = {};
    }

    if(option.isJava){
        option.data = JSON.stringify(option.data)
    }

    if(option.api) {
        if(option.isJava){
            option.url = kz_m.java+option.url;
            if(option.type == 'post'){
                option.beforeSend = function(xhrObj){
                    xhrObj.setRequestHeader("Content-Type", "application/json;chatset=utf-8");
                };
            }
        }else{
            option.url = kz_m.api+option.url;
            option.data.dev = 1;
        }
        option.cache = false;
    }

    option.timeout = option.timeout || 10000;

    if(option.local_cache) {
        var cacheUrl = option.url;
        var cacheInstance = Cache.singletonAjax();
        var data = cacheInstance.get(cacheUrl);

        if(data) {
            def.resolve(data);
            return promise;
        }
    }
    if(!option.isJava){
        option.xhrFields = {
            withCredentials: true
        }
    }
    // if(option.isJava){
    //     option.data = JSON.stringify(option.data)
    // }

    option.success = option.error = function() {};
    var ajaxReturn = Backbone.$.ajax.apply(Backbone.$, arguments);

    promise.abort = function() {
        return ajaxReturn.abort.apply(ajaxReturn, arguments);
    };

    def.then(function() {
        oldSuccess && oldSuccess.apply(null, arguments);
    }, function() {
        oldError && oldError.apply(null, arguments);
    });

    var reject = def.reject;
    def.reject = function(info, type) {
        ajaxReturn.type = 'type';
        var hasErrorTips = true;
        if (def.state() !== 'rejected') {
            def.fail(function(xhr, data) {
                data = data || {};
                if(hasErrorTips && type != 'abort') {
                    if(!data.msg) {
                        var msg = codeArr[data.code];
                    }else {
                        var msg = data.msg;
                    }
                    if(!msg) {
                        if(type == 'timeout') {
                            msg = '请求超时，请重试！';
                        } else {
                            msg = '网络出错，请重试！';
                        }
                    }
                    app.tips(msg);
                }
            });
        }

        return reject.call(def, ajaxReturn, info, function(showError) {
            hasErrorTips = showError;
        });
    };

    ajaxReturn.then(function(data) {
        if(option.dataType === 'json') {
            if(data.code == 1 || data.code == 10000) {
                if(option.local_cache) {
                    cacheInstance.set(cacheUrl, data.data);
                }
                def.resolve(data.data);
            } else {
                def.reject(data);
            }
        } else {
            def.resolve(data);
        }
    }, function(data, type) {
        def.reject(data, type);
    });

    return promise;
};