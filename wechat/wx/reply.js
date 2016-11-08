'use strict';
/*回复策略*/
var path = require('path');
var menu = require('./menu');
var config = require('../config');
var Wechat = require('../wechat/wechat');

var fs = require('fs');
var wechatApi = new Wechat(config.wechat); //构建一个新实例
var status = true;
wechatApi.deleteMenu().then(function() {
        return wechatApi.createMenu(menu);
    })
    .then(function(msg) {
        console.log(msg);
    })
    //wechatApi.fetchAccessToken()

exports.reply = function*(next) {
    var message = this.weixin;
    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log('二维码：' + message.EventKey + '' + message.ticket);
            }
            this.body = '^_^萌萌哒^_^ \n' + '欢迎订阅我的测试号，回复“导航”来学会怎么调戏我吧！哈哈 ';
        } else if (message.Event === 'unsubscribe') {
            this.body = 'haha ';
            console.log('无情啊');
        } else if (message.Event === 'LOCATION') {
            this.body = '您的位置是： ' + message.Latitude + '/' + message.Longitude + '精度：' + message.Precision;
        } else if (message.Event === 'CLICK') {
            if (message.EventKey === 'us_north') { //北美票房榜
                var data = yield wechatApi.getMovie('us_box')

                this.body = '北美票房top10： \n' + data.rank[0] + '.' + '  ' + data.title[0] + '  ' + data.box[0] + ' 美元\n' + data.rank[1] + '.' + '  ' + data.title[1] + '  ' + data.box[1] + ' 美元\n' + data.rank[2] + '.' + '  ' + data.title[2] + '  ' + data.box[2] + ' 美元\n' + data.rank[3] + '.' + '  ' + data.title[3] + '  ' + data.box[3] + ' 美元\n' + data.rank[4] + '.' + '  ' + data.title[4] + '  ' + data.box[4] + ' 美元\n' + data.rank[5] + '.' + '  ' + data.title[5] + '  ' + data.box[5] + ' 美元\n' + data.rank[6] + '.' + '  ' + data.title[6] + '  ' + data.box[6] + ' 美元\n' + data.rank[7] + '.' + '  ' + data.title[7] + '  ' + data.box[7] + ' 美元\n' + data.rank[8] + '.' + '  ' + data.title[8] + '  ' + data.box[8] + ' 美元\n' + data.rank[9] + '.' + '  ' + data.title[9] + '  ' + data.box[9] + ' 美元'
            } else if (message.EventKey === 'mainland') { //内地榜
                var data = yield wechatApi.getMovieBox();

                this.body = '内地票房top10： \n' + data.rank[0] + '.' + '   ' + data.title[0] + '   ' + data.box[0] + ' 万元\n' + data.rank[1] + '.' + '   ' + data.title[1] + '   ' + data.box[1] + ' 万元\n' + data.rank[2] + '.' + '   ' + data.title[2] + '   ' + data.box[2] + ' 万元\n' + data.rank[3] + '.' + '   ' + data.title[3] + '   ' + data.box[3] + ' 万元\n' + data.rank[4] + '.' + '   ' + data.title[4] + '   ' + data.box[4] + ' 万元\n' + data.rank[5] + '.' + '   ' + data.title[5] + '   ' + data.box[5] + ' 万元\n' + data.rank[6] + '.' + '   ' + data.title[6] + '   ' + data.box[6] + ' 万元\n' + data.rank[7] + '.' + '   ' + data.title[7] + '   ' + data.box[7] + ' 万元\n' + data.rank[8] + '.' + '   ' + data.title[8] + '   ' + data.box[8] + ' 万元';
            } else if (message.EventKey === 'nearby') { //附近影讯
                status = false;
                this.body = '请输入你所在的城市，回复1退出';

            }
        } else if (message.Event === 'SCAN') {
            console.log('二维码：' + message.EventKey + ' ' + message.Ticket)
            this.body = '您刚刚扫了码哦';
        } else if (message.Event === 'VIEW') {
            this.body = '您点击了菜单中的：' + message.EventKey;
        } else if (message.Event === 'scancode_push') {
            this.body = '您点击了菜单中的：' + message.EventKey;
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanResult);

        } else if (message.Event === 'scancode_waitmsg') {
            this.body = '您点击了菜单中的：' + message.EventKey;
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanResult);

        } else if (message.Event === 'pic_sysphoto') { //系统拍照
            this.body = '您点击了菜单中的：' + message.EventKey;
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            // status = 'pic_sysphoto'
            // console.log('status' + status)
        } else if (message.Event === 'pic_photo_or_album') { //弹出拍照或相册
            this.body = '您点击了菜单中的：' + message.EventKey;
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            // status = 'pic_photo_or_album'
            // console.log('status' + status)
        } else if (message.Event === 'pic_weixin') { //相册发图
            this.body = '您点击了菜单中的：' + message.EventKey;
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            // status = 'pic_weixin'
            // console.log('status' + status)
        } else if (message.Event === 'location_select') {
            this.body = '您点击了链接哦：';
            console.log(message.SendLocationInfo.Location_X);
            console.log(message.SendLocationInfo.Location_Y);
            console.log(message.SendLocationInfo.Scale);
            console.log(message.SendLocationInfo.Label);
            console.log(message.SendLocationInfo.Poiname);

        }

        console.log('第一个：' + status);


    } else if (status === true && message.MsgType === 'text') {
        var content = message.Content;
        console.log('第二个：' + status);
        var reply = '你说的' + ' ' + message.Content + ' ' + '我听不懂哦';

        if (content.indexOf('哈哈') > -1) {
            reply = '笑什么笑笑什么笑！严肃点';
        } else if (content === '傻逼' || content === 'SB' || content === 'sb' || content === '2b' || content === '2B' || content === '撒比') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../1.jpg'));
            console.log('临时素材mediaId:' + data.media_id);
            reply = {
                type: 'image',
                mediaId: data.media_id //media_id是上传后从微信端获取的唯一标识
            }
        } else if (content === '导航') {
            reply = '嗯~~当我敲这行文字的时候这个电影测试号的开发算是暂时告一段落了，妈的逼整整8天踩了无数坑我草，还好熬过来了，不说了，赶紧下皇室战争去哈哈哈哈。10mins later，差点忘记这是导航了，妈了个巴子的，等等，让我想想怎么写，导导导导航你妹啊，菜单里面都有哈哈，什么语音猜电影查看实时榜单什么的，千万不要骂我傻逼哦，拜托了！  哦对了，小惊喜里面有一个增长你们姿势水平的小游戏，别人开发的，值得一玩哦';
        } else if (content === '2') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'));

            reply = {
                type: 'image',
                mediaId: data.media_id //media_id是上传后从微信端获取的唯一标识
            }
        } else if (content === '1') {
            status = true;
            reply = '回到正常模式了，请继续调戏我吧哈哈哈哈';
        } else if (content === '4') {
            reply = [{
                title: '如果我是DJ你会爱我吗',
                description: '我是电音之王',
                picUrl: 'http://www.helloxuhan.cn/shift/img3/6.jpg',
                url: 'http://www.baidu.com'
            }]
        } else if (content === '5') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'));
            console.log('临时素材mediaId:' + data.media_id);
            reply = {
                type: 'image',
                mediaId: data.media_id //media_id是上传后从微信端获取的唯一标识
            }
        } else if (content === '6') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../1.mp4'));
            //console.log('传视频...')
            reply = {
                type: 'video',
                title: '哈哈哈嘿嘿嘿',
                description: '嘿嘿和高兴啊',
                mediaId: data.media_id
            }

        } else if (content === '7') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'));

            reply = {
                type: 'music',
                title: '摩的叨位去',
                description: '时尚时尚最时尚',
                musicUrl: 'http://220.169.243.157/m10.music.126.net/20160415153628/8bc5952220acfc1ad38c56ed06a60453/ymusic/d069/c757/272e/828fbd204b8e045d91af9dec15125c89.mp3',
                thumbMediaId: data.media_id

            }
        } else if (content === '8') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'), {
                'type': 'image'
            });

            reply = {
                type: 'image',
                mediaId: data.media_id //media_id是上传后从微信端获取的唯一标识
            };
        } else if (content === '9') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../1.mp4'), {
                'type': 'video',
                'description': '{"title" :"nice","introduction": "nice too"}'
            });
            console.log('永久素材mediaId:' + data.media_id);
            reply = {
                type: 'video',
                title: '这是一个视频',
                description: '这是视频的描述',
                mediaId: data.media_id
            }
        } else if (content === '10') {
            var picData = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'), {});
            console.log(picData.media_id);
            var media = {
                'articles': [{
                    'title': '突突突，别开枪a',
                    'thumb_media_id': picData.media_id,
                    'author': 'xuhan',
                    'digest': '突突突突突突',
                    'show_cover_pic': 1,
                    'content': '没有内容啊啊哈',
                    'cotent_source_url': 'https://www.baidu.com'
                }]
            }
            data = yield wechatApi.uploadMaterial('news', media, {});
            console.log('data.media_id: ' + data.media_id);
            data = yield wechatApi.fetchMaterial(data.media_id, 'news', {}); //获得素材需要知道mediaId和type

            console.log('DATA: ' + data);

            var items = data.news_item;
            var news = [];
            console.log('Items: ' + items);
            items.forEach(function(item) {
                news.push({
                    title: items.title,
                    description: item.digest,
                    picUrl: picData.url,
                    url: item.url
                });
            });
            reply = news;
        } else if (content === '12') {


            /*批量移动*/
            var result2 = yield wechatApi.moveGroup([message.FromUserName], 101);
            console.log('移动到101');
            console.log(result2);

            var groups4 = yield wechatApi.fetchGroups();
            console.log('批量移动后的分组列表');
            console.log(groups4);


            reply = '111';
        } else if (content === '13') {

            var userList = yield wechatApi.listUsers();
            console.log(userList);
        } else if (content === '15') {
            var mpnews = {
                media_id: '6bubf63H_TGmeTQwUdfpnhFqEydEYqpEjqbXWPJ8lmkr9tmqp4duxlnbbIwNVlly'
            };

            var text = {
                'content': '这是分组群发功能哦，只发给特定分组'
            };
            var msgData = yield wechatApi.sendByGroup('text', text, 0);

            //console.log(msgData)
            reply = 'hello world!!';
        } else if (content === '16') {
            var mpnews = {
                media_id: '6bubf63H_TGmeTQwUdfpnhFqEydEYqpEjqbXWPJ8lmkr9tmqp4duxlnbbIwNVlly'
            };

            var text = {
                'content': 'hey man!Preview方法，只能发送给特定的openId哦!'
            };
            var msgData = yield wechatApi.previewMass('text', text, 'oihH1wIhzGlJCBhWrqR165nZiOac');

            //console.log(msgData)
            reply = 'hello world!';
        }
        this.body = reply;
    } else if (message.MsgType === 'image') {
        this.body = '你发的图很好看哦';
    } else if (message.MsgType === 'location') {
        this.body = '您的经度：' + message.Location_Y + '\n' + '您的纬度：' + message.Location_X + '\n' + message.Label;
    } else if (status === false && message.MsgType === 'text') {
        var content = message.Content;
        if (content != 1) {;
            var data = yield wechatApi.nearbyMovie(content);
            var title = data.title;
            var description = data.description;
            var picUrl = data.picUrl;
            var url = data.url;
            var playDate = data.playDate;
            var error_code = data.error_code;

            if (error_code === 0) {
                reply = [{
                    title: '【' + title[0] + '】' + '		' + playDate[0] + ' 上映',
                    description: description[0],
                    picUrl: picUrl[0],
                    url: url[0]
                }, {
                    title: '【' + title[1] + '】' + '	   ' + playDate[1] + ' 上映',
                    description: description[1],
                    picUrl: picUrl[1],
                    url: url[1]
                }, {
                    title: '【' + title[2] + '】' + '	   ' + playDate[2] + ' 上映',
                    description: description[2],
                    picUrl: picUrl[2],
                    url: url[2]
                }, {
                    title: '【' + title[3] + '】' + '	   ' + playDate[3] + ' 上映',
                    description: description[3],
                    picUrl: picUrl[3],
                    url: url[3]
                }, {
                    title: '【' + title[4] + '】' + '	 ' + playDate[4] + ' 上映',
                    description: description[4],
                    picUrl: picUrl[4],
                    url: url[4]
                }]
            } else {
                reply = '查询出错，请输入正确的城市名哦';
            }

        } else if (content === '1') {
            status = true;
            reply = '回到正常模式了，请继续调戏我吧哈哈哈哈';
        }
        this.body = reply;
    }
    console.log('reply.js中的this.body: ' + this.body)
    yield next;
}