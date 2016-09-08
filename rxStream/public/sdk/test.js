'use strict';
var localData = {
    ProductName: ['iphone5', 'iphone6', 'iphone4s', 'iphone5s', 'iphone6s', 'iphone5c', 'iphone6plus', 'iphone6splus', 'iphone6c', '小米5', '小米4', '荣耀6', '魅族MX5', '魅族5pro', '华为mate7', '华为mate8', '三星s4', '三星s5', '三星s6', '三星s6edge', '三星s6edge+', '苹果数据线', '三星充电器', 'ANDROID数据线', 'iphone4手机壳', 'iphone5手机壳', 'iphone6手机壳', 'iphone4s手机壳', 'iphone5s手机壳', 'iphone6s手机壳'],
    ProductType: ['手机', '充电器', '数据线', '保护壳'],
    ShopName: ['分销渠道1', '分销渠道2', '分销渠道3', '分销渠道4', '分销渠道5', '分销渠道6', '分销渠道7', '分销渠道8', '分销渠道9', '分销渠道10', '分销渠道11', '分销渠道12', '分销渠道13', '分销渠道14', '分销渠道15', '分销渠道16', '分销渠道17', '官方旗舰店1', '官方旗舰店2', '官方旗舰店3', '官方旗舰店4', '官方旗舰店5', '官方旗舰店6'],
    KeyWord: ['手机', '手机配件', '笔记本电脑', '平板', 'iphone', '平板电脑', '笔记本', '智能手机配件', 'pad'],
    Channel: ['今日头条', '搜狐', '新浪', '新浪微博', '微信', 'qq', 'qq空间', '微信朋友圈', '地推', '应用宝', '百度', '网易邮箱'],
    ShipPrice: [10, 0, 15, 20, 30, 25],
    ProductUnitPrice: [2399, 4000, 888, 2888, 4888, 5888, 6888, 3888, 2688, 1200, 1500, 1299, 2799, 2688, 4888, 999, 1999, 3699, 4666, 4999, 5888, 88, 66, 20, 20, 30, 40, 50, 60, 70],
    Allowance: [['新人红包', 5], ['支付红包', 15], ['活动红包', 20], ['幸运红包', 10]],
    PaymentMethod: ['支付宝', '微信支付', '百度钱包', '银联通道', '快钱', '易付宝', '财付通', 'q币', '储值卡', '会员积分'],
    CancelReason: ['不想要了', '未按时发货', '下错订单', '客服不满意', '不是我想要的', '发现更低产品'],
    SupplyMethod: ['EMS', '顺丰快递', '韵达快递', '天天快递', '申通快递', '圆通快递', '中通快递', '宅急送', '全峰快递'],
    ServiceContent: ['维修', '无理由退货', '换货', '退货', '退款', '换新'],
    ServiceStatus: ['待审核', '处理中', '已完成'],
    AreaMapping: {
        "北京": [["北京", 110100]],
        "新疆": [["乌鲁木齐", 650100], ["克拉玛依", 650200], ["吐鲁番", 652100], ["哈密", 652200], ["昌吉", 652300], ["博尔塔拉", 652700], ["巴音郭楞", 652800], ["阿克苏", 652900], ["克孜勒苏柯尔克孜", 653000], ["喀什", 653100], ["和田", 653200], ["伊犁", 654000], ["塔城", 654200], ["阿勒泰", 654300], ["石河子", 659001], ["阿拉尔", 659002], ["图木舒克", 659003], ["五家渠", 659004]],
        "重庆": [["重庆", 500100]],
        "广东": [["广州", 440100], ["韶关", 440200], ["深圳", 440300], ["珠海", 440400], ["汕头", 440500], ["佛山", 440600], ["江门", 440700], ["湛江", 440800], ["茂名", 440900], ["肇庆", 441200], ["惠州", 441300], ["梅州", 441400], ["汕尾", 441500], ["河源", 441600], ["阳江", 441700], ["清远", 441800], ["东莞", 441900], ["中山", 442000], ["东沙", 442101], ["潮州", 445100], ["揭阳", 445200], ["云浮", 445300]],
        "浙江": [["杭州", 330100], ["宁波", 330200], ["温州", 330300], ["嘉兴", 330400], ["湖州", 330500], ["绍兴", 330600], ["金华", 330700], ["衢州", 330800], ["舟山", 330900], ["台州", 331000], ["丽水", 331100]],
        "天津": [["天津", 120100]],
        "广西": [["南宁", 450100], ["柳州", 450200], ["桂林", 450300], ["梧州", 450400], ["北海", 450500], ["防城港", 450600], ["钦州", 450700], ["贵港", 450800], ["玉林", 450900], ["百色", 451000], ["贺州", 451100], ["河池", 451200], ["来宾", 451300], ["崇左", 451400]],
        "内蒙古": [["呼和浩特", 150100], ["包头", 150200], ["乌海", 150300], ["赤峰", 150400], ["通辽", 150500], ["鄂尔多斯", 150600], ["呼伦贝尔", 150700], ["巴彦淖尔", 150800], ["乌兰察布", 150900], ["兴安", 152200], ["锡林郭勒", 152500], ["阿拉善", 152900]],
        "宁夏": [["银川", 640100], ["石嘴山", 640200], ["吴忠", 640300], ["固原", 640400], ["中卫", 640500]],
        "江西": [["南昌", 360100], ["景德镇", 360200], ["萍乡", 360300], ["九江", 360400], ["新余", 360500], ["鹰潭", 360600], ["赣州", 360700], ["吉安", 360800], ["宜春", 360900], ["抚州", 361000], ["上饶", 361100]],
        "安徽": [["合肥", 340100], ["芜湖", 340200], ["蚌埠", 340300], ["淮南", 340400], ["马鞍山", 340500], ["淮北", 340600], ["铜陵", 340700], ["安庆", 340800], ["黄山", 341000], ["滁州", 341100], ["阜阳", 341200], ["宿州", 341300], ["六安", 341500], ["亳州", 341600], ["池州", 341700], ["宣城", 341800]],
        "贵州": [["贵阳", 520100], ["六盘水", 520200], ["遵义", 520300], ["安顺", 520400], ["铜仁", 522200], ["黔西南", 522300], ["毕节", 522400], ["黔东南", 522600], ["黔南", 522700]],
        "陕西": [["西安", 610100], ["铜川", 610200], ["宝鸡", 610300], ["咸阳", 610400], ["渭南", 610500], ["延安", 610600], ["汉中", 610700], ["榆林", 610800], ["安康", 610900], ["商洛", 611000]],
        "辽宁": [["沈阳", 210100], ["大连", 210200], ["鞍山", 210300], ["抚顺", 210400], ["本溪", 210500], ["丹东", 210600], ["锦州", 210700], ["营口", 210800], ["阜新", 210900], ["辽阳", 211000], ["盘锦", 211100], ["铁岭", 211200], ["朝阳", 211300], ["葫芦岛", 211400]],
        "山西": [["太原", 140100], ["大同", 140200], ["阳泉", 140300], ["长治", 140400], ["晋城", 140500], ["朔州", 140600], ["晋中", 140700], ["运城", 140800], ["忻州", 140900], ["临汾", 141000], ["吕梁", 141100]],
        "青海": [["西宁", 630100], ["海东", 632100], ["海北", 632200], ["黄南", 632300], ["海南藏族", 632500], ["果洛", 632600], ["玉树", 632700], ["海西", 632800]],
        "四川": [["成都", 510100], ["自贡", 510300], ["攀枝花", 510400], ["泸州", 510500], ["德阳", 510600], ["绵阳", 510700], ["广元", 510800], ["遂宁", 510900], ["内江", 511000], ["乐山", 511100], ["南充", 511300], ["眉山", 511400], ["宜宾", 511500], ["广安", 511600], ["达州", 511700], ["雅安", 511800], ["巴中", 511900], ["资阳", 512000], ["阿坝", 513200], ["甘孜", 513300], ["凉山", 513400]],
        "江苏": [["南京", 320100], ["无锡", 320200], ["徐州", 320300], ["常州", 320400], ["苏州", 320500], ["南通", 320600], ["连云港", 320700], ["淮安", 320800], ["盐城", 320900], ["扬州", 321000], ["镇江", 321100], ["泰州", 321200], ["宿迁", 321300]],
        "河北": [["石家庄", 130100], ["唐山", 130200], ["秦皇岛", 130300], ["邯郸", 130400], ["邢台", 130500], ["保定", 130600], ["张家口", 130700], ["承德", 130800], ["沧州", 130900], ["廊坊", 131000], ["衡水", 131100]],
        "西藏": [["拉萨", 540100], ["昌都", 542100], ["山南", 542200], ["日喀则", 542300], ["那曲", 542400], ["阿里", 542500], ["林芝", 542600]],
        "福建": [["福州", 350100], ["厦门", 350200], ["莆田", 350300], ["三明", 350400], ["泉州", 350500], ["漳州", 350600], ["南平", 350700], ["龙岩", 350800], ["宁德", 350900]],
        "吉林": [["长春", 220100], ["吉林", 220200], ["四平", 220300], ["辽源", 220400], ["通化", 220500], ["白山", 220600], ["松原", 220700], ["白城", 220800], ["延边朝鲜族", 222400]],
        "上海": [["上海", 310100]],
        "湖北": [["武汉", 420100], ["黄石", 420200], ["十堰", 420300], ["宜昌", 420500], ["襄阳", 420600], ["鄂州", 420700], ["荆门", 420800], ["孝感", 420900], ["荆州", 421000], ["黄冈", 421100], ["咸宁", 421200], ["随州", 421300], ["恩施", 422800], ["仙桃", 429004], ["潜江", 429005], ["天门", 429006], ["神农架", 429021]],
        "海南": [["海口", 460100], ["三亚", 460200], ["三沙", 460300], ["五指山", 469001], ["琼海", 469002], ["儋州", 469003], ["文昌", 469005], ["万宁", 469006], ["东方", 469007], ["定安", 469025], ["屯昌", 469026], ["澄迈", 469027], ["临高", 469028], ["白沙", 469030], ["昌江", 469031], ["乐东", 469033], ["陵水", 469034], ["保亭", 469035], ["琼中", 469036], ["西沙", 469037], ["南沙", 469038], ["中沙", 469039]],
        "云南": [["昆明", 530100], ["曲靖", 530300], ["玉溪", 530400], ["保山", 530500], ["昭通", 530600], ["丽江", 530700], ["普洱", 530800], ["临沧", 530900], ["楚雄", 532300], ["红河", 532500], ["文山", 532600], ["西双版纳", 532800], ["大理", 532900], ["德宏", 533100], ["怒江", 533300], ["迪庆", 533400]],
        "甘肃": [["兰州", 620100], ["嘉峪关", 620200], ["金昌", 620300], ["白银", 620400], ["天水", 620500], ["武威", 620600], ["张掖", 620700], ["平凉", 620800], ["酒泉", 620900], ["庆阳", 621000], ["定西", 621100], ["陇南", 621200], ["临夏", 622900], ["甘南", 623000]],
        "湖南": [["长沙", 430100], ["株洲", 430200], ["湘潭", 430300], ["衡阳", 430400], ["邵阳", 430500], ["岳阳", 430600], ["常德", 430700], ["张家界", 430800], ["益阳", 430900], ["郴州", 431000], ["永州", 431100], ["怀化", 431200], ["娄底", 431300], ["湘西", 433100]],
        "山东": [["济南", 370100], ["青岛", 370200], ["淄博", 370300], ["枣庄", 370400], ["东营", 370500], ["烟台", 370600], ["潍坊", 370700], ["济宁", 370800], ["泰安", 370900], ["威海", 371000], ["日照", 371100], ["莱芜", 371200], ["临沂", 371300], ["德州", 371400], ["聊城", 371500], ["滨州", 371600], ["菏泽", 371700]],
        "河南": [["郑州", 410100], ["开封", 410200], ["洛阳", 410300], ["平顶山", 410400], ["安阳", 410500], ["鹤壁", 410600], ["新乡", 410700], ["焦作", 410800], ["济源", 410881], ["濮阳", 410900], ["许昌", 411000], ["漯河", 411100], ["三门峡", 411200], ["南阳", 411300], ["商丘", 411400], ["信阳", 411500], ["周口", 411600], ["驻马店", 411700]],
        "黑龙江": [["哈尔滨", 230100], ["齐齐哈尔", 230200], ["鸡西", 230300], ["鹤岗", 230400], ["双鸭山", 230500], ["大庆", 230600], ["伊春", 230700], ["佳木斯", 230800], ["七台河", 230900], ["牡丹江", 231000], ["黑河", 231100], ["绥化", 231200], ["大兴安岭", 232700]]
    },
    Persons: '杨朝来#蒋平#唐灿华#马达#赵小雪#薛文泉#丁建伟#凡小芬#文明#文彭凤#王丽#王建华#王梓人#王震#王保真#王景亮#王丹#邓志勇#邓婕#尹会南#叶汝红#付伟娜#付双红#毕泗迁#孙平#毛华强#孙益奇#孙媛媛#伍婷#阳娣#阳倩莹#刘小梅#刘俊鸣#刘海兵#刘伟华#刘启龙#刘勇辉#吕红#朱智新#张建辉#李湘群#李自新#李俊#李娟#李君琳#李桂富#陈其虎#陈明#邵彩云#杨知#杨波#杨开基#杨友成#杨巧敏#杨国栋#罗新磊#罗美#罗咏梅#罗心悦#周婷#周灵灵#范文远#胡水洋#胡俊松#胡瑞#赵燕燕#赵静#赵红#袁滴#袁艳#郭迎新#唐薇#贾天华#黄孝志#梁建#彭虎#盛伟刚#谢敏#曾水秀#曾维干#曾晖#曾莹#蔡准#谭红#蔡滔#黎婷婷#燕良华#戴剑敏#谭位旭#佘季#刘婷#李莎#夏婷#王玲#谭黎#陈晟#肖杨#邓健#龙平#叶波#阳勇#刘超#张玲#张琴丽#李远焕#李勇#陈丽云#肖琼洁#吴卫国#杨欢#郑志强#贺小红#杨淅#杨浙#猫哥#李珍珍#李珍宝#李珍婆#珍珍婆#珍宝宝#李珍妹#珍哈宝#尹敏#马飞#飞哥#敏敏#敏敏姐#尹文#文子#杨隆#杨金#杨金金#杨金妹#金妹妹#珍妹妹#丁锦#丁开水#黎春慧#春慧#丹惠#吴丹惠#刘兰#兰猪#兰猪猪#唐志凤#段湘林#欧阳菲菲#欧阳育兰#谭特林#宋琳#李敖#艾朝瑛#艾福聪#艾静#艾男男#安斌#安春华#安灏超#安建华#安金春#安立君#安娜#安世立#安炜#安文一#敖卫#傲丹#巴广玉#巴岩#白桂#白剑#白颉#白金丽#白静#白凯#白茗元#白蓉#白山#白生鹏#白伟俊#白文平#白喜云#白晓东#白晓亮#白晓林#白晓通#白晓霞#白秀芸#白永学#白勇#白玉芳#白云逸#白祖武#百元明#柏建阁#柏建群#柏君芝#柏梅花#柏夏倩#班大林#包聃霞#包国强#包含露#包汉平#包红江#包辉明#包佳#包坚军#包军#包骏#包莉萍#包敏#包其富#包琴#包琴芬#包蓉蕾#包维宁#包卫霞#包晓鸣#包晓燕#包鑫#包徐君#包妍#包兆信#包志虹#包柱红#鲍国栋#鲍宏钧#鲍华静#鲍辉军#鲍磊#鲍明道#鲍清晓#鲍秋菊#鲍士杰#鲍士英#鲍顽园#鲍薇斌#鲍贤敏#鲍贤优#鲍晓仙#鲍学锋#鲍银凤#鲍莹莹#毕白菊#毕红娟#毕丽萍#毕亮#毕鹏志#毕皖霞#毕云霞#边巴次仁#边海英#边诗瑶#边小君#边亚#边岳军#边云峰#边云杰#边正刚#卞晶#卞澜军#卞莉莉#卞雯华#卞晓玲#卞意炯#别晓霞#宾坚#薄静艳#薄盛山#薄夜芬#薄莹#薄莹华#卜芬芬#卜慧瑛#卜秋玉#卜焱#卜章绍#步晓杰#蔡红#蔡爱华#蔡蓓颖#蔡长志#蔡成香#蔡春英#蔡刚#蔡国辉#蔡海滨#蔡海燕#蔡红国#蔡宏浩#蔡华露#蔡焕成#蔡辉锐#蔡惠珠#蔡慧#蔡慧萍#蔡坚#蔡建杰#蔡建师#蔡剑锋#蔡健英#蔡景风#蔡靖中#蔡俊敏#蔡康杰#蔡坤#蔡莉#蔡莉华#蔡立成#蔡立辉#蔡丽英#蔡林刚#蔡琳#蔡霖#蔡玲#蔡玲孝#蔡美英#蔡敏丹#蔡明#蔡明明#蔡佩英#蔡萍#蔡勤慧#蔡瑞梅#蔡瑞英#蔡润玲#蔡胜利#蔡胜学#蔡胜煜#蔡守东#蔡守凤#蔡曙东#蔡同根#蔡炜#蔡文君#蔡文俊#蔡文明#蔡香莲#蔡小连#蔡小英#蔡晓明#蔡晓芸#蔡新艺#蔡秀芳#蔡旭斌#蔡亚波#蔡延岳#蔡燕青#蔡阳#蔡业红#蔡一新#蔡轶飞',
    Favorite: ['影视', '音乐', '购物', '游戏', '运动', '美食', '动漫', '手游', '页游', '咖啡', '茶道', '交友', '健身'],
    Genders: ['男', '女', '未填写'],
    IncomeLevel: ['0-1000', '1001-2000', '2001-3000', '3001-5000', '5001-8000', '8001-15000', '15001-30000', '30000+'],
    OsVersion: [1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 8.0, 9.0],
    Model: ['iphone4', 'iphone5', 'iphone6', 'iphone4s', 'iphone5s', 'iphone6s', 'iphone5c', 'iphone6plus', 'iphone6splus', 'iphone6c', '小米5', '小米4', '荣耀6', '魅族MX5', '魅族5pro', '华为mate7', '华为mate8', '三星s4', '三星s5', '三星s6', '三星s6edge', '三星s6edge+'],
    AppVersion: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9],
    OS: ['ios', 'android', 'winxp', 'win7', 'win8.1', 'win10'],
    Screen: [[1280, 720], [1920, 1080], [960, 640], [854, 480], [960, 540]],
    Manufacturer: ['APPLE', 'GOOGLE', 'XIAOMI', 'MEIZU', 'HUAWEI', 'SAMSUNG'],
    System: ['ERP', 'BAS']
};

