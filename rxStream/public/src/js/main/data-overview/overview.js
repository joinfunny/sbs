//
define([
    'AppPage',
    'AppPage/Utils/Date',
    'dot',
    'jQcss3',
    'echarts',
    'main/data-overview/echarts-ops',
    'main/data-overview/echarts-switch',
    'main/data-overview/echarts-grid',
    'main/user-analysis/transformData'
], function (AppPage ,Date, dot,css3,  ec, os, switchChart, grid, transformData) {

    function Overview() {

    }

    // 原型
    Overview.prototype = _.create(EventEmitter.prototype, {
        'constructor': Overview
    });
    $.extend(Overview.prototype, {
        root: null,
        options: null,
        ajaxUrl: __api_path + '/services/analysis/getAnalyzeObject',
        init: function (ops) {
            this.options = $.extend(true, {}, ops);
            this.createRoot();
            this.setDateRange();
            this.renderTemplate();
            this.bindHandleEvent();
            if (this.options.onInited && this.options.onInited instanceof Function) {
                this.options.onInited(this);
            }
        },
        render: function () {
            this.dataBind();
            this.eventBind();
            if (this.options.onRendered && this.options.onRendered instanceof Function) {
                this.options.onRendered(this);
            }
        },
        create: function (ops) {
            this.init(ops);
            this.render();
        },
        //创建root
        createRoot: function () {
            var oDiv = $('<div class="dashboard-widget-wrapper"></div>');
            this.root = oDiv[0];
            oDiv.appendTo('.dashboard-widgets-list');
        },

        //渲染模板
        renderTemplate: function () {
            var interText = dot.template($("#overview-temp").text());
            $(this.root).html(interText(this.options.data));
        },
        //处理相对日期的时间段
        setDateRange: function () {
            var data = this.options.data.Config,
                requestData = data.requestData;
            if (requestData.dateRangeType !== 'custom') {
                this.options.data.Remark = this.getAnalysisDesc(data);
            }
        },
        //如果是相对日期修改标题下的描述
        getAnalysisDesc: function (saveData) {
            var groupFields_zh = saveData.requestZhData.groupFields_zh || [],
                requestData = saveData.requestData,
                dateRangeStr = Overview.definedDateRangeWord(requestData.dateRangeType),
                dateArr = dateRangeStr.split(Overview.DATE_RANGE_HYPHEN),
                desc = requestData.dateRangeText + '(' + (requestData.dateRangeType === 'today' || requestData.dateRangeType === 'yesterday' ? dateArr[0] : dateRangeStr) + ')';

            requestData.startDate = dateArr[0];
            requestData.endDate = dateArr[1];

            if (requestData.isCompare) {
                var compareDateRangeStr = Overview.setCompareRange(dateArr),
                    compareDateArr = compareDateRangeStr.split(Overview.DATE_RANGE_HYPHEN);

                requestData.compareStartDate = compareDateArr[0];
                requestData.compareEndDate = compareDateArr[1];

                desc += '对比' + '(' + (requestData.dateRangeType === 'today' || requestData.dateRangeType === 'yesterday' ? compareDateArr[0] : compareDateRangeStr) + ')';
            }

            if (groupFields_zh.length > 0) {
                desc += '，按' + groupFields_zh.join('和') + '分组';
            }
            //console.log(desc);
            return desc;
        },
        deleteOverview: function (e) {
            var that = this;
            var opts = that.options;
            $(that.root).animate({
                'opacity': 0
            }, function () {
                $(this).remove();
                if (opts.onDeleted && opts.onDeleted instanceof Function) {
                    opts.onDeleted(that);
                }
            });
        },
        dataBind: function () {
        },
        //事件绑定
        eventBind: function () {
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
        // @requestData 请求数据（见API）
        // return defer
        createAjaxDefer: function (requestData) {
            var data = {
                    data: requestData
                },
                that = this;
            var dataStr = JSON.stringify(data);
            //console.log(JSON.stringify(data, null, 4))
            return AppPage.loadApi({
                url: that.ajaxUrl + '?type=' + that.options.analysisType,
                data:{data: dataStr},
                crossDomain: true,
                beforeSend: function () {
                    // 遮罩
                    that.loadingMask(true);
                },
                complete: function () {
                    // 去除遮罩
                    that.loadingMask(false);
                }
            })
        },
        loadingMask: function (b) {
            var $loading = $('.overview-loading', this.root);
            b ? $loading.show() : $loading.hide();
        },

        //图表提示信息

        echartsTips: function (text) {
            $('.echarts-container', this.root).addClass('echarts-disable');
            $('.echarts-none', this.root).html(text);
        }
    });

    function BehaviorOverview() {

    }

    BehaviorOverview.prototype = _.create(Overview.prototype, {
        'constructor': BehaviorOverview
    });

    $.extend(BehaviorOverview.prototype, {
        root: null,
        options: null,
        //ajaxUrl: __path + '/bas/services/bas/analysis/runtime/getAnalyzeObject',
        currentDate: null, //当前日期可操作
        domDateStr: null, //dom显示的日期格式
        thisChart: null,
        dateFormat: 'yyyy-MM-dd',
        dataBind: function () {
            this.options.data.rangeDays = this.getRangeDay();
            this.checkToday();
            this.initCharts();
        },
        //事件绑定
        eventBind: function () {
            //事件委托在上级元素上
            $(this.root).on('click', this.handleEvent);
            $('.tool-icon-list', this.root).on('click', this.handleEvent);
            $('.multiselect-container', this.root).on('click', this.handleEvent);
        },
        //渲染分组模板
        renderGroupTemplate: function () {
            var interText = dot.template($("#overview-group-temp").text());
            $('.group-wrap', this.root).html(interText(this.options.data));
        },

        click: function (e) {
            var role = e.target.getAttribute('role') || e.currentTarget.getAttribute('role');
            switch (role) {
                case 'dateLeftScroll':
                    this.leftClick(e);
                    break;
                case 'dateRightScroll':
                    this.rightClick(e);
                    break;
                case 'deleteOverview':
                    //this.deleteOverview(e);
                    Overview.remove(this.options.analysisId);
                    break;
                case 'convertChart':
                    this.convertChart(e);
                    break;
                case 'totalConvertChart':
                    this.totalConvertChart(e);
                    break;
                case 'groupChecked':
                    this.groupChecked(e);
                    break;
                default:
                    var type = e.target.getAttribute('data-type');
                    switch (type) {
                        case 'select':
                            this.selectMenu(e);
                            break;
                    }
            }
        },
        //切换图表
        convertChart: function (e) {
            if (!this.responesTransformDatas) {
                return;
            }
            var $target = $(e.target),
                type = this.currentChart = $target.attr('data-type'),
                $grid = $('.table-main', this.root);
            $target.addClass('active').siblings().removeClass('active');
            if (type === 'grid') {
                $('.group-right-text', this.root).show();
                $('.group-st', this.root).hide();
                $('.table-container', this.root).hide();
                this.requestData.groupFields.length > 0 && $('.date-tab', this.root).show();
            } else {
                $('.group-right-text', this.root).hide();
                $('.group-st', this.root).show();
                $('.date-tab', this.root).hide();
            }
            switchChart({
                echarts: this.thisChart,
                gridDom: $grid,
                type: type
            });
            this.currentOverviewChart = type;
        },
        //合计饼图和表格切换
        totalConvertChart: function (e) {
            var $target = $(e.target),
                type = $target.attr('data-type'),
                $grid = $('.table-main', this.root);
            $target.addClass('active').siblings().removeClass('active');
            if (type === 'grid') {
                $('.echarts-container', this.root).css('visibility', 'hidden');
                $('.table-container', this.root).show();
            } else {
                $('.table-container', this.root).hide();
                $('.echarts-container', this.root).css('visibility', 'visible');
            }
        },
        initGrid: function (date, isTotal) {
            var that = this;
            that.responesTransformDatas.forEach(function (item, i) {
                if (i === 1) {
                    $('.table-main', that.root).eq(0).addClass('compare-main');
                }
                grid.init({
                    root: $('.table-main', that.root).eq(i),
                    gridData: that.responesTransformDatas[i].gridData,
                    requestZhData: that.options.data.Config.requestZhData,
                    date: date ? date[i] : null,
                    createTotal: isTotal || false
                });
            });
        },
        //下拉单击
        selectMenu: function (e) {
            var $target = $(e.target),
                unit = $target.attr('data-value');
            if ($target.parent().hasClass('no-click') || !this.responesTransformDatas) {
                return;
            }
            $target.parent().addClass('active').siblings().removeClass('active');
            $target.parents('.dropdown').find('.dropdown-selection-label').html($target.html());
            if (unit === 'rollup') {
                $('.total-icon', this.root).show();
                $('.charts-icon', this.root).hide();
                $('.group-st', this.root).hide();
                $('.group-right-text', this.root).hide();
                $('.date-tab', this.root).hide();
                this.initGrid(null, true);
                if (this.showEcharts(this.requestData) && this.requestData.groupFields.length > 0) {
                    this.renderChart('pie');
                    $('.total-icon .pie', this.root).trigger('click');
                } else {
                    $('.total-icon .grid', this.root).trigger('click');
                }
            } else {
                this.requestData.unit = $target.attr('data-value');
                this.requestRender(this.requestData, true);
                $('.total-icon', this.root).hide();
                $('.charts-icon', this.root).show();
                $('.charts-icon .active', this.root).trigger('click');
            }
            this.currentMenu = unit;
        },
        //多选下拉
        groupCheckedClass: 'input[role="groupChecked"]',
        groupChecked: function (e) {
            var $target = $(e.target);
            if ($(this.groupCheckedClass + ':checked', this.root).length < 3) {
                $(this.groupCheckedClass, this.root).prop('disabled', false).parent().removeClass('disabled');
            } else {
                $(this.groupCheckedClass, this.root).not(':checked').prop('disabled', true).parent().addClass('disabled');
            }
            if ($target.prop('checked')) {
                $target.parents('.multiselect-item').addClass('active');
            } else {
                $target.parents('.multiselect-item').removeClass('active');
            }
            this.addChartData()
        },
        addChartData: function () {
            var filterName = [],
                isCompare = this.options.data.Config.isCompare;
            var options = this.responesTransformDatas[0].chartData;
            var opsTwo = isCompare ? this.responesTransformDatas[1].chartData : null;
            $(this.groupCheckedClass + ':checked', this.root).each(function () {
                filterName.push($(this).attr('data-name'));
            });
            this.setChartDataChecked(filterName);
            options.type = this.currentChart;
            options.stack = "group1";
            options = os(options, opsTwo);
            this.chartSetOptions(options);
        },
        setChartDataChecked: function (param) {
            this.responesTransformDatas.forEach(function (res) {
                res.chartData.series.forEach(function (item) {
                    item.checked = false;
                    param.forEach(function (itemData) {
                        if (item.name === itemData || item.name === (itemData + '-1')) {
                            item.checked = true;
                        }
                    });
                });
            });
        },
        chartSetOptions: function (ops) {
            this.thisChart.setOption(ops, true);
        },
        //滚动日期
        setDate: function (i) {
            var dateStr, w, that = this,
                dateRangeObj = that.dateTabText;
            this.currentIndex = i ? this.currentIndex + i : dateRangeObj[0].length - 1;
            this.checkIndex();
            this.currentDate = dateRangeObj.map(function (item) {
                return item[that.currentIndex]
            });
            this.dateDomRefresh();
            return this;

        },
        checkIndex: function () {
            if (this.currentIndex <= 0) {
                this.currentIndex = 0;
                $('.time-left', this.root).addClass('current-date')
            } else {
                $('.time-left', this.root).removeClass('current-date');
            }
            if (this.currentIndex >= this.dateTabText[0].length - 1) {
                this.currentIndex = this.dateTabText[0].length - 1;
                $('.time-right', this.root).addClass('current-date');
            } else {
                $('.time-right', this.root).removeClass('current-date');
            }
        },
        //左右日期是否到头
        checkToday: function () {
            var dateRangeObj = this.options.data.Config.requestData,
                start = dateRangeObj.startDate,
                end = dateRangeObj.endDate,
                domDate = new Date(this.currentDate);
            domDate.getTime() >= new Date(end).getTime() ? $('.time-right', this.root).addClass('current-date') : $('.time-right', this.root).removeClass('current-date');
            domDate.getTime() <= new Date(start).getTime() ? $('.time-left', this.root).addClass('current-date') : $('.time-left', this.root).removeClass('current-date');
        },
        dateDomRefresh: function () {
            var dateStr = this.currentDate[0];
            if (this.isCompare) {
                var str = this.dateTabText[1][this.currentIndex];
                dateStr += '对比' + str;
            }
            $('.date-text', this.root).html(dateStr);
        },
        getRangeDay: function () {
            var dateRangeObj = this.options.data.Config.requestData;
            var start = new Date(dateRangeObj.startDate);
            var end = new Date(dateRangeObj.endDate);
            return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        },
        leftClick: function (e) {
            var $target = $(e.target);
            if (!$target.hasClass('current-date')) {
                this.setDate(-1);
                this.initGrid(this.currentDate)
            }
        },
        rightClick: function (e) {
            var $target = $(e.target);
            if (!$target.hasClass('current-date')) {
                this.setDate(1);
                this.initGrid(this.currentDate)
            }
        },
        parsDay: function (day) {
            var dayStr = ['日', '一', '二', '三', '四', '五', '六'];
            return dayStr[day];
        },
        // 通过请求数据的判断是否显示图表
        // @requestData 请求数据（见API）
        // return boolean
        showEcharts: function (requestData) {
            return requestData && requestData.actions.length < 2 && requestData.groupFields.length < 3;
        },
        //加载echarts
        initCharts: function () {
            this.requestData = this.options.data.Config.requestData;
            this.isCompare = this.requestData.isCompare;
            this.requestZhData = this.options.data.Config.requestZhData;
            this.currentChart = this.options.data.Config.currentChart === 'pie' ? 'bar' : this.options.data.Config.currentChart;
            //设置数据
            this.requestRender(this.requestData);
        },

        // 通过请求数据，跨域获取分析结果，
        // 渲染图形和表格
        // @requestData 请求数据集，请求对比数据为第二个（见API）
        requestRender: function (requestData, lock) { //return;
            var that = this;
            var ajaxDefer = that.ajaxDefer;
            if (ajaxDefer) {
                ajaxDefer.abort();
            }

            ajaxDefer = that.ajaxDefer = that.createAjaxDefer(requestData, this.isCompare);


            ajaxDefer.then(function (res) {
                    if (!res.success || !res.dataObject) {
                        if (!res.success) {
                            that.echartsTips('服务器无响应，请重试！');
                        } else {
                            that.echartsTips(res.message || '暂无数据展示！');
                        }
                        return;
                    }
                    if (that.isCompare && !res.dataObject[0].dataObject) {
                        that.echartsTips('暂无数据展示！');
                        return;
                    }
                    // 抽取实际操作的数据
                    var results = [];
                    if (requestData.isCompare) {
                        results = res.dataObject.map(function (item) {
                            return item.dataObject
                        });
                    } else {
                        results.push(res.dataObject);
                    }
                    that.dateTabTextSourse = results.map(function (item) {
                        return item.sequences;
                    });
                    that.requestZhData.unit = requestData.unit;
                    that.responesTransformDatas = results.map(function (result) {
                        return transformData(result, that.requestZhData, that.requestData);
                    });
                    that.dateTabText = that.responesTransformDatas.map(function (item) {
                        return item.gridData.date;
                    });
                    that.options.data.resData = that.responesTransformDatas;
                    that.currentMenu = that.options.data.Config.requestData.unit;
                    that.renderGroupTemplate();
                    that.setDate();
                    // 基于准备好的dom，初始化echarts图表
                    var myChart = that.thisChart = ec.init($('.echarts-main', that.root)[0]); //echarts-main
                    if (that.showEcharts(that.requestData)) {
                        that.renderChart();
                        $('.date-tab', that.root).hide();
                    } else {
                        $('.table-container', that.root).show();
                        $('.date-tab', that.root).show();
                    }
                    that.initGrid();
                    that.currentChart === 'grid' && $('.charts-icon .grid', that.root).trigger('click');
                    !lock && that.initCurrentStates();
                },
                function (err) {

                });

        },

        //初始化概览保存的状态
        initCurrentStates: function () {
            var data = this.options.data;
            data.currentMenu == 'rollup' && $('[data-value="' + data.currentMenu + '"]', this.root).trigger('click');
        },
        // 渲染
        renderChart: function (chartType) {
            // piechart histogram diagram
            $(this.root).removeClass('echarts-disable');
            var ops = $.extend(true, {
                'hasChecked': true
            }, this.responesTransformDatas[0].chartData);
            var opsTwo = this.requestData.isCompare ? $.extend(true, {}, this.responesTransformDatas[1].chartData) : null;
            chartType || (chartType = this.currentChart);
            switch (chartType) {
                case 'pie':
                    ops.type = 'pie';
                    ops = os(ops, opsTwo);
                    break;
                case 'grid':
                case 'bar':
                    ops.type = 'bar';
                    ops.stack = 'group1';
                    ops = os(ops, opsTwo);
                    break;
                case 'line':
                    ops.type = 'line';
                    ops = os(ops, opsTwo);
                    break;
            }

            //AppPage.Echarts.myChart = ec.init(document.querySelector('.echarts-main'));
            this.thisChart.resize();
            this.thisChart.setOption(ops, true);
        }
    });

    function FunnelOverview() {

    }

    FunnelOverview.prototype = _.create(Overview.prototype, {
        'constructor': FunnelOverview
    });

    $.extend(FunnelOverview.prototype, {
        root: null,
        options: null,
        ajaxDefer: null,
        //ajaxUrl: __path + '/services/runtime/Funnel',
        dataBind: function () {
            this.initFunnel();
        },
        //事件绑定
        eventBind: function () {
            //事件委托在上级元素上
            $(this.root).on('click', this.handleEvent);
        },
        // @requestData 请求数据
        // @requestZhData 请求数据中文转述
        requestRender: function (requestData, requestZhData) {

            var ajaxDefer = this.ajaxDefer,
                that = this;
            if (ajaxDefer) {
                ajaxDefer.abort();
            }
            ajaxDefer = this.ajaxDefer = this.createAjaxDefer(requestData);

            ajaxDefer.then(function (res) {
                    //console.log(JSON.stringify({data:requestData}, null, 4));
                    //console.log(JSON.stringify(res, null, 4));
                    if (!res.success || !res.dataObject) {
                        if (!res.success) {
                            that.echartsTips('服务器无响应，请重试！');
                        } else {
                            that.echartsTips(res.message || '暂无数据展示！');
                        }
                        return;
                    }
                    that.requestData = requestData;
                    that.requestZhData = requestZhData;
                    that.responesData = res;
                    $('.panel-echarts').removeClass('echarts-disable');
                    var tempData = {
                        'data': that.funnelDataRate(res.dataObject.overview[0]),
                        'requestZhData': requestZhData,
                        'setps': res.dataObject.steps,
                        'currentTab': '全部',
                        'globalRate': that.funnelGlobalRate(res.dataObject.overview[0])
                    };
                    that.renderFunnelTemplate(tempData);
                    that.renderFunnelGroup(res.dataObject.groupValues);
                },
                function (err) {

                });
        },
        initFunnel: function () {
            var data = this.options.data.Config;
            this.requestRender(data.requestData, data.requestZhData);
        },
        //渲染漏斗数据模板
        renderFunnelTemplate: function (data) {
            var interText = dot.template($("#funnel-main-temp").text());
            $('.channel-per', this.root).html(interText(data));
        },
        //渲染漏斗分组模板
        renderFunnelGroup: function (data) {
            var interText = dot.template($("#funnel-group-temp").text());
            $('.dropdown-menu', this.root).html(interText(data));
        },
        //全局click事件
        click: function (e) {
            var role = e.target.getAttribute('role') || e.currentTarget.getAttribute('role');
            switch (role) {
                case 'deleteOverview':
                    //this.deleteOverview(e);
                    Overview.remove(this.options.analysisId);
                    break;
                default:
                    var type = e.target.getAttribute('data-type');
                    switch (type) {
                        case 'select':
                            this.selectMenu(e);
                            break;
                    }
            }
        },
        //分组下拉处理方法
        selectMenu: function (e) {
            var $target = $(e.target),
                index = $target.attr('data-index');
            $target.parent().addClass('active').siblings().removeClass('active');
            $target.parents('.dropdown').find('.dropdown-selection-label').html($target.html());
            var tempData = {
                'data': this.funnelDataRate(this.responesData.dataObject.overview[index]),
                'requestZhData': this.requestZhData,
                'setps': this.responesData.dataObject.steps,
                'currentTab': $target.html(),
                'globalRate': this.funnelGlobalRate(this.responesData.dataObject.overview[index])
            };
            this.renderFunnelTemplate(tempData);
        },
        //漏斗总体转化率
        funnelGlobalRate: function (data) {
            return data[data.length - 1].convertedUser === 0 ? 0 : parseFloat((data[data.length - 1].convertedUser / data[0].convertedUser * 100).toFixed(2));
        },
        //漏斗前后之间转化率计算
        funnelDataRate: function (data) {
            var that = this;
            return data.map(function (item, i) {
                if (i > 0) {
                    item.downRate = item.convertedUser === 0 ? 0 : parseFloat((item.convertedUser / data[i - 1].convertedUser * 100).toFixed(2));
                }
                return item;
            });
        }
    });

    function RetainedOverview() {

    }

    RetainedOverview.prototype = _.create(Overview.prototype, {
        'constructor': RetainedOverview

    });

    $.extend(RetainedOverview.prototype, {
        root: null,
        options: null,
        ajaxDefer: null,
        //ajaxUrl: __path + '/services/runtime/Retained',
        dataBind: function () {
            this.initRetained();
        },
        //事件绑定
        eventBind: function () {
            //事件委托在上级元素上
            $(this.root).on('click', this.handleEvent);
            // 基于准备好的dom，初始化echarts图表
            this.thisChart = ec.init($('.echarts-main', this.root)[0]); //echarts-main
        },
        // @requestData 请求数据
        // @requestZhData 请求数据中文转述
        requestRender: function (requestData, requestZhData) {

            var ajaxDefer = this.ajaxDefer, that = this;
            if (ajaxDefer) {
                ajaxDefer.abort();
            }
            ajaxDefer = this.ajaxDefer = this.createAjaxDefer(requestData);

            ajaxDefer.then(function (res) {
                    that.echartsTips();
                    //console.log(JSON.stringify({data: requestData}, null, 4));
                    //console.log(JSON.stringify(res, null, 4));
                    if (!res.success || !res.dataObject) {
                        if (!res.success) {
                            that.echartsTips('服务器无响应，请重试！');
                            console.log(res.message);
                        } else {
                            that.echartsTips(res.message || '暂无数据展示！');
                        }
                        that.myChart && that.myChart.clear();
                        return;
                    }
                    $(this.root).removeClass('echarts-disable');
                    that.requestData = requestData;
                    that.requestZhData = requestZhData;
                    that.responesTransformDatas = that.formatData(res, requestZhData, requestData);
                    that.dateTabText = that.responesTransformDatas.chartData.series.map(function (item) {
                        return item.name;
                    });
                    that.setDate();
                    that.renderChart();
                },
                function (err) {

                });
        },

        renderChart: function (index) {
            var ind = index || this.dateTabText.length - 1, that = this;
            if (!this.requestData) {
                return false;
            }
            $(this.root).removeClass('echarts-disable');
            var ops = $.extend(true, {}, this.responesTransformDatas.chartData);
            ops.type = 'line';
            ops.formatter = '%';
            ops.series = this.responesTransformDatas.chartData.seriesPre;
            ops = os(ops);
            ops.series = [ops.series[ind]];

            ops.tooltip.formatter = function (resData) {
                var data = resData[0], people = that.responesTransformDatas.chartData.series;
                return '<p>' + data.seriesName + '</p><p>回访总人数:' + people[that.currentIndex].totalPeople + '</p><p>' + data.name + '回访人数:' + people[that.currentIndex].data[data.dataIndex] + '</p><p>' + data.name + '回访百分比:' + data.data + '%</p>';
            };
            this.thisChart.resize();
            this.thisChart.setOption(ops, true);
        },
        initRetained: function () {
            var data = this.options.data.Config;
            this.requestRender(data.requestData, data.requestZhData);
        },
        //全局click事件
        click: function (e) {
            var role = e.target.getAttribute('role') || e.currentTarget.getAttribute('role');
            switch (role) {
                case 'dateLeftScroll':
                    this.leftClick(e);
                    break;
                case 'dateRightScroll':
                    this.rightClick(e);
                    break;
                case 'deleteOverview':
                    //this.deleteOverview(e);
                    Overview.remove(this.options.analysisId);
                    break;
                default:
            }
        },
        //滚动分组
        setDate: function (i) {
            var that = this, dateRangeObj = that.dateTabText;
            this.currentIndex = i ? this.currentIndex + i : dateRangeObj.length - 1;
            this.checkIndex();
            this.currentDate = dateRangeObj[that.currentIndex];
            this.dateDomRefresh();
            return this;
        },
        checkIndex: function () {
            if (this.currentIndex <= 0) {
                this.currentIndex = 0;
                $('.time-left', this.root).addClass('current-date')
            } else {
                $('.time-left', this.root).removeClass('current-date');
            }
            if (this.currentIndex >= this.dateTabText.length - 1) {
                this.currentIndex = this.dateTabText.length - 1;
                $('.time-right', this.root).addClass('current-date');
            } else {
                $('.time-right', this.root).removeClass('current-date');
            }
        },
        dateDomRefresh: function () {
            var dateStr = this.currentDate;
            $('.date-text', this.root).html(dateStr);
        },
        leftClick: function (e) {
            var $target = $(e.target);
            if (!$target.hasClass('current-date')) {
                this.setDate(-1);
                this.renderChart(this.currentIndex);
            }
        },
        rightClick: function (e) {
            var $target = $(e.target);
            if (!$target.hasClass('current-date')) {
                this.setDate(1);
                this.renderChart(this.currentIndex);
            }
        },
        //格式化留存数据
        formatData: function (res, requestZhData, requestData) {
            var chartData = {}, gridData = {}, legend = [], resData = res.dataObject;
            chartData.xAxis = gridData.headerData = resData.lines[0].cells.map(function (item, i) {
                return i === 0 ? '1' + requestZhData.unit_zh + '之内' : '第' + (i + 1) + requestZhData.unit_zh;
            });
            gridData.requestZhData = requestZhData;
            gridData.bodyData = resData.lines.map(function (item) {
                item.groupValue = parseDate(item.groupValue);
                return item;
            });
            chartData.series = resData.lines.map(function (item, i) {
                var obj = {};
                obj.name = !item.groupValue || item.groupValue === 'null' ? '未知' : parseDate(item.groupValue);
                legend.push(obj.name);
                obj.totalPeople = item.totalPeople;
                obj.data = item.cells.map(function (itemData) {
                    return itemData.people;
                });
                obj.checked = true;
                return obj;
            });
            chartData.seriesPre = resData.lines.map(function (item, i) {
                var obj = {};
                obj.name = !item.groupValue || item.groupValue === 'null' ? '未知' : parseDate(item.groupValue);
                obj.data = item.cells.map(function (itemData) {
                    return itemData.percent;
                });
                obj.checked = true;
                return obj;
            });
            chartData.legend = legend;

            //按留存的类型，周，日，月，处理日期
            function parseDate(dateStr) {
                var dateReg = /^\d{4}-\d{1,2}-\d{1,2}$/, date = dateStr;
                if (date && date.match(dateReg)) {
                    switch (requestData.unit) {
                        case 'week':
                            date = date.replace(/^\d{4}-/, "") + '当周';
                            break;
                        case 'day':
                            date = date.replace(/^\d{4}-/, "");
                            break;
                        case 'month':
                            date = new Date(date).getMonth() + 1 + '月';
                            break;
                    }
                }
                return date;
            }

            return {
                chartData: chartData,
                gridData: gridData
            };
        }
    });

    function RevisitOverview() {

    }

    RevisitOverview.prototype = _.create(Overview.prototype, {
        'constructor': RevisitOverview
    });

    $.extend(RevisitOverview.prototype, {
        root: null,
        options: null,
        ajaxDefer: null,
        //ajaxUrl: __path + '/services/runtime/Retained',
        dataBind: function () {
            this.initRetained();
        },
        //事件绑定
        eventBind: function () {
            //事件委托在上级元素上
            $(this.root).on('click', this.handleEvent);
            // 基于准备好的dom，初始化echarts图表
            this.thisChart = ec.init($('.echarts-main', this.root)[0]); //echarts-main
        },
        // @requestData 请求数据
        // @requestZhData 请求数据中文转述
        requestRender: function (requestData, requestZhData) {

            var ajaxDefer = this.ajaxDefer, that = this;
            if (ajaxDefer) {
                ajaxDefer.abort();
            }
            ajaxDefer = this.ajaxDefer = this.createAjaxDefer(requestData);

            ajaxDefer.then(function (res) {
                    that.echartsTips();
                    //console.log(JSON.stringify({data: requestData}, null, 4));
                    //console.log(JSON.stringify(res, null, 4));
                    if (!res.success || !res.dataObject) {
                        if (!res.success) {
                            that.echartsTips('服务器无响应，请重试！');
                            console.log(res.message);
                        } else {
                            that.echartsTips(res.message || '暂无数据展示！');
                        }
                        that.myChart && that.myChart.clear();
                        return;
                    }
                    $(this.root).removeClass('echarts-disable');
                    that.requestData = requestData;
                    that.requestZhData = requestZhData;
                    that.responesTransformDatas = that.formatData(res, requestZhData, requestData);
                    that.dateTabText = that.responesTransformDatas.chartData.series.map(function (item) {
                        return item.name;
                    });
                    that.setDate();
                    that.renderChart();
                },
                function (err) {

                });
        },

        renderChart: function (index) {
            var ind = index || this.dateTabText.length - 1, that = this;
            if (!this.requestData) {
                return false;
            }
            $(this.root).removeClass('echarts-disable');
            var ops = $.extend(true, {}, this.responesTransformDatas.chartData);
            ops.type = 'bar';
            ops.formatter = '%';
            ops.series = this.responesTransformDatas.chartData.seriesPre;
            ops = os(ops);
            ops.series = [ops.series[ind]];

            ops.tooltip.formatter = function (resData) {
                var data = resData[0], people = that.responesTransformDatas.chartData.series;
                return '<p>' + data.seriesName + '</p><p>回访总人数:' + people[that.currentIndex].totalPeople + '</p><p>' + data.name + '回访人数:' + people[that.currentIndex].data[data.dataIndex] + '</p><p>' + data.name + '回访百分比:' + data.data + '%</p>';
            };
            this.thisChart.resize();
            this.thisChart.setOption(ops, true);
        },
        initRetained: function () {
            var data = this.options.data.Config;
            this.requestRender(data.requestData, data.requestZhData);
        },
        //全局click事件
        click: function (e) {
            var role = e.target.getAttribute('role') || e.currentTarget.getAttribute('role');
            switch (role) {
                case 'dateLeftScroll':
                    this.leftClick(e);
                    break;
                case 'dateRightScroll':
                    this.rightClick(e);
                    break;
                case 'deleteOverview':
                    //this.deleteOverview(e);
                    Overview.remove(this.options.analysisId);
                    break;
                default:
            }
        },
        //滚动分组
        setDate: function (i) {
            var that = this, dateRangeObj = that.dateTabText;
            this.currentIndex = i ? this.currentIndex + i : dateRangeObj.length - 1;
            this.checkIndex();
            this.currentDate = dateRangeObj[that.currentIndex];
            this.dateDomRefresh();
            return this;
        },
        checkIndex: function () {
            if (this.currentIndex <= 0) {
                this.currentIndex = 0;
                $('.time-left', this.root).addClass('current-date')
            } else {
                $('.time-left', this.root).removeClass('current-date');
            }
            if (this.currentIndex >= this.dateTabText.length - 1) {
                this.currentIndex = this.dateTabText.length - 1;
                $('.time-right', this.root).addClass('current-date');
            } else {
                $('.time-right', this.root).removeClass('current-date');
            }
        },
        dateDomRefresh: function () {
            var dateStr = this.currentDate;
            $('.date-text', this.root).html(dateStr);
        },
        leftClick: function (e) {
            var $target = $(e.target);
            if (!$target.hasClass('current-date')) {
                this.setDate(-1);
                this.renderChart(this.currentIndex);
            }
        },
        rightClick: function (e) {
            var $target = $(e.target);
            if (!$target.hasClass('current-date')) {
                this.setDate(1);
                this.renderChart(this.currentIndex);
            }
        },
        //格式化留存数据
        formatData: function (res, requestZhData, requestData) {
            var chartData = {}, gridData = {}, legend = [], resData = res.dataObject, unitText;
            switch (requestData.type) {
                case 'time':
                    unitText = requestData.unit == 'day' ? '小时' : '天';
                    break;
                case 'frequency':
                    unitText = '次';
                    break;
            }
            chartData.xAxis = gridData.headerData = resData.rows[0].cells.map(function (item, i) {
                return (i + 2) + unitText;
            });
            gridData.requestZhData = requestZhData;
            gridData.bodyData = resData.rows.map(function (item) {
                item.groupValue = parseDate(item.groupValue);
                return item;
            });
            chartData.series = resData.rows.map(function (item, i) {
                var obj = {};
                obj.name = !item.groupValue || item.groupValue === 'null' ? '未知' : parseDate(item.groupValue);
                legend.push(obj.name);
                obj.totalPeople = item.totalPeople;
                obj.data = item.cells.map(function (itemData) {
                    return itemData.people;
                });
                obj.checked = true;
                return obj;
            });
            chartData.seriesPre = resData.rows.map(function (item, i) {
                var obj = {};
                obj.name = !item.groupValue || item.groupValue === 'null' ? '未知' : parseDate(item.groupValue);
                obj.data = item.cells.map(function (itemData) {
                    return itemData.percent;
                });
                obj.checked = true;
                return obj;
            });
            chartData.legend = legend;

            //按留存的类型，周，日，月，处理日期
            function parseDate(dateStr) {
                var dateReg = /^\d{4}-\d{1,2}-\d{1,2}$/, date = dateStr;
                if (date && date.match(dateReg)) {
                    switch (requestData.unit) {
                        case 'week':
                            date = date.replace(/^\d{4}-/, "") + '当周';
                            break;
                        case 'day':
                            date = date.replace(/^\d{4}-/, "");
                            break;
                        case 'month':
                            date = new Date(date).getMonth() + 1 + '月';
                            break;
                    }
                }
                return date;
            }

            return {
                chartData: chartData,
                gridData: gridData
            };
        }
    });

    function WorthOverview() {

    }

    WorthOverview.prototype = _.create(Overview.prototype, {
        'constructor': WorthOverview
    });

    $.extend(WorthOverview.prototype, {
        root: null,
        options: null,
        ajaxDefer: null,
        //ajaxUrl: __path + '/services/runtime/Funnel',
        dataBind: function () {
            this.initWorth();
        },
        //事件绑定
        eventBind: function () {
            //事件委托在上级元素上
            $(this.root).on('click', this.handleEvent);
        },
        initWorth: function () {
            this.requestData = this.options.data.Config.requestData;
            this.isCompare = this.requestData.isCompare;
            this.requestZhData = this.options.data.Config.requestZhData;
            this.currentChart = this.options.data.Config.currentChart === 'pie' ? 'bar' : this.options.data.Config.currentChart;
            //设置数据
            this.requestRender(this.requestData, this.requestZhData, this.isCompare);
        },
        initGrid: function () {
            var that = this;
            grid.init({
                root: $('.table-main', that.root),
                gridData: that.responesTransformDatas[0].gridData,
                requestZhData: that.options.data.Config.requestZhData,
                type: 'radar'
            });
        },
        // @requestData 请求数据
        // @requestZhData 请求数据中文转述
        requestRender: function (requestData, requestZhData, isCompare) {

            var that = this;
            var ajaxDefer = that.ajaxDefer;
            if (ajaxDefer) {
                ajaxDefer.abort();
            }

            ajaxDefer = that.ajaxDefer = that.createAjaxDefer(requestData, isCompare);


            ajaxDefer.then(function (res) {
                    //console.log(JSON.stringify({data:requestData}, null, 4));
                    // 已修改对比接口
                    //console.log(JSON.stringify(res, null, 4)); return;
                    if (!res.success || !res.dataObject) {
                        if (!res.success) {
                            that.echartsTips('服务器无响应，请重试！');
                            //console.log(res.msg);
                        } else {
                            that.echartsTips('暂无数据展示！');
                        }
                        return;
                    }

                    if (isCompare) {
                        if (res.dataObject[1].dataObject) {
                            that.responesTransformDatas = res.dataObject.map(function (item) {
                                return transformData(item, requestZhData, requestData);
                            });
                        } else {
                            /*myAnalysis.messageTips('对比无数据，请修改数据日期区间！');
                             echartsTips('对比无数据，请修改数据日期区间！');
                             clearChart();
                             return;*/
                        }
                    } else {
                        that.responesTransformDatas = [that.formatData(res, requestZhData, requestData)];
                    }
                    var myChart = that.thisChart = ec.init($('.echarts-main', that.root)[0]);
                    that.options.data.resData = that.responesTransformDatas;
                    that.currentMenu = that.options.data.Config.requestData.unit;
                    that.renderRadarGroup();
                    that.renderChart();
                    that.initGrid();
                    that.currentChart === 'grid' && $('.charts-icon .grid', that.root).trigger('click');
                },
                function (err) {

                });
        },
        renderChart: function () {
            var that = this, ops = $.extend(true, {}, that.responesTransformDatas[0].chartData);
            ops.type = 'radar';
            ops = os(ops);
            ops.tooltip.formatter = function (resData) {
                var data = resData, gridData = that.responesTransformDatas[0].gridData;
                return '<p>' + data.name + '</p>' + gridData.mainColumn.map(function (item, i) {
                        return '<p>' + item + ':' + data.data.value[i] + ' 占比：' + gridData.bodyData[data.dataIndex].values[i].percent + '% 评分：' + gridData.bodyData[data.dataIndex].values[i].score + '</p>';
                    }).join('');
            };
            ops.tooltip.position = ['50%', '50%'];
            ops.legend.orient = 'vertical';
            ops.legend.left = 10;
            that.thisChart.resize();
            that.thisChart.setOption(ops, true);
        },
        //格式化雷达数据
        formatData: function (res, requestZhData, requestData) {
            var chartData = {},
                gridData = {},
                resData = res.dataObject, group;
            if (!requestData.groupFields || requestData.groupFields.length == 0) {
                resData.lines[0].groupValues = ['全部']
            }
            //null 替换 未知
            resData.lines.forEach(function (item) {
                item.groupValues = item.groupValues.map(function (itemData) {
                    return !itemData.trim() ? '未知' : itemData;
                });
            });
            group = resData.lines.map(function (item) {
                return item.groupValues.join(',');
            });
            resData.sequences = requestZhData.actions.map(function (item) {
                return item.actionName_zh + item.operation_zh;
            });
            gridData.headerData = group;
            gridData.bodyData = resData.lines;
            gridData.mainColumn = resData.sequences;
            gridData.groupFields = group;
            chartData.series = resData.lines.map(function (item, i) {
                var obj = {};
                obj.name = item.groupValues.join(',');
                obj.value = item.values.map(function (itemData) {
                    return itemData.num;
                });
                i < 3 ? obj.checked = true : obj.checked = false;
                return obj;
            });
            chartData.legend = group;
            chartData.radar = resData.sequences.map(function (item, i) {
                var obj = {};
                obj.name = item;
                return obj;
            });
            return {
                chartData: chartData,
                gridData: gridData
            };
        },
        initFunnel: function () {
            var data = this.options.data.Config;
            this.requestRender(data.requestData, data.requestZhData);
        },
        //渲染分组模板
        renderRadarGroup: function () {
            var interText = dot.template($("#overview-group-temp").text());
            $('.group-wrap', this.root).html(interText(this.options.data));
        },
        //全局click事件
        click: function (e) {
            var role = e.target.getAttribute('role') || e.currentTarget.getAttribute('role');
            switch (role) {
                case 'deleteOverview':
                    //this.deleteOverview(e);
                    Overview.remove(this.options.analysisId);
                    break;
                case 'convertChart':
                    this.convertChart(e);
                    break;
                case 'groupChecked':
                    this.groupChecked(e);
                    break;
                default:
                    var type = e.target.getAttribute('data-type');
                    switch (type) {
                        case 'select':
                            this.selectMenu(e);
                            break;
                    }
            }
        },
        //切换图表
        convertChart: function (e) {
            if (!this.responesTransformDatas) {
                return;
            }
            var $target = $(e.target),
                type = this.currentChart = $target.attr('data-type'),
                $grid = $('.table-main', this.root);
            $target.addClass('active').siblings().removeClass('active');
            if (type === 'grid') {
                $('.group-right-text', this.root).show();
                $('.group-st', this.root).hide();
                $('.table-container', this.root).show();
                $('.echarts-container', this.root).hide();
                this.requestData.groupFields.length > 0 && $('.date-tab', this.root).show();
            } else {
                $('.group-right-text', this.root).hide();
                $('.group-st', this.root).show();
                $('.table-container', this.root).hide();
                $('.echarts-container', this.root).show();
            }
            this.currentOverviewChart = type;
        },
        //下拉单击
        selectMenu: function (e) {
            var $target = $(e.target),
                unit = $target.attr('data-value');
            $target.parent().addClass('active').siblings().removeClass('active');
            $target.parents('.dropdown').find('.dropdown-selection-label').html($target.html());
            if (unit === 'num') {
                $('.table-total-style', this.root).removeClass('show-score');
            } else {
                $('.table-total-style', this.root).addClass('show-score');
            }
        },
        //多选下拉
        groupCheckedClass: 'input[role="groupChecked"]',
        groupChecked: function (e) {
            var $target = $(e.target);
            if ($(this.groupCheckedClass + ':checked', this.root).length < 3) {
                $(this.groupCheckedClass, this.root).prop('disabled', false).parent().removeClass('disabled');
            } else {
                $(this.groupCheckedClass, this.root).not(':checked').prop('disabled', true).parent().addClass('disabled');
            }
            if ($target.prop('checked')) {
                $target.parents('.multiselect-item').addClass('active');
            } else {
                $target.parents('.multiselect-item').removeClass('active');
            }
            this.addChartData()
        },
        addChartData: function () {
            var filterName = [],
                isCompare = this.options.data.Config.isCompare;
            var options = this.responesTransformDatas[0].chartData;
            var opsTwo = isCompare ? this.responesTransformDatas[1].chartData : null;
            $(this.groupCheckedClass + ':checked', this.root).each(function () {
                filterName.push($(this).attr('data-name'));
            });
            this.setChartDataChecked(filterName);
            this.renderChart()
        },
        setChartDataChecked: function (param) {
            this.responesTransformDatas.forEach(function (res) {
                res.chartData.series.forEach(function (item) {
                    item.checked = false;
                    param.forEach(function (itemData) {
                        if (item.name === itemData || item.name === (itemData + '-1')) {
                            item.checked = true;
                        }
                    });
                });
            });
        }
    });

    function SpreadOverview() {

    }

    SpreadOverview.prototype = _.create(Overview.prototype, {
        'constructor': SpreadOverview
    });


    // 静态成员
    $.extend(Overview, {
        instances: [],
        constructors: {
            'Event': BehaviorOverview,
            'Funnel': FunnelOverview,
            'Retained': RetainedOverview,
            'Revisit': RevisitOverview,
            'Spread': SpreadOverview,
            'Worth': WorthOverview
        },
        create: function (opts) {
            var instance = _.find(this.instances, function (o) {
                return o.analysisId == opts.UniqueID;
            });
            if (instance && instance.length > 0) {
                //  instance = instance[0];
                return;
            }
            var generator = this.constructors[opts.analysisType];
            var instance = new generator();
            instance.create(opts);
            this.instances.push({
                analysisId: opts.analysisId,
                instance: instance
            });
        },
        init: function (opts) {
            var instance = _.find(this.instances, function (o) {
                return o.analysisId == opts.UniqueID;
            });
            if (instance && instance.length > 0) {
                //  instance = instance[0];
                return;
            }
            var generator = this.constructors[opts.AnalysisType];
            var instance = new generator();
            instance.init(opts);
            this.instances.push({
                analysisId: opts.UniqueID,
                instance: instance
            });
            return instance;
        },
        remove: function (analysisId) {
            var instance = _.find(this.instances, function (o) {
                return o.analysisId == analysisId;
            });

            if (instance && instance instanceof Array && instance.length > 0) {
                instance = instance[0];
            }

            instance.instance.deleteOverview();
            instance.instance = null;
            _.remove(this.instances, function (o) {
                return o.analysisId == analysisId;
            });
        },
        DATE_RANGE_HYPHEN: '至',
        DATE_FORMAT: 'yyyy-MM-dd',
        // 定义时间跨度词，返回时间格式的字符串
        // return date range string
        definedDateRangeWord: function (dateRangeWord, dateFormat, dateRangeHyphen) {

            var now = new Date(),
                start = new Date(),
                end = new Date(),
                diffStartDate = 0,
                diffEndDate = 0;

            dateFormat || (dateFormat = Overview.DATE_FORMAT);
            dateRangeHyphen || (dateRangeHyphen = Overview.DATE_RANGE_HYPHEN);

            switch (dateRangeWord) {
                case 'today':
                    diffStartDate = 0;
                    break;
                case 'yesterday':
                    diffStartDate = -1;
                    diffEndDate = -1;
                    break;
                case 'thisWeek':
                    diffStartDate = -start.getDay() + 1;
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
                    diffStartDate = -now.getMonthDays() + diffEndDate + 1;
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
        //设置对比的日期段
        setCompareRange: function (dateArr) {
            var start = new Date(dateArr[0]);
            var end = new Date(dateArr[1]);
            var diffTime = end.getTime() - start.getTime();

            start.setDate(start.getDate() + -1);
            end = start;
            start = new Date(end.getTime() - diffTime);
            return start.format(Overview.DATE_FORMAT) + Overview.DATE_RANGE_HYPHEN + end.format(Overview.DATE_FORMAT);
        }
        //remove: function (instance) {
        //    instance.deleteOverview();
        //    var uniqueId = instance.options.UniqueID;
        //    instance = null;
        //    _.remove(this.instances, function (o) {
        //        o.analysisId == uniqueId;
        //    })
        //}
    });
    //
    var exports = this;

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Overview;
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = Overview;
    } else {
        exports.zCool = Overview;
    }

    return Overview;

});