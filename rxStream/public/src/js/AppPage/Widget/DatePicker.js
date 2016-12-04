// 
define([
        'AppPage/Utils/Date'
    ],
    function (Date) {
        var document = window.document,
            HTML = document.documentElement;

        // 获取元素页面坐标位置
        function getRectCoord(elem) {
            var oy = window.pageYOffset - HTML.clientTop;
            var ox = window.pageXOffset - HTML.clientLeft;
            var rectCoord = elem.getBoundingClientRect();
            return {
                top: rectCoord.top - oy,
                right: rectCoord.right - ox,
                bottom: rectCoord.bottom - oy,
                left: rectCoord.left - ox,
                originalRectCoord: rectCoord
            }
        }

        // 类构造函数
        function DatePicker() {
        }

        // 原型
        DatePicker.prototype = _.create(EventEmitter.prototype, {
            'constructor': DatePicker
        });

        // 原型扩展
        _.extend(DatePicker.prototype, {

            root: null, // 日期选择器根元素
            trigger: null, // 触发日期选择器的元素
            calendarType: null, //触发日历类型 range 区间双日历 normal 普通单日历
            doc: null, // 文档对象
            docRoot: null, // 文档根元素式

            // 初始化
            init: function init(root, options) {
                options && _.extend(this, options);
                this.bindHandleEvent();
                this.setRoot(root) || this.setRootDefer(root);
                return this;
            },

            // 设置委托元素
            setRoot: function (root) {
                root = $(root)[0] || this.createRoot();
                if (!root) return;
                this.root = root;
                this.doc = document;
                this.docRoot = HTML;
                $(this.root).on('click', this.handleEvent);
                this.renderDefer = Promise.resolve(root);
                return this.root;
            },

            createRoot: function () {
                return $(DatePicker.TEMPLATE)[0];
            },

            render: function () {
                document.body.appendChild(this.root);
                this.setDate();
                this.showDateCustomRange();
                this.initDateRangeType();
                this.setPosition();
                this.isOpening = EventEmitter.returnTrue;
                $(window).on('resize', this.handleEvent);
            },
            //init date dom
            setDate: function () {
                var dateArr = this.trigger.value.split(this.dateRangeHyphen);
                this.initCalendar(dateArr);
            },

            //初始相对日期样式
            initDateRangeType: function () {
                var type = this.trigger.dataset.range;
                this.removeDateCurrent();
                if (type !== 'custom') {
                    var target = $('[role="' + this.trigger.dataset.range + '"]', this.root);
                    target.addClass('current');
                    target.parents('.date-range-page').hasClass('related-date') && $('[role="tabRelativeDate"]', this.root).trigger('click');
                } else {
                    $('.custom-date-picker', this.root).is(':hidden') && $('[role="customDateRangeBtn"]', this.root).trigger('click');
                }
            },

            // 定位日历
            setPosition: function () {
                this.clearSetPositionTimeout();
                var that = this,
                    body = document.body,
                    bodyWidth = body.clientWidth,
                    bodyHeight = body.clientHeight,
                    triggerCoord = getRectCoord(this.trigger),
                    rootCoord = getRectCoord(this.root),
                    rootHeight = rootCoord.bottom - rootCoord.top,
                    rootWidth = rootCoord.right - rootCoord.left,
                    top = 'auto',
                    right = 'auto',
                    bottom = 'auto',
                    left = 'auto';

                if (bodyWidth > triggerCoord.left + rootWidth) {
                    left = triggerCoord.left + 'px';
                } else {
                    left = (triggerCoord.right - rootWidth) + 'px';
                }
                if (bodyHeight > triggerCoord.bottom + 1 + rootHeight) {
                    top = (triggerCoord.bottom + 1) + 'px';
                } else {
                    top = (triggerCoord.top - 1 - rootHeight) + 'px';
                }
                $(this.root).css({
                    top: top,
                    right: right,
                    bottom: bottom,
                    left: left
                });

                this.setPositionTimeoutId = setTimeout((function () {
                    this.setPosition();
                }).bind(this), 1000);
            },

            // 位置设置定时器标识
            setPositionTimeoutId: null,

            // 清除位置设置定时器
            clearSetPositionTimeout: function () {
                clearTimeout(this.setPositionTimeoutId);
                delete this.setPositionTimeoutId;
            },

            open: function (trigger) {
                this.trigger = trigger;
                this.initTrigger();
				this.beforeRender();
				this.emit('beforeRender');
                this.renderDefer.then(this.render.bind(this));
                return this;
            },

            dateFormat: 'yyyy-MM-dd',
            dateRangeHyphen: '至',
            dateRange: 'week',

            initTrigger: function () {
                var trigger = this.trigger,
                    dataset = trigger.dataset,
					beforeRender = dataset.beforeRender,
                    datePickerBeforeRender = dataset.datePickerBeforeRender;

//                if (datePickerBeforeRender && (datePickerBeforeRender = Object.ns(datePickerBeforeRender))) {
//                    if (datePickerBeforeRender(this) === false) {
//                        return;
//                    }
//                }

                switch (this.calendarType = dataset.type) {
                    // 若为时间跨度
                    case 'date-range':
                    case 'date-range-start':
                        this.dateFormat = dataset.format || DatePicker.DATE_FORMAT;
                        this.dateRangeHyphen = dataset.rangeHyphen || DatePicker.DATE_RANGE_HYPHEN;
                        this.dateRange = dataset.range || DatePicker.DATE_RANGE;
                        break;
                }
				
            },
			
            beforeRender: function () {
				var beforeRender = this.trigger.dataset.beforeRender;
				if(beforeRender){
					this.on('beforeRender', beforeRender);
				}
            },

            renderDefer: null,

            // 异步加载并创建日历组建的元素
            setRootDefer: function (root) {
                return this.renderDefer = this.createRootDefer().then(this.setRoot.bind(this));
            },

            rootUrl: __path + '/ui/date-picker.html',
            //
            createRootDefer: function () {
                return fetch(this.rootUrl)
                    .then(function (res) {
                        if (res.ok) {
                            return res.text().then(function (data) {
                                return $(data.trim())[0];
                                //console.log(data.entries());
                            });
                        } else {
                            console.log("Looks like the response wasn't perfect, got status", res.status)
                        }
                    }, function (e) {
                        console.log("Fetch failed!", e);
                    });
            },

            openDefer: function () {
                return this.renderDefer.then(function (that) {
                    that.render();
                    return that;
                })
            },

            // 事件函数统一路由
            handleEvent: function (e) {
                switch (e.type) {
                    case 'click':
                        this.click(e);
                        break;
                    case 'mousedown':
                        this.mousedown(e);
                        break;
                    case 'resize':
                        this.resize(e);
                        break;
                    default:
                }
            },

            // 事件委托在窗口
            resize: function (e) {
                //this.setPosition();
            },

            // 事件委托在文档元素上
            mousedown: function (e) {
                if (this.root !== e.target && !$.contains(this.root, e.target)) {
                    this.close(e);
                }
            },

            // 事件委托在选择器的根元素上
            click: function (e) {
                var role = e.target.getAttribute('role');
                switch (role) {
                    case 'tabNaturalDate':
                    case 'tabRelativeDate':
                        this.tabDateRangePage(e, role);
                        break;
                    case 'today':
                        this.today(e)
                        break;
                    case 'yesterday':
                        this.yesterday(e)
                        break;
                    case 'thisWeek':
                        this.thisWeek(e)
                        break;
                    case 'lastWeek':
                        this.lastWeek(e)
                        break;
                    case 'thisMonth':
                        this.thisMonth(e)
                        break;
                    case 'lastMonth':
                        this.lastMonth(e)
                        break;
                    case 'thisQuarter':
                        this.thisQuarter(e)
                        break;
                    case 'lastQuarter':
                        this.lastQuarter(e)
                        break;
                    case 'thisYear':
                        this.thisYear(e)
                        break;
                    case 'lastYear':
                        this.lastYear(e)
                        break;
                    case 'last7day':
                        this.last7day(e)
                        break;
                    case 'last30day':
                        this.last30day(e)
                        break;
                    case 'last90day':
                        this.last90day(e)
                        break;
                    case 'last180day':
                        this.last180day(e)
                        break;
                    case 'last365day':
                        this.last365day(e)
                        break;
                    case 'customDateRangeBtn':
                        this.customDateRange(e)
                        break;
                    case 'toPrevYear':
                        this.toPrevYear(e)
                        break;
                    case 'toPrevMonth':
                        this.toPrevMonth(e)
                        break;
                    case 'toNextYear':
                        this.toNextYear(e)
                        break;
                    case 'toNextMonth':
                        this.toNextMonth(e)
                        break;

                    default:
                        switch (e.target.tagName) {
                            case 'TD':
                                this.selectTdDay(e);
                        }
                }
            },

            activedClass: 'actived',
            dateRangePage$: '.date-range-page',
            //
            tabDateRangePage: function (e) {
                var $target = $(e.target),
                    activedClass = this.activedClass,
                    index;
                if (!$target.hasClass(activedClass)) {
                    $target.siblings().removeClass(activedClass);
                    index = $target.addClass(activedClass).index();
                    $(this.dateRangePage$, this.root).removeClass(activedClass).eq(index).addClass(activedClass);
                }
            },

            setTriggerChange: function () {
                $(this.trigger).trigger('change');
                //this.setDate();
                this.close();
            },

            setTriggerDateRange: function (diffStartDate, diffEndDate) {

                DatePicker.setTriggerDateRangeByDifferenceDays(this.trigger, this.dateFormat, this.dateRangeHyphen, diffStartDate, diffEndDate);

                this.setTriggerChange();
            },

            // 表格单元格选取日期
            selectTdDay: function (e) {
                var $target = $(e.target);
                if ($target.hasClass('date-disabled')) {
                    return;
                }
                var arr = this.trigger.value.split(this.dateRangeHyphen);
                //console.log(arr)
                if ($target.parents('.start-date-picker').length) {
                    arr[0] = $target.attr('data-date');
                } else {
                    arr[1] = $target.attr('data-date');
                }
                this.trigger.value = this.changeRang(arr);
                $(this.trigger).attr({'data-range-text': null, 'data-range': 'custom'});
                if (this.calendarType === 'date-range') {
                    this.removeDateCurrent();
                    this.isCustomDate = true;
                }
                this.setTriggerChange();
            },

            today: function (e) {
                this.setDateCurrent(e);
                this.setTriggerDateRange();
            },

            //
            yesterday: function (e) {
                this.setDateCurrent(e);
                this.setTriggerDateRange(-1, -1);
            },
            thisWeek: function (e) {
                var y = -(new Date().getDay());
                y && y++;
                this.setDateCurrent(e);
                this.setTriggerDateRange(y);
            },

            //
            lastWeek: function (e) {
                var now = new Date();
                var end = -now.getDay();
                var start = end - 6;
                this.setDateCurrent(e);
                this.setTriggerDateRange(start, end);
            },

            //
            thisMonth: function (e) {
                var start = -(new Date().getDate() - 1);
                this.setDateCurrent(e);
                this.setTriggerDateRange(start);
            },

            //
            lastMonth: function (e) {
                var now = new Date();
                var end = -now.getDate();
                now.setDate(now.getDate() + end);
                // var start = end - Date.getDaysByMonth(now.getMonth()) + 1;
                var start = -(now.getDate() - end - 1);
                this.setDateCurrent(e);
                this.setTriggerDateRange(start, end);
            },

            //
            thisQuarter: function (e) {
                this.setDateCurrent(e);
                this.setTriggerDateRange(-(new Date().getQuarterDate() - 1));
            },

            //
            lastQuarter: function (e) {
                var now = new Date();
                var end = -now.getQuarterDate();
                now.setDate(now.getDate() + end);
                var start = -now.getQuarterDate() + end + 1;
                this.setDateCurrent(e);
                this.setTriggerDateRange(start, end);
            },

            //
            thisYear: function (e) {
                this.setDateCurrent(e);
                this.setTriggerDateRange(-(new Date().getYearDate() - 1));
            },

            //
            lastYear: function (e) {
                var now = new Date();
                var end = -now.getYearDate();
                now.setFullYear(now.getFullYear() - 1);
                var start = -now.getYearDays() + end + 1;
                this.setDateCurrent(e);
                this.setTriggerDateRange(start, end);
            },

            //
            last7day: function (e) {
                this.setDateCurrent(e);
                this.setTriggerDateRange(-7);
            },

            //
            last30day: function (e) {
                this.setDateCurrent(e);
                this.setTriggerDateRange(-30);
            },

            //
            last90day: function (e) {
                this.setDateCurrent(e);
                this.setTriggerDateRange(-90);
            },

            //
            last180day: function (e) {
                this.setDateCurrent(e);
                this.setTriggerDateRange(-180);
            },

            //
            last365day: function (e) {
                this.setDateCurrent(e);
                this.setTriggerDateRange(-365);
            },

            //
            customDateRange: function (e) {
                this.switchCustomRange();
            },

            //
            toPrevYear: function (e) {
                this.initCalendar(this.setDateRange(e, 'prevYear'));
            },

            //
            toPrevMonth: function (e) {
                this.initCalendar(this.setDateRange(e, 'prevMonth'));
            },

            //
            toNextYear: function (e) {
                !$(e.target).hasClass('disable') && this.initCalendar(this.setDateRange(e, 'nextYear'));
            },

            //
            toNextMonth: function (e) {
                !$(e.target).hasClass('disable') && this.initCalendar(this.setDateRange(e, 'nextMonth'));
            },

            isOpening: EventEmitter.returnFalse,

            // init calendar dom
            initCalendar: function (dataRange) {
                var type, that = this;
                var triggerValue = this.trigger.value.split(this.dateRangeHyphen);
                var toDate = new Date(new Date().format(this.dateFormat));
                var aRange = dataRange.map(function (item) {
                    if (new Date(item).getTime() > toDate.getTime()) {
                        return toDate.format(that.dateFormat);
                    } else {
                        return item;
                    }
                });
                var start = new Date(aRange[0]);
                var end = new Date(aRange[1]);
                this.setCalendarView();
                aRange.forEach(function (item, i) {
                    i == 0 ? type = 'start' : type = 'end';
                    if (!item) {
                        return;
                    }
                    var dateObj = new Date(item);
                    var $root = $('.' + type + '-date-picker');
                    var year = dateObj.getFullYear();
                    var month = dateObj.getMonth() + 1;
                    var day = dateObj.getDate();
                    var lastDays = month == 1 ? 31 : Date.getDaysByMonth(month - 1);
                    var days = Date.getDaysByMonth(month, Date.isLeapYear(year));
                    dateObj.setDate(1);
                    var firstWeek = dateObj.getDay();
                    var h = 1;
                    $('.date-picker-header', $root).html(month + '月&nbsp' + year).attr('data-date', year + '-' + month + '-' + day);
                    $('td', $root).attr('class', '').each(function (i) {
                        var dateNum = 0,
                            monthState, currentDate, currentYear, currentMonth;
                        if (i < firstWeek) {
                            dateNum = lastDays - firstWeek + i + 1;
                            $(this).addClass('last-m');
                            monthState = -1;
                        } else if (i >= firstWeek && h <= days) {
                            dateNum = h++;
                            $(this).addClass('current-m');
                            monthState = 0;
                        } else if (h > days) {
                            dateNum = i - days - firstWeek + 1;
                            $(this).addClass('prev-m');
                            monthState = 1;
                        }
                        $(this).html(dateNum);
                        switch (monthState) {
                            case -1:
                                currentYear = month == 1 ? year - 1 : year;
                                currentMonth = month == 1 ? 12 : month - 1;
                                break;
                            case 0:
                                currentYear = year;
                                currentMonth = month;
                                break;
                            case 1:
                                currentYear = month == 12 ? +year + 1 : year;
                                currentMonth = month == 12 ? 1 : month + 1;
                                break;
                        }
                        currentDate = new Date(currentYear + '-' + (currentMonth < 10 ? '0' + currentMonth : currentMonth) + '-' + (dateNum < 10 ? '0' + dateNum : dateNum));
                        $(this).attr('data-date', currentDate.format(that.dateFormat));
                        currentDate.getTime() == toDate.getTime() && $(this).addClass('today');
                        currentDate.getTime() > toDate.getTime() && $(this).addClass('date-disabled');
                        (type === 'end' && currentDate.getTime() < start.getTime()) && $(this).addClass('date-disabled');
                        if (this.calendarType == 'date-range' && (currentDate.getTime() >= start.getTime() && currentDate.getTime() <= end.getTime())) {
                            $(this).addClass('in-range');
                        }
                    });
                    $('td[data-date="' + (type === 'start' ? triggerValue[0] : triggerValue[1]) + '"]', $root).addClass(type + '-date');
                    that.setNextDisable(dateObj, $root);
                });
            },

            //单日历，区间日历显示设置
            setCalendarView: function () {
                switch (this.calendarType) {
                    case 'date-range':
                        $(this.root).removeClass('show-normal').addClass('show-date-range-picker');
                        break;
                    case 'date-range-start':
                        $(this.root).addClass('show-normal').removeClass('show-date-range-picker');
                        break;
                }
            },
            //点击日历时设置区间日期
            changeRang: function (rangArr) {
                var start = new Date(rangArr[0]);
                var end = new Date(rangArr[1]);
                var toDate = new Date(new Date().format(this.dateFormat));
                if (start.getTime() > end.getTime() || this.calendarType == 'date-range-start') {
                    end = new Date(start.format(this.dateFormat));
                    end.setDate(end.getDate() + this.getRangeDay());
                }
                return [start.format(this.dateFormat), end.getTime() > toDate.getTime() ? toDate.format(this.dateFormat) : end.format(this.dateFormat)].join(this.dateRangeHyphen);
            },
            //获取日期范围天数
            getRangeDay: function () {
                var dateRange = this.trigger.dataset.dateRange;

                var dateArr = this.trigger.value.split(this.dateRangeHyphen);
                var start = new Date(dateArr[0]);
                var end = new Date(dateArr[1]);
                return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            },
            //set date range
            setDateRange: function (e, type) {
                var $target = $(e.target);
                var dateRange = [$('.date-picker-header', '.start-date-picker').attr('data-date'),
                    $('.date-picker-header', '.end-date-picker').attr('data-date')
                ];
                var dateObj = new Date($target.parents('.date-ctrl').siblings('.date-picker-header').attr('data-date'));
                switch (type) {
                    case 'prevYear':
                        dateObj.setFullYear(dateObj.getFullYear() - 1);
                        break;
                    case 'prevMonth':
                        dateObj.setMonth(dateObj.getMonth() - 1);
                        break;
                    case 'nextYear':
                        dateObj.setFullYear(dateObj.getFullYear() + 1);
                        break;
                    case 'nextMonth':
                        dateObj.setMonth(dateObj.getMonth() + 1);
                        break;
                }
                if ($target.parents('.start-date-picker').length) {
                    dateRange[0] = dateObj.format(this.dateFormat);
                } else {
                    dateRange[1] = dateObj.format(this.dateFormat);
                }
                return dateRange;
            },
            setNextDisable: function (d, target) {
                var currentYear = new Date(d.format(this.dateFormat));
                var currentMonth = new Date(d.format(this.dateFormat));
                var toDate = new Date(new Date().format(this.dateFormat));
                currentYear.setFullYear(currentYear.getFullYear() + 1);
                currentMonth.setMonth(currentYear.getMonth() + 1);
                (currentYear.getTime() > toDate.getTime()) ? $('.next-year', target).addClass('disable') : $('.next-year', target).removeClass('disable');
                (currentMonth.getTime() > toDate.getTime()) ? $('.next-month', target).addClass('disable') : $('.next-month', target).removeClass('disable');
            },
            showDateCustomClass: 'show-custom-date-picker',
            isCustomDate: false, //是否显示日历 默认不显示
            //是否显示日期区间
            showDateCustomRange: function () {
                this.isCustomDate ? $(this.root).addClass(this.showDateCustomClass) : $(this.root).removeClass(this.showDateCustomClass);
            },
            //设置自然时间和相对时间点击样式
            setDateCurrent: function (e) {
                this.removeDateCurrent();
                $(e.target).addClass('current');
                $(this.root).removeClass(this.showDateCustomClass);
                $(this.trigger).attr({'data-range-text': $(e.target).html(), 'data-range': $(e.target).attr('role')});
                delete this.isCustomDate;
            },
            //移除自然时间和相对时间点击样式
            removeDateCurrent: function () {
                $('.date-range-pages li', this.root).removeClass('current');
            },
            //自定义日期切换
            switchCustomRange: function () {
                $(this.root).toggleClass(this.showDateCustomClass);
                this.root.style.cssText = '';
                this.setPosition();
            },

            // 关闭
            close: function (e) {
                this.emit('close', e);
                this.reset();
            },
            //
            reset: function (e) {
                this.root.style.cssText = '';
                this.clearSetPositionTimeout();
                $(window).off('resize', this.handleEvent);
                $(this.root).detach();
                $(this).off();
                delete this.trigger;
                delete this.isOpening;
            }
        });

        // 静态成员
        _.extend(DatePicker, {
            // 日期选择器实例
            _datePicker: null,
            //
            create: function (root, options) {
                return new DatePicker().init(root, options);
            },

            // 触发元素的选择器数组
            _arrTrigger$: ['input[data-type^="date"]'], // date|datetime|date-range|date-range-start

            // 触发元素的选择器
            _trigger$: '',

            // 设置触发元素的选择器
            setTrigger$: function () {
                DatePicker._trigger$ = DatePicker._arrTrigger$.join(',');
            },

            // 添加触发元素的选择器
            addTrigger$: function (trigger$) {
                var arr = DatePicker._arrTrigger$,
                    i;
                if (trigger$ && typeof trigger$ === 'string' && arr.indexOf(trigger$) < 0) {
                    arr.push(trigger$);
                    DatePicker.setTrigger$();
                }
            },

            // 删除触发元素的选择器
            removeTrigger$: function (trigger$) {
                var arr = DatePicker._arrTrigger$,
                    i;
                if (trigger$ && typeof trigger$ === 'string' && (i = arr.indexOf(trigger$)) > -1) {
                    arr.splice(i, 1);
                    DatePicker.setTrigger$();
                }
            },

            // 打开日期选择器
            open: function (trigger, options) {
                return DatePicker.create(null, options).open(trigger);
            },

            // 初始化配置日期选择触发器
            init: function (trigger$) {
                if (!DatePicker._datePicker) {
                    DatePicker.setTrigger$();
                    $(document).on('mousedown focusin', DatePicker.handleEvent);
                }
                DatePicker.addTrigger$(trigger$);
                //DatePicker.initTriggers();
            },

            // 初始化时间选择控件集合
            setTriggers: function () {
                $(DatePicker._trigger$).each(function () {
                    DatePicker.setTrigger(this);
                })
            },

            // 初始化时间选择控件
            setTrigger: function (trigger) {
                var value = trigger.value.trim(),
                    dataset,
                    dateType;

                if (!value) {
                    dataset = trigger.dataset;
                    dateType = dataset.type;
                    switch (dateType) {
                        case 'date-range':
                        case 'date-range-start':
                            DatePicker.setTriggerDefinedDateRange(trigger);
                            break;
                    }
                }
            },

            // 通过元素定义的时间跨度设置值
            setTriggerDefinedDateRange: function (trigger) {

                var dataset = trigger.dataset,
                    dateRangeWord = dataset.range || (dataset.range = DatePicker.DATE_RANGE),
                    dateFormat = dataset.format || (dataset.format = DatePicker.DATE_FORMAT),
                    dateRangeHyphen = dataset.rangeHyphen || (dataset.rangeHyphen = DatePicker.DATE_RANGE_HYPHEN),
                    dateRangeStr = DatePicker.definedDateRangeWord(dateRangeWord, dateFormat, dateRangeHyphen);

                trigger.value = dateRangeStr;
            },

            // 定义时间跨度词，返回时间格式的字符串
            // return date range string
            definedDateRangeWord: function (dateRangeWord, dateFormat, dateRangeHyphen) {

                var now = new Date(),
                    start = new Date(),
                    end = new Date(),
                    diffStartDate = 0,
                    diffEndDate = 0;

                dateFormat || (dateFormat = DatePicker.DATE_FORMAT);
                dateRangeHyphen || (dateRangeHyphen = DatePicker.DATE_RANGE_HYPHEN);

                switch (dateRangeWord) {
                    case 'today':
                        diffStartDate = 0;
                        break;
                    case 'yesterday':
                        diffStartDate = -1;
                        diffEndDate = -1;
                        break;
                    case 'thisWeek':
                        (diffStartDate = -start.getDay()) && diffStartDate++;
                        break;
                    case 'lastWeek':
                        diffEndDate = -end.getDay();
                        diffStartDate = diffEndDate - 6;
                        break;
                    case 'thisMonth':
                        diffStartDate = -start.getDate() + 1;
                        break;
                    case 'lastMonth':
                        diffEndDate = -end.getDate();
                        now.setMonth(now.getMonth() - 1);
                        diffStartDate = -now.getMonthDays() + 1 + diffEndDate;
                        break;
                    case 'thisQuarter':
                        diffStartDate = -start.getQuarterDate() + 1;
                        break;
                    case 'lastQuarter':
                        diffEndDate = -end.getQuarterDate();
                        now.setDate(diffEndDate + now.getDate());
                        diffStartDate = -now.getQuarterDate() + diffEndDate + 1;
                        break;
                    case 'thisYear':
                        diffStartDate = -start.getYearDate() + 1;
                        break;
                    case 'lastYear':
                        diffEndDate = -end.getYearDate();
                        now.setFullYear(now.getFullYear() - 1);
                        diffStartDate = -now.getYearDays() + diffEndDate + 1;
                        break;
                    case 'last7day':
                        diffStartDate = -7;
                        break;
                    case 'last30day':
                        diffStartDate = -30;
                        break;
                    case 'last90day':
                        diffStartDate = -90;
                        break;
                    case 'last180day':
                        diffStartDate = -180;
                        break;
                    case 'last365day':
                        diffStartDate = -365;
                        break;
                }
                start.setDate(start.getDate() + diffStartDate);
                end.setDate(end.getDate() + diffEndDate);

                return start.format(dateFormat) + dateRangeHyphen + end.format(dateFormat);
            },

            // 获取元素时间跨度格式值
            // return Date String Array
            getTriggerDateRange: function (trigger) {
                return DatePicker._getTriggerDateRange(trigger);
            },

            // 获取元素时间跨度对象
            // return Date Object Array
            getTriggerDateObjectRange: function (trigger) {
                return DatePicker._getTriggerDateRange(trigger, true);
            },

            // 获取元素时间跨度
            // @isDateObject boolean
            // return (Date String|Date Object) Array
            _getTriggerDateRange: function (trigger, isDateObject) {

                var dataset = trigger.dataset,
                    dateType = dataset.type,
                    dateFormat,
                    dateRangeHyphen;

                switch (dateType) {
                    case 'date-range':
                    case 'date-range-start':
                        dateRangeHyphen = dataset.rangeHyphen || DatePicker.DATE_RANGE_HYPHEN;
                        dataRange = trigger.value.split(dateRangeHyphen);
                        if (isDateObject) {
                            dateFormat = dataset.format || DatePicker.DATE_FORMAT;
                            return dataRange.map(function (date) {
                                return Date.parse2Date(date, dateFormat);
                            });
                        }
                        return dataRange;
                        break;
                }
            },

            // 通过时间格式值，设置元素的时间跨度值
            setTriggerDateRange: function (trigger, startDate, endDate) {
                DatePicker._setTriggerDateRange(trigger, startDate, endDate);
            },

            // 通过时间对象，设置元素的时间跨度值
            setTriggerDateObjectRange: function (trigger, startDate, endDate) {
                DatePicker._setTriggerDateRange(trigger, startDate, endDate, true);
            },

            // 设置元素的时间跨度值
            _setTriggerDateRange: function (trigger, startDate, endDate, isDateObject) {

                var dataset = trigger.dataset,
                    dateType = dataset.type,
                    dateRangeHyphen,
                    dateFormat;

                switch (dateType) {
                    case 'date-range':
                    case 'date-range-start':
                        dateRangeHyphen = dataset.rangeHyphen || DatePicker.DATE_RANGE_HYPHEN;
                        if (isDateObject) {
                            dateFormat = dataset.format;
                            startDate = startDate.format(dateFormat);
                            endDate = endDate.format(dateFormat);
                        }
                        trigger.value = startDate + dateRangeHyphen + endDate;
                        break;
                }
            },

            // 初始化时间跨度值
            initTriggerDateRange: function (trigger) {

                var dataset = trigger.dataset,
                    dateType = dataset.type,
                    dateFormat = dataset.format || DatePicker.DATE_FORMAT,
                    dateRangeHyphen = dataset.rangeHyphen || DatePicker.DATE_RANGE_HYPHEN,
                    dateRange = dataset.range || DatePicker.DATE_RANGE,
                    now = new Date(),
                    diffStartDate;

                switch (dateRange) {
                    // case 分支都是相对时间
                    case 'day':
                        diffStartDate = -1;
                        break;
                    case 'week':
                        diffStartDate = -(now.getDay() - 1);
                        break;
                    case 'month':
                        diffStartDate = -now.getDate();
                        break;
                    default:
                        // 过去的绝对时间
                        diffStartDate = -(parseInt(dateRange) || 0);
                }

                DatePicker.setTriggerDateRangeByDifferenceDays(trigger, dateFormat, dateRangeHyphen, diffStartDate);
            },

            // 通过起止时间的天数差设置时间跨度值
            setTriggerDateRangeByDifferenceDays: function (trigger, dateFormat, dateRangeHyphen, diffStartDate, diffEndDate) {

                var start = new Date(),
                    end = new Date();

                dateFormat || (dateFormat = DatePicker.DATE_FORMAT);
                dateRangeHyphen || (dateRangeHyphen = DatePicker.DATE_RANGE_HYPHEN);

                if (typeof diffStartDate === 'number') {
                    start.setDate(start.getDate() + diffStartDate);
                }
                if (typeof diffEndDate === 'number') {
                    end.setDate(end.getDate() + diffEndDate);
                }

                trigger.value = start.format(dateFormat) + dateRangeHyphen + end.format(dateFormat);
            },

            handleEvent: function (e) {
                switch (e.type) {
                    case 'mousedown':
                        DatePicker.mousedown(e);
                        break;
                    case 'focusin':
                        DatePicker.focusin(e);
                        break;
                    case 'focusout':
                        DatePicker.focusout(e);
                        break;
                }
            },

            // 文档按下事件
            mousedown: function (e) {
                var target = e.target,
                    trigger$ = DatePicker._trigger$,
                    datePicker = DatePicker._datePicker,
                    trigger,
                    root;

                // 若元素匹配触发器选择器
                if (target.matches(trigger$)) {
                    // 若还未创建实例
                    if (!datePicker) {
                        datePicker = DatePicker._datePicker = DatePicker.create();
                    }
                    // 若不为当前触发器
                    if (target !== datePicker.trigger) {
                        datePicker.open(target);
                        $(document).on('focusout', DatePicker.handleEvent);
                    }
                }
                // 若已实例化
                else if (datePicker) {
                    // 若实例已打开并且事件目标元素不包含在内
                    if (datePicker.isOpening() && datePicker.root !== target && !$.contains(datePicker.root, target)) {
                        $(document).off('focusout', DatePicker.handleEvent);
                        datePicker.close();
                    }
                }
            },

            // 文档聚焦事件
            focusin: function (e) {
                this.mousedown(e);
            },

            // 文档失焦事件
            focusout: function (e) {
                var datePicker = DatePicker._datePicker;

                if (datePicker && datePicker.isOpening()) {
                    //datePicker.close();
                }
            },

            DATE_RANGE_HYPHEN: '至',
            DATE_FORMAT: 'yyyy-MM-dd',
            DATETIME_FORMAT: 'yyyy-MM-dd hh:mm:ss SSS',
            DATE_RANGE: 'thisWeek',

            TEMPLATE: ['<div class="panel-date-picker show-range-picker show-custom-date-picker">',
                '<!-- 时间跨度 -->',
                '<div class="date-range-picker" role="dateRangePicker">',
                '<ul class="date-range-tabs">',
                '<li class="date-range-tab actived" role="tabNaturalDate">自然时间</li>',
                '<li class="date-range-tab" role="tabRelativeDate">相对时间</li>',
                '</ul>',
                '<div class="date-range-pages">',
                '<div class="date-range-page natural-date actived" role="naturalDate">',
                '<ul>',
                '<li role="today">今天</li>',
                '<li role="yesterday">昨天</li>',
                '<li class="current" role="thisWeek">本周</li>',
                '<li role="lastWeek">上周</li>',
                '<li role="thisMonth">本月</li>',
                '<li role="lastMonth">上月</li>',
                '<li role="thisQuarter">本季度</li>',
                '<li role="lastQuarter">上季度</li>',
                '<li role="thisYear">本年度</li>',
                '<li role="lastYear">上年度</li>',
                '</ul>',
                '</div>',
                '<div class="date-range-page related-date" role="naturalDate">',
                '<ul>',
                '<li role="last7day">过去7天</li>',
                '<li role="last30day">过去30天</li>',
                '<li role="last90day">过去90天</li>',
                '<li role="last180day">过去180天</li>',
                '<li role="last365day">过去365天</li>',
                '</ul>',
                '</div>',
                '</div>',
                '<button type="button" class="btn-custom-range" role="customDateRangeBtn">自定义区间</button>',
                '</div>',
                '<!-- 自定义时间 -->',
                '<div class="custom-date-picker custom-date-range" role="customDatePicker">',
                '<div class="date-picker start-date-picker" role="startDatePicker">',
                '<ul class="date-ctrl">',
                '<li class="prev-year" role="toPrevYear" title="上一年"></li>',
                '<li class="prev-month" role="toPrevMonth" title="上个月"></li>',
                '<li class="next-year" role="toNextYear" title="下一年"></li>',
                '<li class="next-month" role="toNextMonth" title="下个月"></li>',
                '</ul>',
                '<div class="date-picker-header" role="datePickerHeader">八月 2015</div>',
                '<div class="date-picker-body">',
                '<table width="100%" border="1">',
                '<thead>',
                '<tr>',
                '<th>日</th>',
                '<th>一</th>',
                '<th>二</th>',
                '<th>三</th>',
                '<th>四</th>',
                '<th>五</th>',
                '<th>六</th>',
                '</tr>',
                '</thead>',
                '<tbody>',
                '<tr>',
                '<td>25</td>',
                '<td>26</td>',
                '<td>27</td>',
                '<td>28</td>',
                '<td>29</td>',
                '<td>30</td>',
                '<td>31</td>',
                '</tr>',
                '<tr>',
                '<td>1</td>',
                '<td>2</td>',
                '<td>3</td>',
                '<td>4</td>',
                '<td>5</td>',
                '<td>6</td>',
                '<td>7</td>',
                '</tr>',
                '<tr>',
                '<td>8</td>',
                '<td>9</td>',
                '<td>10</td>',
                '<td>11</td>',
                '<td>12</td>',
                '<td>13</td>',
                '<td>14</td>',
                '</tr>',
                '<tr>',
                '<td>15</td>',
                '<td>16</td>',
                '<td>17</td>',
                '<td>18</td>',
                '<td>19</td>',
                '<td>20</td>',
                '<td>21</td>',
                '</tr>',
                '<tr>',
                '<td>22</td>',
                '<td>23</td>',
                '<td>24</td>',
                '<td>25</td>',
                '<td>26</td>',
                '<td>27</td>',
                '<td>28</td>',
                '</tr>',
                '<tr>',
                '<td>29</td>',
                '<td>30</td>',
                '<td>1</td>',
                '<td>2</td>',
                '<td>3</td>',
                '<td>4</td>',
                '<td>5</td>',
                '</tr>',
                '</tbody>',
                '</table>',
                '</div>',
                '</div>',
                '<!-- 提示 -->',
                '<div class="date-picker end-date-picker" role="endDatePicker">',
                '<ul class="date-ctrl">',
                '<li class="prev-year" role="toPrevYear" title="上一年"></li>',
                '<li class="prev-month" role="toPrevMonth" title="上个月"></li>',
                '<li class="next-year" role="toNextYear" title="下一年"></li>',
                '<li class="next-month" role="toNextMonth" title="下个月"></li>',
                '</ul>',
                '<div class="date-picker-header">八月 2015</div>',
                '<div class="date-picker-body">',
                '<table width="100%" border="1">',
                '<thead>',
                '<tr>',
                '<th>日</th>',
                '<th>一</th>',
                '<th>二</th>',
                '<th>三</th>',
                '<th>四</th>',
                '<th>五</th>',
                '<th>六</th>',
                '</tr>',
                '</thead>',
                '<tbody>',
                '<tr>',
                '<td>25</td>',
                '<td>26</td>',
                '<td>27</td>',
                '<td>28</td>',
                '<td>29</td>',
                '<td>30</td>',
                '<td>31</td>',
                '</tr>',
                '<tr>',
                '<td>1</td>',
                '<td>2</td>',
                '<td>3</td>',
                '<td>4</td>',
                '<td>5</td>',
                '<td>6</td>',
                '<td>7</td>',
                '</tr>',
                '<tr>',
                '<td>8</td>',
                '<td>9</td>',
                '<td>10</td>',
                '<td>11</td>',
                '<td>12</td>',
                '<td>13</td>',
                '<td>14</td>',
                '</tr>',
                '<tr>',
                '<td>15</td>',
                '<td>16</td>',
                '<td>17</td>',
                '<td>18</td>',
                '<td>19</td>',
                '<td>20</td>',
                '<td>21</td>',
                '</tr>',
                '<tr>',
                '<td>22</td>',
                '<td>23</td>',
                '<td>24</td>',
                '<td>25</td>',
                '<td>26</td>',
                '<td>27</td>',
                '<td>28</td>',
                '</tr>',
                '<tr>',
                '<td>29</td>',
                '<td>30</td>',
                '<td>1</td>',
                '<td>2</td>',
                '<td>3</td>',
                '<td>4</td>',
                '<td>5</td>',
                '</tr>',
                '</tbody>',
                '</table>',
                '</div>',
                '</div>',
                '</div>',
                '</div>'
            ].join('')

        });


        // 定义到全局变量
        Date.DatePicker = DatePicker;

        return DatePicker;

    });