/**
 搜索商品1000000->浏览商品100000->下订单10000->支付订单1000->收到商品10->售后服务1:11110111
 ->支付订单->取消订单
 ->取消订单100
 */
var common = {
    getRandomArrayItem: function (arr) {

        return arr[Math.floor(Math.random() * arr.length)];
    },
    getRandomDecimal: function (base) {
        return base * Math.random().toFixed(2);
    },
    getRandomNumber: function (base) {
        return Math.ceil(Math.random() * base);
    },
    nextOrderID: function () {
        this.orderId = this.orderId || 1000000;
        this.orderId += 1;
        return this.orderId;
    },
    nextDateTime: function (opts) {
        var keys = [
            ['milliseconds', 1000],
            ['seconds', 60],
            ['minutes', 60],
            ['hours', 24],
            ['days', 30],
            ['weeks', 8],
            ['months', 1],
            ['years', 1]
        ];

        var keysObj = {};
        keys.forEach(function (key, index) {
            keysObj[key[0]] = key[1];
        });

        if (!opts) {
            var key = common.getRandomArrayItem(keys);
            opts[key[0]] = common.getRandomNumber(key[1]);
        } else {
            for (var i in opts) {
                if (opts[i] == 'random') {
                    opts[i] = common.getRandomNumber(keysObj[i]);
                }
            }
        }

        var baseDateTime = opts.currentDateTime || this.currentDateTime || new Date();
        var newDateTime = new Date(baseDateTime.valueOf());
        if (opts.milliseconds !== undefined) {
            newDateTime.setMilliseconds(baseDateTime.getMilliseconds() + opts.milliseconds);
        }
        if (opts.seconds !== undefined) {
            newDateTime.setSeconds(baseDateTime.getSeconds() + opts.seconds);
        }
        if (opts.minutes !== undefined) {
            newDateTime.setMinutes(baseDateTime.getMinutes() + opts.minutes);
        }
        if (opts.hours !== undefined) {
            newDateTime.setHours(baseDateTime.getHours() + opts.hours);
        }
        if (opts.days !== undefined) {
            newDateTime.setDate(baseDateTime.getDate() + opts.days);
        }
        if (opts.weeks !== undefined) {
            newDateTime.setDate(baseDateTime.getDate() + (opts.weeks * 7));
        }
        if (opts.months !== undefined) {
            newDateTime.setMonth(baseDateTime.getMonth() + opts.months);
        }
        if (opts.years !== undefined) {
            newDateTime.setFullYear(baseDateTime.getFullYear() + opts.years);
        }
        return newDateTime;
    }

};

