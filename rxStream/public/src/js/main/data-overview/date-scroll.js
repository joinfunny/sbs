// 
define([
    'AppPage/Utils/Date'
], function (Date) {

    function DateScroll() {
    }

    // 原型
    DateScroll.prototype = _.create(EventEmitter.prototype, {
        'constructor': DateScroll
    });
    $.extend(DateScroll.prototype, {
        root: null,
        currentDate: null, //当前日期可操作
        domDateStr: null, //dom显示的日期格式
        dateFormat: 'yyyy-MM-dd',
        init: function (ops) {
            this.root = ops.root;
            this.setDate();
            this.bindHandleEvent();
            //事件委托在上级元素上
            this.root.on('click', this.handleEvent);
            return this;
        },
        setDate: function (i) {
            var dateStr, w, date = new Date();
            if (i) {
                var domDate = new Date(this.currentDate);
                domDate.setDate(domDate.getDate() + i);
                dateStr = domDate.format(this.dateFormat);
                w = this.parsDay(domDate.getDay());
                if (domDate.getTime() >= new Date(date.format(this.dateFormat)).getTime()) {
                    $('.time-right', this.root).addClass('current-date');
                } else {
                    $('.time-right', this.root).removeClass('current-date');
                }
            } else {
                dateStr = date.format(this.dateFormat);
                w = this.parsDay(date.getDay());
            }
            this.domDateStr = dateStr + '-星期' + w;
            this.currentDate = dateStr;
            this.dateDomRefresh();
            return this;
        },
        dateDomRefresh: function () {
            $('.date-text', this.root).html(this.domDateStr);
        },
        // 事件函数统一路由
        handleEvent: function (e) {
            switch (e.type) {
                case 'click':
                    this.click(e);
                    break;
                default:
            }
        },
        click: function (e) {
            var role = e.target.getAttribute('role');
            switch (role) {
                case 'dateLeftScroll':
                    this.leftClick(e);
                    break;
                case 'dateRightScroll':
                    this.rightClick(e);
                    break;
            }
        },
        leftClick: function (e) {
            this.setDate(-1);
        },
        rightClick: function (e) {
            var $target = $(e.target);
            if (!$target.hasClass('current-date')) {
                this.setDate(1);
            }
        },
        parsDay: function (day) {
            var dayStr = ['日', '一', '二', '三', '四', '五', '六'];
            return dayStr[day];
        }
    });
    // 静态成员
    $.extend(DateScroll, {
        dateScroll: null,
        options: null,
        //
        create: function (opts) {
            return new DateScroll().init(opts);
        },
        //{root:要插入日期的DOM(jquery对像）, left:leftCallback, right:rightCallback}
        init: function (ops) {
            DateScroll.options = ops;
            DateScroll.createDom();
            DateScroll.dateScroll = DateScroll.create(ops);
        },
        createDom: function () {
            var oDiv = $('<div></div>');
            oDiv.html('<span class="time-move time-left" role="dateLeftScroll"></span>' +
            '<span class="date-text"></span>' +
            '<span class="time-move time-right current-date" role="dateRightScroll"></span>');
            DateScroll.options.root.prepend(oDiv);
        }
    });

    return DateScroll;

})
;