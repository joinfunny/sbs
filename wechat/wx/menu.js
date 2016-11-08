'use strict';


module.exports = {
    'button': [{
        'name': '语音搜电影',
        'type': 'view',
        'url': 'http://xuhan.ngrok.cc/movie'
    }, {
        'name': '榜单',
        'sub_button': [{
            'name': '北美票房榜',
            'type': 'click',
            'key': 'us_north'
        }, {
            'name': '内地票房榜',
            'type': 'click',
            'key': 'mainland'
        }, {
            'name': '附近影讯',
            'type': 'click',
            'key': 'nearby'
        }, {
            'name': '上传照片',
            'type': 'pic_photo_or_album',
            'key': 'pic_photo_album'
        }]
    }, {
        'name': '小惊喜',
        'sub_button': [{
                'name': '五子棋',
                'type': 'view',
                'url': 'http://www.helloxuhan.cn/AlphaGoDie/index.html'
            }, {
                'name': '提高姿势水平',
                'type': 'view',
                'url': 'https://tusenpo.github.io/FlappyFrog/'
            }, {
                'name': '拖拽相册',
                'type': 'view',
                'url': 'http://www.helloxuhan.cn/drag/demo.html'
            }, {
                'name': '查看经纬度',
                'type': 'location_select',
                'key': 'location_select'
            }]
            // {
            // 	// 'name' : '图片消息',
            // 	// 'type' : 'media_id',
            // 	// 'media_id' : ''
            // },{
            // 	'name' : '跳转图文消息url',
            // 	'type' : 'view_limited',
            // 	'media_id' : '...' 
            // }
    }]
}