function BusinessModel() {
    this.LastDateTime = common.nextDateTime({
        currentDateTime: new Date('2015-1-1'),
        days: common.getRandomNumber(365)
    });
}
BusinessModel.Users = (function () {
    var provinces = [];
    for (var province in areaMapping) {
        provinces.push(province);
    }
    var users = [];
    persons.split('#').forEach(function (personName, index) {
        var _province = common.getRandomArrayItem(localData.Provinces),
            _city = common.getRandomArrayItem(localData.AreaMapping[_province])[0],
            _gender = common.getRandomArrayItem(localData.Genders),
            _age = common.getRandomNumber(42) + 18,
            _registerChannel = common.getRandomArrayItem(localData.Channel),
            _incomelevel = common.getRandomArrayItem(localData.IncomeLevel);

        users[index] = {
            registerId: index + 1,
            id: 1,
            $name: personName,
            $signup_time: '',
            $province: _province,
            $city: _city,
            gender: _gender,
            age: _age,
            RegisterChannel: _registerChannel,
            incomelevel: _incomelevel,
            signup: false
        };
    });
})();

BusinessModel.prototype = {
    _Signup: false,
    _Login: false,
    _ViewHomePage: false,
    _SearchProduct: false,
    _ViewProduct: false,
    _SubmitOrder: false,
    _SubmitOrderDetail: false,
    _PayOrder: false,
    _PayOrderDetail: false,
    _CancelOrder: false,
    _CancelOrderDetail: false,
    _ReceiveProduct: false,
    _ServiceAfterSale: false,
    LastDateTime: null,
    Signup: function () {
        //已注册的不可再进行注册
        if (this._Signup) return null;
        this.signup = {};
        var user = common.getRandomArrayItem(BusinessModel.Users);
        if (!user.signup) {
            user.signup = true;
            this.signup = user;
            this.LastDateTime = common.nextDateTime.call(this);
            return this.signup;
        }
        return null;
    },
    Login: function () {

        //已经登录的不可再进行登录
        if (this._Login) return null;

        this.login = {};

        var user = common.getRandomArrayItem(BusinessModel.Users);

        //未注册不可登录
        if (!user.signup) return null;

        //未登录则登录
        if (!user.login) {
            user.login = true;
            this._Login = true;
            this.login = user;
            this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, seconds: 'random'});
            return this.login;
        }

        return null;

    },
    ViewHomePage: function () {
        this.viewHomePage = {};
        this.viewHomePage.Channel = common.getRandomArrayItem(localData.Channel);
        this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, minutes: 'random'});
        this._ViewHomePage = true;
        return this.viewHomePage;
    },
    SearchProduct: function () {
        this.searchProduct = {};
        this.searchProduct.Keyword = common.getRandomArrayItem(localData.KeyWord);
        this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, minutes: 'random'});
        this._SearchProduct = true;
        return this.searchProduct;
    },
    ViewProduct: function () {
        this.product = {};
        this.product.ProductName = common.getRandomArrayItem(localData.ProductName);
        this.product.ProductType = common.getRandomArrayItem(localData.ProductType);
        this.product.ShopName = common.getRandomArrayItem(localData.ShopName);
        this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, minutes: 'random'});
        this._ViewProduct = true;
        return this.product;
    },
    SubmitOrder: function () {
        if (!this._ViewProduct) return null; //未查看产品不可提交订单
        var orderId = common.nextOrderID();
        var productName = this.product.ProductName;
        var productType = this.product.ProductType;
        var shopName = this.product.ShopName;
        var productUnitPrice = common.getRandomArrayItem(localData.ProductUnitPrice);
        var productAmount = common.getRandomNumber(5);
        var productTotalPrice = productUnitPrice * productAmount;
        var shipPrice = common.getRandomArrayItem(localData.ShipPrice);
        this.submitOrder = {
            OrderID: orderId,
            OrderTotalPrice: productTotalPrice + shipPrice,
            ShipPrice: shipPrice
        };
        this.submitOrderDetail = {
            OrderID: orderId,
            ProductName: productName,
            ProductType: productType,
            ShopName: shopName,
            ProductUnitPrice: productUnitPrice,
            ProductAmount: productAmount,
            ProductTotalPrice: productTotalPrice
        };
        this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, minutes: 'random'});
        this._SubmitOrder = true;
        return this.submitOrder;
    },
    SubmitOrderDetail: function () {
        if (!this._SubmitOrder) return null;
        this._SubmitOrderDetail = true;
        return this.submitOrderDetail;
    },
    PayOrder: function () {
        if (!this._SubmitOrder) return null; //未提交订单不可支付
        if (this._CancelOrder) return null; //已经取消订单不可支付
        var allowance = common.getRandomArrayItem(localData.Allowance);
        this.payOrder = {
            OrderID: this.submitOrderDetail.OrderID,
            OrderTotalPrice: this.submitOrder.OrderTotalPrice,
            ShipPrice: this.submitOrder.ShipPrice,
            AllowanceAmount: allowance[1],
            AllowanceType: allowance[0],
            PaymentAmount: this.submitOrder.OrderTotalPrice - allowance[1],
            PaymentMethod: common.getRandomArrayItem(localData.PaymentMethod)
        };
        this.payOrderDetail = {
            OrderID: this.submitOrderDetail.OrderID,
            ProductName: this.submitOrderDetail.ProductName,
            ProductType: this.submitOrderDetail.ProductType,
            ShopName: this.submitOrderDetail.ShopName,
            ProductUnitPrice: this.submitOrderDetail.ProductUnitPrice,
            ProductAmount: this.submitOrderDetail.ProductAmount,
            ProductTotalPrice: this.submitOrderDetail.ProductTotalPrice,
            ProductAllowanceAmount: this.payOrder.AllowanceAmount,
            ProductAllowanceType: this.payOrder.AllowanceType,
            PaymentAmount: this.payOrder.PaymentAmount,
            PaymentMethod: this.payOrder.PaymentMethod
        }
        this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, minutes: 'random'});
        this._PayOrder = true;
        return this.payOrder;
    },
    PayOrderDetail: function () {
        if (!this._PayOrder) return null;
        this._PayOrderDetail = true;
        return this.payOrderDetail;
    },
    CancelOrder: function () {
        //未提交订单不能取消订单
        if (!this._SubmitOrder) return null;
        //提交了订单，不管是否支付都可以取消订单
        this.cancelOrder = {
            OrderID: this.submitOrder.OrderID,
            OrderTotalPrice: this.submitOrder.OrderTotalPrice,
            ShipPrice: this.submitOrder.ShipPrice,
            AllowanceAmount: this._PayOrder ? this.payOrder.AllowanceAmount : null,
            PaymentAmount: this._PayOrder ? this.payOrder.PaymentAmount : null,
            PaymentMethod: this._PayOrder ? this.payOrder.PaymentMethod : null,
            CancelReason: common.getRandomArrayItem(localData.CancelReason),
            CancelTiming: this._PayOrder ? '支付后' : '支付前',
        }
        this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, minutes: 'random'});
        this._CancelOrder = true;
        return this.cancelOrder;
    },
    CancelOrderDetail: function () {
        if (!this._CancelOrder) return null;
        this.cancelOrderDetail = {
            OrderID: this.cancelOrder.OrderID,
            ProductName: this.submitOrderDetail.ProductName,
            ProductType: this.submitOrderDetail.ProductType,
            ShopName: this.submitOrderDetail.ShopName,
            ProductUnitPrice: this.submitOrderDetail.ProductUnitPrice,
            ProductAmount: this.submitOrderDetail.ProductAmount,
            ProductTotalPrice: this.submitOrderDetail.ProductTotalPrice,
            ProductAllowanceAmount: this.cancelOrder.AllowanceAmount,
            ProductPaymentAmount: this.cancelOrder.ProductPaymentAmount,
            PaymentMethod: this.cancelOrder.PaymentMethod,
            CancelReason: this.cancelOrder.CancelReason,
            CancelTiming: this.cancelOrder.CancelTiming
        }
        this._CancelOrderDetail = true;
        return this.cancelOrderDetail;
    },
    ReceiveProduct: function () {
        if (!this._SubmitOrder) return null; //未提交订单不可收到商品
        if (!this._PayOrder) return null; //未支付订单不可收到商品
        if (this._CancelOrder) return null; //取消订单不可收到商品
        this.receiveProduct = {
            OrderID: this.submitOrder.OrderID,
            ProductName: this.submitOrderDetail.ProductName,
            ProductType: this.submitOrderDetail.ProductType,
            ShopName: this.submitOrderDetail.ShowName,
            ProductUnitPrice: this.submitOrder.ProductUnitPrice,
            ProductAmount: this.submitOrderDetail.ProductAmount,
            ProductTotalPrice: this.submitOrderDetail.ProductTotalPrice,
            ProductAllowanceAmount: this.payOrder.AllowanceAmount,
            ProductPaymentAmount: this.payOrder.PaymentAmount,
            PaymentMethod: this.payOrder.PaymentMethod,
            SupplyTime: 20 + common.getRandomNumber(60),
            SupplyMethod: common.getRandomArrayItem(localData.SupplyMethod)
        }
        this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, days: 'random'});
        this._ReceiveProduct = true;
        return this.receiveProduct;
    },
    ServiceAfterSale: function () {
        if (!this._ReceiveProduct) return null; //未收到商品不可售后
        if (this._ServiceAfterSale) return null; //已经售后完毕不可再次售后
        if (this.serviceAfterSale) {
            switch (this.serviceAfterSale.ServiceStatus) {
                case '待审核':
                    this.serviceAfterSale.ServiceStatus = '处理中';
                    this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, hours: 'random'});
                    break;
                case '处理中':
                    this.serviceAfterSale.ServiceStatus = '已完成';
                    this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, hours: 'random'});
                    this._ServiceAfterSale = true;
                    break;
            }
        } else {
            this.serviceAfterSale = {
                OrderID: this.submitOrder.OrderID,
                ProductName: this.submitOrderDetail.ProductName,
                ProductType: this.submitOrderDetail.ProductType,
                ShopName: this.submitOrderDetail.ShowName,
                ProductUnitPrice: this.submitOrder.ProductUnitPrice,
                ProductAmount: this.submitOrderDetail.ProductAmount,
                ProductTotalPrice: this.submitOrderDetail.ProductTotalPrice,
                ProductAllowanceAmount: this.payOrder.AllowanceAmount,
                ProductPaymentAmount: this.payOrder.PaymentAmount,
                PaymentMethod: this.payOrder.PaymentMethod,
                ServiceContent: common.getRandomArrayItem(localData.ServiceContent),
                ServiceStatus: localData.ServiceStatus[0]
            }
            this.LastDateTime = common.nextDateTime({currentDateTime: this.LastDateTime, days: 'random'});
            this._ServiceAfterSale = false;
        }
        return this.serviceAfterSale;
    }
}

