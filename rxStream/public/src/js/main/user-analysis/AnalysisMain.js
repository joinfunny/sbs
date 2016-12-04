// 
define([
        'dot',
        'AppPage',
        'AppPage/Utils/Date',
        'AppPage/Widget/DatePicker',
        'main/data-overview/echarts-grid-new'
    ],
    function (dot, AppPage, Date, DatePicker, grid) {

        // 类构造函数
        function AnalysisMain() {
        }

        // 原型
        AnalysisMain.prototype = _.create(EventEmitter.prototype, {
            'constructor': AnalysisMain
        });


        // 原型扩展
        $.extend(AnalysisMain.prototype, {

            // 查看的时间刻度 hour|day|week|month
            unit: 'day',
            // 查看开始时间
            startDate: '2016-01-11',
            // 查看结束时间
            endDate: '2016-01-14',

            // 初始化
            init: function init(root, options) {
                options && $.extend(this, options);
                this.bindHandleEvent('change');
                this.initRoot(root);
                this.initParts();
                $(window).on('resize', this.handleEvent);
                return this;
            },

            // 初始化根元素
            initRoot: function (root) {
                this.root = $(root)[0];
                this.doc = document;
                this.docRoot = this.doc.documentElement;
                this.delegateRoot('click focusin');
            },

            // 事件委托根元素
            delegateRoot: function (eventTypes) {
                $(this.root).on(eventTypes, this.handleEvent);
            },

            // 初始化各部件
            initParts: function () {
                // 依据role属性设置成员
                _.forEach(this.root.querySelectorAll('[role]'), function (elem) {
                    var role = elem.getAttribute('role');
                    this[role] = elem;
                }, this);

                this.initDateRange();
                this.initFunnelWindowPeriod();
                this.initRetainedPeriod();
                this.initUnitTimeRecord();
            },

            // 初始化时间跨度
            initDateRange: function () {
                var inputDateRanges = this.inputDateRange2 ? [this.inputDateRange1, this.inputDateRange2] : [this.inputDateRange1];
                $(inputDateRanges).on('change', this.handleEvent);
                DatePicker.setTriggerDefinedDateRange(this.inputDateRange1);
            },

            // 初始化漏斗窗口期
            initFunnelWindowPeriod: function () {
                $(this.funnelWindowPeriod).on('change', this.handleEvent);
            },

            // 初始化留存期
            initRetainedPeriod: function () {
                $(this.retainedPeriod).on('change', this.handleEvent);
            },

            // 初始化回访频次的单位时间记次方式
            initUnitTimeRecord: function () {
                $(this.unitTimeRecord).on('change', this.handleEvent);
            },

            // 绘制
            render: function () {
                this.initCharts();
                return this;
            },

            // 处理事件路由
            handleEvent: function (e) {
                //this.emit('beforeHandleEvent', e);
                switch (e.type) {
                    case 'click':
                        this.click(e);
                        break;
                    case 'focusin':
                        this.focusin(e);
                        break;
                    case 'focusout':
                        this.focusout(e);
                        break;
                    case 'change':
                        this.change(e);
                        break;
                    case 'resize':
                        this.resize(e);
                        break;
                    default:
                }
                //this.emit('afterHandleEvent', e);
            },

            // 聚焦事件
            focusin: function (e) {

                var that = this,
                    target = e.target,
                    role = target.getAttribute('role'),
                    tHeadCells;

                // 若为分组筛选输入框
                switch (role) {
                    case 'inputGroupingFilter':
                        this.groupingFilter(e);
                        break;
                }
            },

            // 分组过滤关键字输入框筛选定时器id
            groupingFilterTimeoutId: null,

            // 分组过滤关键字
            groupingFilter: function (e) {

                var that = this,
                    target = e.target,
                    lastValue = target.value.trim(),
                    groupType = $('table', this.tableWrapper).attr('data-type'),
                    tHeadRowCells = $('thead th', this.tableWrapper).toArray(),
                    tableRows = $('tr', this.tableWrapper).toArray();

                $(this.root).on('focusout', this.handleEvent);
                //
                this.groupingFilterTimeoutId = setTimeout(groupingFilter, 200);

                function groupingFilter() {

                    var value = target.value.trim(),
                        noMatchIndexes = [],
                        filterValues = value.toLowerCase().split(/\s+/);

                    if (value !== lastValue) {
                        if (groupType === 'rowsGroup') { //多维度，分组在行里
                            grid.init({
                                root: that.tableWrapper,
                                gridData: AppPage.Echarts.responesTransformDatas[0].gridData,
                                tdFormat: this.tdFormat,
                                filterBody: filterValues
                            });
                        } else {
                            if (value) {
                                //filterValues = value.toLowerCase().split(/\s+/);

                                tHeadRowCells.slice(1).forEach(function (cell, i) {
                                    var text = $(cell).text().toLowerCase();
                                    var noMatch = filterValues.every(function (value, j) {
                                        return text.indexOf(value) < 0;
                                    });
                                    noMatch && noMatchIndexes.push(i + 1);
                                });
                            }

                            tableRows.forEach(function (tr) {
                                _.toArray(tr.cells).slice(1).forEach(function (cell, i) {
                                    cell.style.display = '';
                                });
                            });

                            if (noMatchIndexes.length) {
                                tableRows.forEach(function (tr) {
                                    var cells = tr.cells;
                                    noMatchIndexes.forEach(function (index) {
                                        cells[index].style.display = 'none';
                                    });
                                });
                            }
                        }
                        lastValue = value;
                    }
                    that.groupingFilterTimeoutId = setTimeout(groupingFilter, 200);
                }
            },

            // 失焦事件
            focusout: function (e) {
                var target = e.target,
                    role = target.getAttribute('role');

                // 若为分组筛选输入框
                switch (role) {
                    case 'inputGroupingFilter':
                        this.clearGroupingFilterTimeout();
                        break;
                }

            },

            // 清除分组过滤关键字输入框筛选定时器id
            clearGroupingFilterTimeout: function () {
                $(this.root).off('focusout', this.handleEvent);
                clearTimeout(this.groupingFilterTimeoutId);
                delete this.groupingFilterTimeoutId;
            },

            //
            change: function (e) {

                switch (e.target) {
                    // 若为留存期
                    case this.retainedPeriod:
                    // 若为漏斗窗口期
                    case this.funnelWindowPeriod:
                        this.changeRequestRender();
                        break;
                    // 若为时间跨度1
                    case this.inputDateRange1:
                        // 且为对比状态
                        if (this.isCompare) {
                            // 直接触发开关对比按钮，关闭对比
                            $(this.toggleDateRangeCompareBtn).trigger('click');
                            break;
                        }
                    default:
                        this.changeRequestRender();
                        this.setDateRangeTabs();
                }
            },

            click: function (e) {
                var target = e.target,
                    role = target.getAttribute('role');
                switch (role) {
                    case 'saveAnalysisBtn':
                        this.saveAnalysis(e);
                        break;
                    case 'resetAnalysisBtn':
                        this.resetAnalysis(e);
                        break;
                    case 'toggleDateRangeCompareBtn':
                        this.toggleDateRangeCompare(e);
                        break;
                    case 'dateRangeTab1':
                        this.switchDateRange1(e);
                        break;
                    case 'dateRangeTab2':
                        this.switchDateRange2(e);
                        break;
                    case 'switchPiechartBtn':
                    case 'switchHistogramBtn':
                    case 'switchDiagramBtn':
                    case 'switchFunnelBtn':
                    case 'switchMapBtn':
                    case 'switchRelBtn':
                    case 'switchRelBtn1':
                        this.changeChartType(e);
                        break;
                    case 'switchTableBtn':
                        this.switchTable(e);
                        break;
                    case 'checkboxTotal':
                        this.toggleTotal(e);
                        break;
                    case 'checkboxScore':
                        this.toggleScore(e);
                        break;
                    case 'retainedPeople':
                        this.switchRetainedTab(e);
                        break;
                    case 'retainedPer':
                        this.switchRetainedTab(e);
                        break;
                    default:
                        switch (target.name) {
                            // 时间轴单位选项
                            case 'timeAxisUnit':
                                this.switchTimeAxisUnit(e);
                                break;
                        }
                }
            },

            // 切换留存分析的图形表述（人数或百分比）
            switchRetainedTab: function (e) {
                var $target = $(e.target),
                    type;

                if (!$target.hasClass('actived')) {
                    $target.siblings().removeClass('actived');
                    $target.addClass('actived');
                    type = $target.data('type');
                    //chartType = this.getCurrentChartType();
                    //this.emit('changeRetainedTab', chartType, type);
                    AppPage.Echarts.render(type);
                }
            },

            // 保存分析模型
            saveAnalysis: function (e) {
                e.preventDefault();
                this.parent.saveAnalysis(e);
            },

            resetAnalysis: function (e) {
                e.preventDefault();
                this.parent.resetAnalysis(e);
            },

            labelRadioCheckedClass: 'label-checked label-radio-checked',

            // 点击切换时间轴单位
            switchTimeAxisUnit: function (e) {
                this._switchTimeAxisUnit(e.target);
            },

            // 切换时间轴单位
            // @isSet 是否为设置时触发
            _switchTimeAxisUnit: function (target, isSet) {
                var form = target.form;

                _.forEach(form[target.name], function (radio) {
                    var checked = radio === target;
                    isSet && checked && (radio.checked = checked);
                    $(radio.parentNode)[checked ? 'addClass' : 'removeClass'](this.labelRadioCheckedClass);
                }, this);
                // 若原始数据已设置过
                isSet || this.changeRequestRender();
            },

            toggleScore: function (e) {
                var checkbox = e.target,
                    tbody = this.tableWrapper.querySelector('.grid-table');
                checkbox.checked ? $(tbody).addClass('show-score') : $(tbody).removeClass('show-score');
            },

            toggleTotal: function (e) {
                var checkbox = e.target,
                    tbody = this.tableWrapper.querySelector('.total');

                checkbox.checked ? $(tbody).show() : $(tbody).hide();

                /*tbody = this.tableWrapper.querySelector('.total'),
                 rows = tbody.rows,
                 totalRow = rows[0],
                 totalRowCells = totalRow.cells,
                 arr = [];

                 if ($(totalRowCells[0]).text().indexOf('合计') > -1) {
                 $(tbody).hide();
                 } else {
                 arr = _.toArray(totalRowCells).slice(1).map(function (cell) {
                 return parseFloat(cell.firstChild.nodeValue.trim());
                 });

                 _.toArray(rows).slice(1).forEach(function (row) {
                 _.toArray(row.cells).slice(1).forEach(function (cell, j) {
                 arr[j] += parseFloat(cell.firstChild.nodeValue.trim());
                 });
                 });

                 $('<tr><th>合计</th><td>' + arr.join('</td><td>') + '</td></tr>').prependTo(tbody);
                 }*/
            },

            // 显示时间段对比的样式类
            showDateRangeCompareClass: 'show-date-range-compare',

            // 是否为对比状态
            isCompare: false,

            // 开关时间段对比
            toggleDateRangeCompare: function (e) {
                if (this.isCompare) {
                    this.isCompare = false;
                    $(this.root).removeClass(this.showDateRangeCompareClass);
                } else {
                    this.isCompare = true;
                    $(this.root).addClass(this.showDateRangeCompareClass);
                    this.dateRangeCompare(e);
                }
                // 若为事件触发，则发送数据变更请求
                if (e) {
                    e.preventDefault();
                    this.changeRequestRender();
                }
                this.setDateRangeTabs();
            },

            // 设置时间段对比
            setDateRangeCompare: function () {
                if (this.isCompare) {
                    $(this.root).addClass(this.showDateRangeCompareClass);
                }
                else {
                    $(this.root).removeClass(this.showDateRangeCompareClass);
                    this.dateRangeCompare();
                }
                this.setDateRangeTabs();
            },

            // 设置时间段对比标签
            setDateRangeTabs: function () {
                if (this.isCompare) {
                    this.dateRangeTab1.innerHTML = this.inputDateRange1.value;
                    this.dateRangeTab2.innerHTML = this.inputDateRange2.value;
                    $(this.dateRangeTab2).trigger('click');
                }
            },

            // 时间段分析对比
            dateRangeCompare: function (e) {

                var dateObjectRange = DatePicker.getTriggerDateObjectRange(this.inputDateRange1);
                var start = dateObjectRange[0];
                var end = dateObjectRange[1];
                var diffTime = end.getTime() - start.getTime();

                start.setDate(start.getDate() + -1);
                end = start;
                start = new Date(end.getTime() - diffTime);

                DatePicker.setTriggerDateObjectRange(this.inputDateRange2, start, end);
                e && $(this.inputDateRange2).trigger('mousedown');
            },

            // 切换标签，并判断是否实际切换
            switchTab: function (tab, activedClass, tab$) {
                var $tab = $(tab);
                if (!$tab.hasClass(activedClass)) {
                    $tab.siblings(tab$).removeClass(activedClass);
                    $tab.addClass(activedClass);
                    return true;
                }
                return false;
            },

            // 切换标签，并判断是否实际切换
            eSwitchTab: function (e) {
                e.preventDefault();
                return this.switchTab(e.target, this.activedClass);
            },

            // 切换到时间跨度1
            switchDateRange1: function (e) {
                if (this.eSwitchTab(e) && AppPage.Echarts.responesTransformDatas[0]) {
                    grid.init(({
                        root: this.tableWrapper,
                        gridData: AppPage.Echarts.responesTransformDatas[0].gridData,
                        tdFormat: this.tdFormat
                    }));
                }
            },

            // 切换到时间跨度2
            switchDateRange2: function (e) {
                if (this.eSwitchTab(e) && e.currentTarget === this.root && AppPage.Echarts.responesTransformDatas[1]) {
                    grid.init(({
                        root: this.tableWrapper,
                        gridData: AppPage.Echarts.responesTransformDatas[1].gridData,
                        tdFormat: this.tdFormat
                    }));
                }
            },
            //格式化td
            tdFormat: function (td) {
                var currentValue = $(td).attr('data-value'),
                    beforeValue = $(td).attr('data-before'),
                    $p = $('<p></p>');
                if (beforeValue !== 'none') {
                    if (currentValue == 0 || beforeValue == 0) {
                        $p.html('N/A')
                    } else {
                        var percent = (currentValue - beforeValue) / beforeValue;
                        if (percent >= 0) {
                            $p.html('+' + parseFloat((percent * 100).toFixed(1)) + '%').addClass('up');
                        } else if (percent < 0) {
                            $p.html(parseFloat((percent * 100).toFixed(1)) + '%').addClass('down');
                        }
                    }
                }
                $(td).append($p);
            },
            activedClass: 'actived',

            // 图表按钮选择器
            echartsSwitchBtn$: '.icon-echarts',

            // 只显示图表或表格中的一种的样式类（图标和表格的父面板）
            showOneChartClass: 'show-one-chart',

            // 切换显示图表标签，并判断是否实际切换
            // return boolean
            eChartSwitchTab: function (e) {

//                this.echartsPanel
//                this.tablePanel
//                this.echartsMain
//                this.tableWrapper

                var target = e.target,
                    $target = $(target),
                    $siblings,
                    chartType = '',
                    $echartsSwitchBtnSiblings;

                e.preventDefault();

                // 若只能显示图表或表格中的一种
                if (this.isSingleShow()) {

                    $target.siblings().removeClass(this.activedClass);
                    $target.addClass(this.activedClass);

                    // 若为图表控制按钮
                    if ($target.is(this.echartsSwitchBtn$)) {
                        $(this.echartsPanel).addClass(this.activedClass);
                        $(this.tablePanel).removeClass(this.activedClass);
                    }
                    // 若为表格控制按钮
                    else {
                        $(this.echartsPanel).removeClass(this.activedClass);
                        $(this.tablePanel).addClass(this.activedClass);
                    }
                }
                // 若图表和表格都可以显示
                else {

                    $echartsSwitchBtnSiblings = $target.siblings(this.echartsSwitchBtn$);

                    // 若为图表控制按钮
                    if ($target.is(this.echartsSwitchBtn$)) {
                        // 若图表控制按钮已选中
                        if ($target.hasClass(this.activedClass)) {

                            // 只显示图表，不显示表格
                            $(this.chartsPanel).addClass(this.showOneChartClass);
                            $([this.switchTableBtn, this.tablePanel]).removeClass(this.activedClass);
                        }
                        // 若图表控制按钮未选中
                        else {
                            // 若表格控制按钮已选中
                            if ($(this.switchTableBtn).hasClass(this.activedClass)) {
                                $(this.chartsPanel).removeClass(this.showOneChartClass);
                            }
                            $echartsSwitchBtnSiblings.removeClass(this.activedClass);
                            $([target, this.echartsPanel]).addClass(this.activedClass);
                        }
                    }
                    // 若为表格控制按钮
                    else {
                        // 若表格控制按钮已选中
                        if ($target.hasClass(this.activedClass)) {

                            // 只显示表格，不显示图表
                            $(this.chartsPanel).addClass(this.showOneChartClass);
                            $echartsSwitchBtnSiblings.removeClass(this.activedClass);
                            $(this.echartsPanel).removeClass(this.activedClass);
                        }
                        // 若表格控制按钮未选中
                        else {
                            // 若图表控制按钮已选中
                            if ($echartsSwitchBtnSiblings.hasClass(this.activedClass)) {
                                $(this.chartsPanel).removeClass(this.showOneChartClass);
                            }
                            $([target, this.tablePanel]).addClass(this.activedClass);
                        }
                    }
                    this.chartRestore();
                }

                if (this.currentChartTypeBtn !== target) {
                    this.currentChartTypeBtn = target;
                    return true;
                }
                else {
                    return false;
                }
            },

            // 改变图表显示类型
            changeChartType: function (e) {
                if (!this.eChartSwitchTab(e)) {
                }
                this.emit('changeChartType', e.target.dataset.type);
            },

            // 切表格
            switchTable: function (e) {
                if (!this.eChartSwitchTab(e)) {
                }
                //this.emit('changeChartType', e.target.dataset.type);
            },

            // 大小改变事件
            resize: function (e) {
                // 若只显示图表或表格中的一种（<1280）
                if (this.isSingleShow()) {
                    // 若图表面板在激活显示状态
                    if ($(this.echartsPanel).hasClass(this.activedClass)) {
                        $([this.switchTableBtn, this.tablePanel]).removeClass(this.activedClass);
                    }
                } else {
                    if (!$(this.echartsPanel).hasClass(this.activedClass) || !$(this.tablePanel).hasClass(this.activedClass)) {
                        $(this.chartsPanel).addClass(this.showOneChartClass);
                    }
                }
                this.chartRestore();
            },

            // 初始化图表和表格
            initCharts: function () {
                var analysisType = this.parent.analysisType;
                // 若为“回访频率”分析类型
                switch (analysisType) {
                    case 'Revisit':
                        this.renderCharts(this.switchTableBtn);
                        break;
                    case 'Event':
                        this.renderCharts(this.switchHistogramBtn);
                        break;
                    case 'Funnel':
                        this.renderCharts(this.switchFunnelBtn);
                        break;
                    case 'Retained':
                        this.renderCharts(this.switchDiagramBtn);
                        break;
                    case 'Worth':
                        this.renderCharts(this.switchHistogramBtn);
                        break;
                    case 'Spread':
                        this.renderCharts(this.switchRelBtn);
                        break;
                }
            },

            // 渲染图表和表格
            renderCharts: function (chartTypeBtn) {

                this.currentChartTypeBtn = chartTypeBtn;

                // 若只能显示图表或表格中的一种（媒体查询）
                if (this.isSingleShow()) {
                    $([this.echartsPanel, this.currentChartTypeBtn])
                        .addClass(this.activedClass);
                }
                // 若可显示两种
                else {
                    //$(this.chartsPanel).removeClass(this.showOneChartClass);
                    $([this.echartsPanel, this.currentChartTypeBtn, this.tablePanel, this.switchTableBtn])
                        .addClass(this.activedClass);
                }
            },

            // 判断是否只能显示图表或表格中的一种（媒体查询窄屏为绝对定位 <1280）
            // 判断表格按钮是否显示,若不显示，则只显示单个图表区域
            isSingleShow: function (e) {
                return window.innerWidth < 1280;
            },

            requestZhData: null,

            // 获取分析模型的标题
            getAnalysisTitles: function () {
                var titles = {
                    analysisTitle: this.inputAnalysisTitle.value.trim(),
                    autoAnalysisTitle: this.autoAnalysisTitle.value
                };
                return titles;
            },

            // 通过条件字段（中文）获取分析模型的标题
            getAnalysisTitleByZhData: function (requestZhData) {
                var actions = [],
                    groupFields = requestZhData.groupFields_zh,
					view = (requestZhData.unit_zh ? '按' + requestZhData.unit_zh + '、' : '')+ '按' + (groupFields.length ? groupFields : ['总体']).join('、'),
                    title;

                requestZhData.actions.forEach(function (action) {

                    var actionName_zh = action.actionName_zh,
                        field_zh = action.field_zh,
                        operation_zh = action.operation_zh,
                        f_e_zh = (field_zh ? '的' + field_zh : '') + ('的' + operation_zh),
                        i = this.indexOf(actionName_zh);
//console.log(action);
                    // 若未出现一级事件名
                    if (i < 0) {
                        this.push(actionName_zh);
                        actions.push(actionName_zh + f_e_zh);
                    }
                    else {
                        actions[i] += '、' + f_e_zh.slice(1);
                    }

                }, []);

                title = actions.join('，');
				
                title += '；' + view + '查看';

                return title;
            },

            // 设置分析模型的标题
            setAnalysisTitle: function (requestZhData, originalData) {

                if (originalData && originalData.analysisTitle) {
                    this.inputAnalysisTitle.value = originalData.analysisTitle;
                    this.autoAnalysisTitle.value = originalData.autoAnalysisTitle;
                    return;
                }
                // 若无中文转述数据，清除标题并返回
                if (!this.canSetAnalysisTitle(requestZhData)) {
                    this.inputAnalysisTitle.value = this.autoAnalysisTitle.value = '';
                    return;
                }
                var actions = [],
                    title = this.getAnalysisTitleByZhData(requestZhData),
                    inputTitle = this.inputAnalysisTitle.value.trim(),
                    autoTitle = this.autoAnalysisTitle.value;

                if (inputTitle) {
                    if (inputTitle === autoTitle) {
                        this.inputAnalysisTitle.value = title;
                    }
                }
                else {
                    this.inputAnalysisTitle.value = title;
                }
                this.autoAnalysisTitle.value = title;
            },

            // 确认分析标题是否可设置
            canSetAnalysisTitle: function (requestZhData) {
                return !!requestZhData && requestZhData.actions.length > 0;
            },
//{
//	"actions": [{
//		"actionName": "PayOrder",
//		"operation": "sum",
//		"field": "event.order_money"
//	}],
//	"unit": "day",
//	"filterCondition": {
//		"relation": "or",
//		"conditions": [{
//			"field": "event.provice",
//			"expression": "notequal",
//			"values": ["辽宁省"]
//		}]
//	},
//	"groupFields": ["event.provice"],
//	"bucketConditions": [],
//	"startDate": "2015-11-10",
//	"endDate": "2015-11-12"
//}			
            // 原始数据是否已设置过
            isOriginalDataSet: function () {
                return this.parent.isOriginalDataSet();
            },

            // 设置原始数据渲染
            setOriginalData: function (originalData) {
                this.setAnalysisTitle(originalData.requestZhData, originalData);
                this.setDurationUnit(originalData.requestData);
                this.setDateRange(originalData.requestData, originalData.isCompare);
            },

            // 设置时间单位
            setDurationUnit: function (durationUnit) {
                this.setTimeAxisUnit(durationUnit.unit);
            },

            // 设置时间轴单位
            setTimeAxisUnit: function (unit) {
                var target = this.timeAxisUnits.querySelector('input[value=' + unit + ']');
                this._switchTimeAxisUnit(target, true);
            },

            // ***********************************************
            // 以下为获取请求数据，由父组件负责拼装发起请求

            // 获取时间跨度
            // return Date String Array
            getDateRangeKit: function () {
                var inputDateRange = this['inputDateRange1'],
                    dateRange = DatePicker.getTriggerDateRange(inputDateRange),
                    dateRangeWord = inputDateRange.dataset.range,
                    dateRangeText = inputDateRange.dataset.rangeText;
                return {
                    dateRange: dateRange,
                    dateRangeWord: dateRangeWord,
                    dateRangeText: dateRangeText
                }
            },
            getDateRange: function (isCompare) {
                if (isCompare && !this.isCompare) return;
                var inputDateRange = this['inputDateRange' + (isCompare ? '2' : '1')];
                return DatePicker.getTriggerDateRange(inputDateRange);
            },

            // 设置时间跨度
            setDateRange: function (requestData, isCompare) {
                var dateRangeWord = requestData.dateRangeType,
                    startDate = requestData.startDate,
                    endDate = requestData.endDate,
                    inputDateRange = isCompare ? this.inputDateRange2 : this.inputDateRange1,
                    dataset = inputDateRange.dataset,
                    data,
                    inputDateRangeWord = dataset.range,
                    dateRangeStr = '',
                    compareDateRangeStr = '';

                this.isCompare = !!isCompare;

                this.inputDateRange1.dataset.range = dateRangeWord;
                this.inputDateRange1.dataset.rangeText = requestData.dateRangeText || '';

                if (dateRangeWord !== 'custom') {

                    DatePicker.setTriggerDefinedDateRange(this.inputDateRange1);
                    var dateArr = this.inputDateRange1.value.split(this.inputDateRange1.dataset.rangeHyphen);
                    requestData.startDate = dateArr[0];
                    requestData.endDate = dateArr[1];


                    // 若对比
                    if (this.isCompare) {
                        this.dateRangeCompare();
                        $(this.root).addClass(this.showDateRangeCompareClass);
                        var dateCompareArr = this.inputDateRange2.value.split(this.inputDateRange2.dataset.rangeHyphen);
                        requestData.compareStartDate = dateCompareArr[0];
                        requestData.compareEndDate = dateCompareArr[1];
                        this.setDateRangeTabs();
                    }

                    //dateRangeStr = DatePicker.setTriggerByDefinedDateRangeWord(inputDateRange, dateRangeWord);
                    //
//                    if (!dateRangeStr) {
//                        dataset.range = inputDateRangeWord;
//                        dateRangeStr = DatePicker.initTriggerDateRange(inputDateRange);
//                        //requestData.dateRangeWord = inputDateRangeWord;
//                    }
                }
                else {
                    dateRangeStr = startDate + dataset.rangeHyphen + endDate;
                    inputDateRange.value = dateRangeStr;
                    this.setDateRangeCompare();
                }
                return dateRangeStr;
            },

            // 获取时间轴单位
            getTimeAxisUnit: function () {
				var timeAxisUnit = $('input[name=timeAxisUnit]:checked', this.timeAxisUnits)[0];
                return {
					unit: timeAxisUnit.value,
					unit_zh: $(timeAxisUnit.parentNode).text().trim()
				};
            },

            // 解析字符串值获取时间单位对象
            parseDurationUnit: function (value) {
                var durationUnit = value.split(/\s+/);

                return {
                    duration: parseInt(durationUnit[0]),
                    unit: durationUnit[1],
                    unit_zh: Date.UNIT_ZH[durationUnit[1]]
                };
            },

            // 设置时间单位
            _setDurationUnit: function (select, durationUnit) {
                _.some(select, function (option) {
                    var du = this(option.value);
                    if (du.duration === durationUnit.duration && du.unit === durationUnit.unit) {
                        return option.selected = true;
                    }
                }, this.parseDurationUnit)
            },

            // 获取当前显示图表的类型
            getCurrentChartType: function () {
                //return this.chartsTypeMenu.querySelector('.actived').dataset.type;
                return this.currentChartTypeBtn.dataset.type;
            },

            // 用户触发UI组件变动，请求数据重绘图表
            changeRequestRender: function () {
                this.parent.changeRequestRender();
            },

            // 图表刷新
            chartRestore: function () {
                this.parent.chartRestore();
            }

        });

        return AnalysisMain;

    });