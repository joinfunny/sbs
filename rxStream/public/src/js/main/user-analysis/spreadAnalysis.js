// 图表公用配置
(function(window) {

 
    var option = {
        //    title : {
        //        text: '浏览商品的总次数，按商品名称查看',
        //        subtext: '纯属虚构'
        //    },
        tooltip: {
            trigger: 'axis'
        },
        //    legend: {
        //        data:['最高金额','最低金额']
        //    },
        toolbox: {
            show: true,
            feature: {
                //mark : {show: true},
                dataView: {
                    show: true,
                    readOnly: false
                },
                magicType: {
                    show: true,
                    type: ['line', 'bar']
                },
                restore: {
                    show: true
                },
                //saveAsImage : {show: true}
            }
        },
        calculable: true,
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        }],
        yAxis: [{
            type: 'value',
            axisLabel: {
                formatter: '{value} 元'
            }
        }],
        series: [{
            name: '最高金额',
            type: 'line',
            data: [2345, 4786, 1447, 2318, 9916, 4327, 6689],
            markPoint: {
                data: [{
                    type: 'max',
                    name: '最大值'
                }, {
                    type: 'min',
                    name: '最小值'
                }]
            },
            markLine: {
                data: [{
                    type: 'average',
                    name: '平均值'
                }]
            }
        }, {
            name: '最低金额',
            type: 'line',
            data: [1, -2, 2, 5, 3, 2, 0],
            markPoint: {
                data: [{
                    name: '周最低',
                    value: -2,
                    xAxis: 1,
                    yAxis: -1.5
                }]
            },
            markLine: {
                data: [{
                    type: 'average',
                    name: '平均值'
                }]
            }
        }]
    };
    var mapOption = {
        timeline: {
            data: [
                '2002-01-01', '2003-01-01', '2004-01-01', '2005-01-01', '2006-01-01', '2007-01-01', '2008-01-01', '2009-01-01', '2010-01-01', '2011-01-01'
            ],
            label: {
                formatter: function(s) {
                    return s.slice(0, 4);
                }
            },
            autoPlay: true,
            playInterval: 1000,
            loop: false
        },
        legend: {
            selectedMode: 'single',
            data: ['GDP']
        },
        series: [{
            'name': 'GDP',
            'type': 'map',
            'itemStyle': {
                normal: {
                    label: {
                        show: true
                    }
                },
                emphasis: {
                    label: {
                        show: true
                    }
                }
            }
        }]
    };

    // 使用
    require(
        [
            __path + '/main/data-overview/js/echarts-ops',
            __path + '/main/data-overview/js/echarts-grid-x',
        	__path + '/main/user-analysis/js/analysis',
            __path + '/data/pseudo-data',
            'echarts'
        ],
        function(os, grid, myAnalysis, pdata, ec) {

            var myChart = ec.init(document.querySelector('.echarts-main'));
            var mapTypes = ['china'];
            pdata.metaData.china.forEach(function(item, index) {
                mapTypes.push(item[0]);
            });

            function initGridColumns(mapType) {
                mapType || (mapType = 'china');
                var data = pdata.metaData.china,
                    columns;
                if (mapType != 'china') {
                    for (var i = 0, len = data.length; i < len; i++) {
                        if (data[i][0] == mapType) {
                            data = data[i][1];
                            break;
                        }
                    }
                    columns = data.map(function(item) {
                        return {
                            'name': item,
                            'title': item
                        };
                    });
                } else {
                    columns = data.map(function(item) {
                        return {
                            'name': item[0],
                            'title': item[0]
                        };
                    });
                }

                columns.unshift({
                    'name': 'date',
                    'title': '时间',
                    'styler': function(value, row, index) {
                        if (value > 2005) {
                            return 'color:red';
                        }
                        if (value < 2005) {
                            return 'color:gray';
                        }
                    },
                    'cls': 'icon-echarts icon-map'
                });
                return columns;
            }

            var chartGrid = grid.create('.table-wrapper', {
                columns: initGridColumns()
            });

            Object.ns('AppPage.Echarts', {
                myChart: myChart,
                data: pdata,
                currentChartType: 'map',
                currentMapType: 'china',
                currentMapComposeChart: 'none',
                currentDataIndex: 0,
                render: render,
                switchRender: switchRender,
                grid: chartGrid,
                metaData: {
                    mapTypes: mapTypes,
                    mapOption: mapOption
                }
            });

            // 切换渲染（演示）
            function switchRender() {
                AppPage.Echarts.render('', AppPage.Echarts.currentDataIndex === 0 ? 1 : 0);
            }


            function render(chartType, dataIndex) {
                var ops;
                chartType || (chartType = AppPage.Echarts.currentChartType);
                dataIndex == undefined && (dataIndex = AppPage.Echarts.currentDataIndex);
                renderChart(chartType, dataIndex);
                renderGrid(chartType, dataIndex);
                renderMapNavigation(chartType, dataIndex);
            }

            function renderChart(chartType,dataIndex){
                var ops, mapType;
                chartType || (chartType = AppPage.Echarts.currentChartType);
                dataIndex == undefined && (dataIndex = AppPage.Echarts.currentDataIndex);
                mapType = AppPage.Echarts.currentMapType;
                switch (chartType) {
                    /*case 'funnel':
                        break;
                    case 'piechart':
                        break;*/
                    case 'map':
                        ops = generateMapOptions(ops, mapType, dataIndex);
                        break;
                }

                AppPage.Echarts.myChart.resize();
                AppPage.Echarts.myChart.clear();
                console.log(ops);
                AppPage.Echarts.myChart.setOption(ops, true);
                AppPage.Echarts.currentChartType = chartType;
                AppPage.Echarts.currentDataIndex = dataIndex;
            }

            // 渲染地图
            function renderMap(e) {
                var $target = $(e.target),
                    activeClass = 'actived',
                    ops = AppPage.Echarts.currentChartOption,
                    dataIndex = AppPage.Echarts.currentDataIndex,
                    mapType = AppPage.Echarts.currentMapType;
                e.preventDefault();
                if ($target.hasClass(activeClass)) {
                    $target.removeClass(activeClass);
                    AppPage.Echarts.currentMapComposeChart = 'none';
                } else {
                    $target.siblings().removeClass(activeClass);
                    $target.addClass(activeClass);
                    AppPage.Echarts.currentMapComposeChart = $target.data('chart-type');;
                }
                ops = generateMapOptions(ops, mapType, dataIndex);
                AppPage.Echarts.myChart.resize();
                AppPage.Echarts.myChart.clear();
                AppPage.Echarts.myChart.setOption(ops, true);
            }

            function generateMapOptions(currentChartOption, mapType, dataIndex) {
                var ops;
                if (!currentChartOption) {
                    ops = mapOption;
                    ops.type = 'map';
                    ops = os(ops);
                    var tData, oldOpts, newOpts,
                        timeLineData = pdata.mapData[dataIndex];
                    if (ops.timeline.data.length > 0) {
                        tData = ops.timeline.data;
                        oldOpts = $.extend(true, {}, ops);
                        baseSeries = oldOpts.series;
                        newOpts = ops.options = [];
                        tData.map(function(item, index) {
                            var year = item.slice(0, 4);
                            newOpts[index] = $.extend(true, {}, oldOpts);
                            newOpts[index].series[0].mapType = mapType;
                            newOpts[index].series[0].roam = false; //地图缩放
                            newOpts[index].series[0].data = timeLineData[year];
                        });
                    }
                } else {
                    ops = currentChartOption;
                }
              

                var chartType = AppPage.Echarts.currentMapComposeChart;
                if (chartType == 'none') return ops;
                if (chartType == 'funnel') {
                    ops.options.forEach(function(option) {
                        var serie = $.extend(true, {}, option.series[0]);
                        option.series[0].mapLocation = {
                            x: '5%',
                            width: "45%"
                        };
                        serie.type = 'funnel';
                        serie.x = '50%';
                        serie.y = '20%';
                        serie.width = '50%';
                        serie.height = '60%';
                        serie.max = 99999;
                        serie.x2 = '100%';
                        serie.y2 = '80%';
                        serie.funnelAlign = 'center';
                        option.series[1] = serie;
                    });
                }
                if (chartType == 'pie') {
                    ops.options.forEach(function(option) {
                        var serie = $.extend(true, {}, option.series[0]);
                        option.series[0].mapLocation = {
                            x: '5%',
                            width: "45%"
                        };
                        serie.type = 'pie';
                        serie.center = ['75%', '50%'];
                        var offsetWidth = AppPage.Echarts.myChart.dom.offsetWidth;
                        var offsetHeight = AppPage.Echarts.myChart.dom.offsetHeight;
                        serie.radius = [0, Math.round(Math.floor(offsetWidth * 0.1))];
                        option.series[1] = serie;
                    });
                }
                return ops;
            }

            //渲染Grid
            function renderGrid(chartType, dataIndex) {
                var ops, mapType,
                    pdata = AppPage.Echarts.data;
                chartType || (chartType = AppPage.Echarts.currentChartType);
                dataIndex || (dataIndex = AppPage.Echarts.currentDataIndex);
                mapType = AppPage.Echarts.currentMapType;
                if (chartType == 'map') {
                    //加载grid数据
                    var gridData = [],
                        tmpMapData = $.extend(true, {}, pdata.mapData[dataIndex]),
                        rowData = {};
                    //数据格式转换
                    for (var i in tmpMapData) {
                        if (!isNaN(i)) { //剔除2002Max etc.
                            var curData = tmpMapData[i];
                            rowData = {};
                            rowData['date'] = i;
                            curData.forEach(function(item, index) {
                                rowData[item.name] = item.value;
                            });
                            gridData.push(rowData);
                        }
                    }
                    AppPage.Echarts.grid.setOptions({
                        columns: initGridColumns(mapType)
                    });
                    AppPage.Echarts.grid.loadData(gridData);
                }
            }

            //地图数据导航
            function renderMapNavigation(chartType, dataIndex) {
                var ops, mapType;
                chartType || (chartType = AppPage.Echarts.currentChartType);
                dataIndex || (dataIndex = AppPage.Echarts.currentDataIndex);
                mapType = AppPage.Echarts.currentMapType;
                if (chartType == 'map') {
                    if (dataIndex > 0) {
                        $('.breadcrumb').html('<li><a href="#" role="mapNavLinkBtn">全国</a></li><li><a href="#" role="mapNavLinkBtn">' + mapType + '</a></li>');
                    } else {
                        $('.breadcrumb').html('<li><a href="#" role="mapNavLinkBtn">全国</a></li>');
                    }
                }
            }

            function bindHandleEvent() {
                $(document).on('click', handleEvent);
                var myChart = AppPage.Echarts.myChart;
                var mapTypes = AppPage.Echarts.metaData.mapTypes;
                var mapOption = $.extend(true, {}, AppPage.Echarts.metaData.mapOption);
                var config = require('echarts/config');

                myChart.on(config.EVENT.CLICK, function(e, eChart) {
                    var name = e.name,
                        index = mapTypes.indexOf(name);
                    if (index > -1) {
                        AppPage.Echarts.currentDataIndex = index;
                        AppPage.Echarts.currentMapType = mapTypes[index];
                        render('map', AppPage.Echarts.currentDataIndex);
                    }
                });

                /*$(window).on('resize', function() {
                    AppPage.Echarts.render();   
                });*/
            }

            function handleEvent(e) {
                var role = e.target.getAttribute('role');
                switch (role) {
                    case 'toggleDateRangeCompareBtn':
                        toggleContrast();
                        break;
                    case 'mapNavLinkBtn':
                        redirectMap(e);
                        break;
                    case 'switchMapChartBtn':
                        renderMap(e);
                        break;
                }
            }

            function redirectMap(e) {
                var mapType = AppPage.Echarts.currentMapType = e.target.text.replace('全国', 'china');
                AppPage.Echarts.currentDataIndex = AppPage.Echarts.metaData.mapTypes.indexOf(mapType);
                render();
            }

            bindHandleEvent();
            render();
        }
    );
})(this);