BusinessModel.Cache = function () {
    BusinessModel.caches = BusinessModel.caches || [];
    return BusinessModel.caches;
}

BusinessModel.CacheIterator = function (iterator) {
    var cache = BusinessModel.Cache();
    var model = {},
        result = null;
    for (var i = 0, len = cache.length; i < len; i++) {
        model = cache[i];
        result = iterator(model);
        if (result) return result;
    }
    return result;
}

BusinessModel.Signup = function () {
    var cache = BusinessModel.Cache();
    var model = new BusinessModel();
    cache.push(model);
    return model.Signup();
}

BusinessModel.Login = function () {
    var cache = BusinessModel.Cache();
    var model = new BusinessModel();
    cache.push(model);
    return model.Login();
}

BusinessModel.ViewHomePage = function () {
    var cache = BusinessModel.Cache();
    var model = new BusinessModel();
    cache.push(model);
    return model.ViewHomePage();
}
BusinessModel.SearchProduct = function () {
    var cache = BusinessModel.Cache();
    var model = new BusinessModel();
    cache.push(model);
    return model.SearchProduct();
}
BusinessModel.ViewProduct = function () {
    var result = BusinessModel.CacheIterator(function (model) {
        if (!model._ViewProduct) {
            return model.ViewProduct();
        }
    })
    if (result) return result;

    var cache = BusinessModel.Cache();
    var model = new BusinessModel();
    cache.push(model);
    return model.ViewProduct();
}
BusinessModel.SubmitOrder = function () {
    var result = BusinessModel.CacheIterator(function (model) {
        if (!model._SubmitOrder) {
            return model.SubmitOrder();
        }
    })
    return result;
}
BusinessModel.SubmitOrderDetail = function () {
    var result = BusinessModel.CacheIterator(function (model) {
        if (!model._SubmitOrderDetail) {
            return model.SubmitOrderDetail();
        }
    })
    return result;
}
BusinessModel.PayOrder = function () {
    var result = BusinessModel.CacheIterator(function (model) {
        if (!model._PayOrder) {
            return model.PayOrder();
        }
    })
    return result;
}
BusinessModel.PayOrderDetail = function () {
    var result = BusinessModel.CacheIterator(function (model) {
        if (!model._PayOrderDetail) {
            return model.PayOrderDetail();
        }
    })
    return result;
}
BusinessModel.CancelOrder = function () {
    var result = BusinessModel.CacheIterator(function (model) {
        if (!model._CancelOrder) {
            return model.CancelOrder();
        }
    })
    return result;
}
BusinessModel.CancelOrderDetail = function () {
    var result = BusinessModel.CacheIterator(function (model) {
        if (!model._CancelOrderDetail) {
            return model.CancelOrderDetail();
        }
    })
    return result;
}
BusinessModel.ReceiveProduct = function () {
    var result = BusinessModel.CacheIterator(function (model) {
        if (!model._ReceiveProduct) {
            return model.ReceiveProduct();
        }
    })
    return result;
}
BusinessModel.ServiceAfterSale = function () {
    var result = BusinessModel.CacheIterator(function (model) {
        if (!model._ServiceAfterSale) {
            return model.ServiceAfterSale();
        }
    })
    return result;

}

