/**
 * 微信js sdk包装
 * @event
 *  
 */
var app = require('./base.js');

var wxFn = {
    share: function(shareInfo) {
        // 分享到朋友圈
        wx.onMenuShareTimeline({
            title: shareInfo.title, // 分享标题
            link: shareInfo.link, // 分享链接
            imgUrl: shareInfo.imgUrl, // 分享图标
            success: function () {
                // app.eventBus.emit('wx.share.success', {
                //     type: 'timeline'
                // });
            },
            cancel: function () {
                // app.eventBus.emit('wx.share.cancel', {
                //     type: 'timeline'
                // });
            }
        });
        // 分享给朋友
        wx.onMenuShareAppMessage({
            title: shareInfo.title, // 分享标题
            desc: shareInfo.desc, // 分享描述
            link: shareInfo.link, // 分享链接
            imgUrl: shareInfo.imgUrl, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () { 
                // app.eventBus.emit('wx.share.success', {
                //     type: 'friends'
                // });
            },
            cancel: function () { 
                // app.eventBus.emit('wx.share.cancel', {
                //     type: 'friends'
                // });
            }
        });
        // 分享到QQ
        wx.onMenuShareQQ({
            title: shareInfo.title, // 分享标题
            desc: shareInfo.desc, // 分享描述
            link: shareInfo.link, // 分享链接
            imgUrl: shareInfo.imgUrl, // 分享图标
            success: function () { 
                // app.eventBus.emit('wx.share.success', {
                //     type: 'qq'
                // });
            },
            cancel: function () { 
                // app.eventBus.emit('wx.share.cancel', {
                //     type: 'qq'
                // });
            }
        });
        // 分享到腾讯微博
        wx.onMenuShareWeibo({
            title: shareInfo.title, // 分享标题
            desc: shareInfo.desc, // 分享描述
            link: shareInfo.link, // 分享链接
            imgUrl: shareInfo.imgUrl, // 分享图标
            success: function () { 
                // app.eventBus.emit('wx.share.success', {
                //     type: 'twb'
                // });
            },
            cancel: function () { 
                // app.eventBus.emit('wx.share.cancel', {
                //     type: 'twb'
                // });
            }
        });
        // 分享到QQ空间
        wx.onMenuShareQZone({
            title: shareInfo.title, // 分享标题
            desc: shareInfo.desc, // 分享描述
            link: shareInfo.link, // 分享链接
            imgUrl: shareInfo.imgUrl, // 分享图标
            success: function () { 
                // app.eventBus.emit('wx.share.success', {
                //     type: 'qzone'
                // });
            },
            cancel: function () { 
                // app.eventBus.emit('wx.share.cancel', {
                //     type: 'qzone'
                // });
            }
        });
    },
    previewImage: function() {
        return wx.previewImage.apply(wx, arguments);
    },
    instance: window.wx
};

function setup(jsTicket) {
    var def = $.Deferred();

    app.getScript('http://res.wx.qq.com/open/js/jweixin-1.0.0.js').then(function() {
        if(!window.wx) {
            return def.reject();
        }

        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: jsTicket.appid, // 必填，公众号的唯一标识
            timestamp: jsTicket.timestamp, // 必填，生成签名的时间戳
            nonceStr: jsTicket.noncestr, // 必填，生成签名的随机串
            signature: jsTicket.signature,// 必填，签名，见附录1
            jsApiList: [
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone',
                'previewImage'
            ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        wx.ready(function() {
            def.resolve(wxFn);
        });

        wx.error(function(res) {
            def.reject(res);
        });
    });

    return def.promise();
}


module.exports = setup;