var events = [{
    eventName: 'ViewProduct',
    eventTitle: '浏览商品',
    prevEvent: null,//前置事件
    absoluteEvent: true//必然会发生的事件
}, {
    eventName: 'ViewHomePage',
    eventTitle: '浏览首页',
    prevEvent: 'ViewProduct',
    absoluteEvent: false,

}, {
    eventName: 'SearchProduct',
    eventTitle: '搜索产品'
}, {
    eventName: 'Signup',
    eventTitle: '注册'
}, {
    eventName: 'SubmitOrder',
    eventTitle: '提交订单'
}, {
    eventName: 'SubmitOrderDetail',
    eventTitle: '提交订单细节'
}, {
    eventName: 'PayOrder',
    eventTitle: '支付订单'
}, {
    eventName: 'PayOrderDetail',
    eventTitle: '支付订单细节'
}, {
    eventName: 'ReceiveProduct',
    eventTitle: '收到商品'
}, {
    eventName: 'CancelOrder',
    eventTitle: '取消订单'
}, {
    eventName: 'CancelOrderDetail',
    eventTitle: '取消订单细节'
}, {
    eventName: 'ServiceAfterSale',
    eventTitle: '售后服务'
}, {
    eventName: 'Login',
    eventTitle: '登录'
}];

function TimerToggle() {
    if (BusinessModel.Timer) {
        clearInterval(BusinessModel.Timer);
        delete BusinessModel.Timer;
    } else {
        BusinessModel.Timer = setInterval(function () {
            var rdmExec = Math.round(Math.random()) > 0;
            if (!rdmExec) return;
            var event = events[Math.floor(Math.random() * events.length)];
            var params = BusinessModel[event.eventName]();

            //如果params不为空，则发送
            console.log(params);

            if (params) {
                bas.track(event.eventName, params);
            }

        }, 1000);
    }
}