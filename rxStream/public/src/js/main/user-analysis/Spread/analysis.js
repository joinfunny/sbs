// 图表公用配置
(function(window) {
    // 使用
    require(
        [
            'AppPage',
            'bootstrap',
            'echarts',
            'main/user-analysis/Event/init',
            'main/data-overview/echarts-ops',
            'main/data-overview/echarts-grid-new',
            'main/data-overview/echarts-switch',
            'main/user-analysis/transformData',
            'main/analysis-panel'
            'main/user-analysis/nodeHelper'
        ],
        function(AppPage, bs, ec, myAnalysis, os, grid, switchChart, transformData, AnalysisPanel, nodeHelper) {

            $('[data-toggle="tooltip"]').tooltip();

            var myChart = ec.init(document.querySelector('.echarts-main'));


            Object.ns('AppPage.Echarts', {
                myChart: myChart,
                ajaxDefers: null,
                currentChartType: 'rel',
                isCompare: false,
                render: render,
                requestRender: requestRender
            });

            function loadAnalysisPanel() {
                var instance = AnalysisPanel.create({
                    analysisType: 'spread',
                    mutiSelect: false,
                    onSubmit: function(analysisId) {
                        location.href = __path + '/main/user-analysis/Spread/analysis?id=' + analysisId;
                    }
                })
                instance.loadData();
                return instance;
            }

            var analysisPanel = loadAnalysisPanel();

            myAnalysis

            // 原始分析请求数据已加载事件、分析请求数据变更事
                .on('originalData dataChange', function(e, data) {
                (AppPage.Echarts.dataIsEmpty && data.isCompare) ||
                requestRender(data.requestData, data.requestZhData, data.isCompare);
            })

            // 保存分析模型事件
            .on('dataSaved', function(e, data) {
                // 若已存在分析模型id，即为编辑页面
                if (this.analysisId) {
                    analysisPanel.updateAnalysisItem(data);
                }
                // 否则为创建页面
                else {
                    analysisPanel.addAnalysisItem(data);
                }
            })

            // 侦听分析模型的分析请求数据事件：原始分析请求数据已加载、分析请求数据变更
            .on('dataInvalid', function(e, data) {
                //
            })

            // 改变图表显示类型
            .on('changeChartType', function(e, chartType) {
                //
                render(chartType, e);
            })

            // 分析模型实例数据已准备
            .allDatasReady();

            // 通过请求数据，跨域获取分析结果，
            // 渲染图形和表格
            // @requestDatas 请求数据集，请求对比数据为第二个（见API）
            function requestRender(requestDatas, requestZhData, isCompare) { //return;
                var ajaxDefer = AppPage.Echarts.ajaxDefer;
                if (ajaxDefer) {
                    ajaxDefer.abort();
                }

                ajaxDefer = AppPage.Echarts.ajaxDefer = createAjaxDefer(requestDatas, isCompare);



                ajaxDefer.then(function(res) { // res 为分析响应的结果，若length==1单个请求，length==2为对比请求
                        AppPage.Echarts.isCompare = res.length > 1;
                        AppPage.Echarts.requestDatas = requestDatas;

                        AppPage.Echarts.responesTransformDatas = res.data;
                        console.log(res);
                        //console.log(AppPage.Echarts.responesTransformDatas);
                        /*AppPage.Echarts.responesTransformDatas.nodes.forEach(function(node) {
                            if (node.person == null) {
                                node.label = {
                                    normal: {
                                        show: true
                                    }
                                }
                            }
                        })*/
                        AppPage.Echarts.render();

                        /*var categories = AppPage.Echarts.responesTransformDatas.categories;
                        var columns = [],
                            maxLevel = 0;

                        categories.forEach(function(category) {
                            maxLevel = maxLevel > category.levels ? maxLevel : category.levels;
                        });

                        columns.push({
                            name: 'subject',
                            title: '主题'
                        });

                        for (var i = 0; i < maxLevel; i++) {
                            columns.push({
                                name: 'level' + i,
                                title: (i + 1) + '级'
                            });
                        }

                        var data = [];

                        categories.forEach(function(category) {
                            if (category.levelNodes.length > 0) {
                                var rowData = {};

                                rowData.subject = category.name;

                                category.levelNodes.forEach(function(levelNode, index) {

                                    rowData['level' + index] = levelNode.length;

                                })

                                data.push(rowData);
                            }
                        });

                        var chartGrid = grid.create('.table-wrapper', {
                            columns: columns
                        });
                        chartGrid.loadData(data);*/

                    },
                    function(err) {

                    });
            }


            // 通过请求数据的判断是否显示图表
            // @requestData 请求数据（见API）
            // return boolean
            function showEcharts(requestData) {
                //return requestData && requestData.actions.length < 2 && requestData.groupFields.length < 3;
                return true;
            }

            // @requestData 请求数据（见API）
            // return defer
            function createAjaxDefer(requestData, isCompare) {
                var requestDataStr = 'bas_event=' + encodeURIComponent(JSON.stringify(requestData));
                return $.ajax({
                    url: __path + "/services/getSpreadData2",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        data: requestDataStr,
                    },
                    //contentType: 'application/json; charset=utf-8',
                    //crossDomain: true,
                    beforeSend: function() {
                        // 遮罩
                        myAnalysis.loadingMask(true);
                    },
                    complete: function() {
                        // 去除遮罩
                        myAnalysis.loadingMask(false);
                    }
                })
            }


            $(window).on('resize', function() {
                AppPage.Echarts.render();
            });

            //图表提示信息

            function echartsTips(text) {
                var echartsParent = $('.panel-echarts');
                echartsParent.addClass('echarts-disable');
                $('.echarts-none', echartsParent).html(text);
            }

            /**
             * 点击&拖拽
             * @param  {[type]} target [description]
             * @return {[type]}        [description]
             */
            function onMyChartClicked(target) {
                //link元素跳过
                try {
                    if (target.data.name.indexOf('link-') > -1) return;
                    var graph = AppPage.Echarts.myChart._model.getSeriesByName('传播分析')[0].getGraph();
                    var ecModel = AppPage.Echarts.myChart.getModel();
                    var curOpts = AppPage.Echarts.myChart.getOption();

                    var timeline = ecModel.getComponent('timeline');
                    var timelineIndex = timeline.getCurrentIndex();

                    var optionSeries0 = curOpts.series[0];
                    var id = target.data.id;
                    var node = graph.getNodeById(id);
                    var data = node.hostGraph.data;
                    var idx = node.dataIndex;
                    var graphicEls = node.hostGraph.data._graphicEls;
                    var pos = graphicEls[idx].position;
                    node = optionSeries0.data[idx];

                    console.log("x:" + node.x + ",y:" + node.y + ";" + pos)

                    /*if (node && node.x == pos[0] && node.y == pos[1]) {
                        if (node.showRelation) {
                            nodeHelper.hideNodeRelation(node, optionSeries0.data, optionSeries0.links);
                        } else {
                            nodeHelper.showNodeRelation(node, optionSeries0.data, optionSeries0.links);
                        }
                    }*/



                    var nodes = AppPage.Echarts.MyChartOption.options[timelineIndex].series[0].data;
                    node = nodes[idx];
                    var links = AppPage.Echarts.MyChartOption.options[timelineIndex].series[0].links;
                    AppPage.Echarts.MyChartOption.baseOption.timeline.currentIndex = timelineIndex;
                    //移动当前坐标以及子坐标
                    nodeHelper.dshiftNode(node, nodes, links, pos[0], pos[1]);
                    AppPage.Echarts.MyChartOption.baseOption = curOpts;
                    AppPage.Echarts.MyChartOption.baseOption.timeline.currentIndex = timelineIndex;
                    AppPage.Echarts.myChart.setOption(AppPage.Echarts.MyChartOption);

                } catch (ex) {
                    //debugger;
                    console.log(ex);
                }
            }

            /**
             * 类别切换
             * @param  {[type]} action [description]
             * @return {[type]}        [description]
             */
            function onLegendSelectedChanged(action) {
                var curOpts = AppPage.Echarts.myChart.getOption();
                var optionSeries0 = curOpts.series[0];
                var name = action.name,
                    selected = action.selected;
                var currentSelectedCategories = [];
                optionSeries0.categories.forEach(function(category, index) {
                    if (selected[category.name]) {
                        currentSelectedCategories.push(index);
                        category.selected = true;
                    } else {
                        category.selected = false;
                    }
                });

                /*optionSeries0.data.forEach(function(node) {
                    delete node.x;
                    delete node.y;
                })
                if (AppPage.Echarts.currentChartType == 'rel1') {
                    nodeHelper.renderNodeGeo(optionSeries0.categories, optionSeries0.data, optionSeries0.links, AppPage.Echarts.myChart.getWidth(), AppPage.Echarts.myChart.getHeight(), 100);
                }*/



                /*optionSeries0.data.forEach(function(node) {
                    node.x = 0;
                    node.y = 0;
                })*/


                //AppPage.Echarts.myChart.clear();
                //nodeHelper.renderNodeGeo(optionSeries0.categories, optionSeries0.data, optionSeries0.links, AppPage.Echarts.myChart.getWidth(), AppPage.Echarts.myChart.getHeight(), 100);
                optionSeries0.roalDetail.x = 0;
                optionSeries0.roalDetail.y = 0;
                optionSeries0.roalDetail.zoom = 1;

                AppPage.Echarts.myChart.setOption(curOpts, true);
            }

            function initDateOptions(graph, myChart) {
                return graph.map(function(item) {
                    var curGraph = item.graph;
                    var categories = _.cloneDeep(curGraph.categories);
                    var optionSeries = {
                        data: _.cloneDeep(curGraph.nodes),
                        links: _.cloneDeep(curGraph.links),
                        categories: _.cloneDeep(curGraph.categories)
                    };
                    nodeHelper.renderNodeGeo(categories, optionSeries.data, optionSeries.links, myChart.getWidth(), myChart.getHeight(), 100);
                    return {
                        series: [optionSeries]
                    };
                })

            }

            function initBaseOption(graph) {
                var categories = graph[graph.length - 1].graph.categories;
                return {
                    title: {
                        text: '',
                        subtext: '',
                        top: 'bottom',
                        left: 'right'
                    },
                    timeline: {
                        data: graph.map(function(item) {
                            return item.time;
                        }),
                        playInterval: 1000,
                        currentIndex: graph.length - 1
                    },
                    tooltip: {
                        formatter: function(item) {
                            if (!item.data) return '';
                            var person = item.data.person;
                            var out = [];
                            if (person) {
                                out.push('    ID：' + person.id);
                                out.push('  姓名：' + person.name);
                                out.push('  性别：' + person.sex);
                                out.push('  城市：' + person.address);
                                out.push('浏览量：' + item.data.value);

                            }
                            return out.join('<br />');
                        }
                    },
                    legend: [{
                        orient: 'vertical',
                        align: 'left',
                        left: 'left',
                        data: categories.map(function(a) {
                            return {
                                name: a.name,
                                selected: true
                            };
                        })
                    }],
                    animation: true,
                    animationDuration: 1500,
                    animationEasingUpdate: 'quinticInOut',
                    calculable: true,
                    large: true,
                    series: [{
                        name: '传播分析',
                        type: 'graph',
                        layout: 'none',
                        data: [],
                        links: [],
                        categories: categories,
                        roam: true,
                        roamDetail: {
                            x: 0,
                            y: 0,
                            zoom: 1
                        },
                        hoverable: false,
                        draggable: true,
                        label: {
                            normal: {
                                position: 'bottom',
                                formatter: function(params) {
                                    return params.name;
                                }
                            }
                        },
                        lineStyle: {
                            normal: {
                                curveness: 0.3,
                                opacity: 0.2
                            },
                            emphasis: {
                                opacity: 0.5,
                                width: 1,
                                shadowColor: 'rgba(0, 0, 0, 0.5)',
                                shadowBlur: 2
                            }
                        }
                    }]
                };
            }


            // 渲染
            function render(chartType) {
                if (!AppPage.Echarts.requestDatas) {
                    return false;
                }
                if (!showEcharts(AppPage.Echarts.requestDatas[0])) {
                    echartsTips('多指标或多于2种分组维度的查询不支持图形展示');
                    AppPage.Echarts.myChart.clear();
                    return false;
                }

                AppPage.Echarts.myChart.dispose();

                AppPage.Echarts.myChart = ec.init(document.querySelector('.echarts-main'))

                $('.panel-echarts').removeClass('echarts-disable');

                chartType || (chartType = AppPage.Echarts.currentChartType);

                var graph = AppPage.Echarts.responesTransformDatas;

                var graphCategories = graph[graph.length - 1].categories;
                var baseOption = initBaseOption(graph);
                var dateOptions = initDateOptions(graph, AppPage.Echarts.myChart);

                /*var optionSeries0 = option.series[0];

                graph.categories.forEach(function(category, index) {
                    category.selected = true;
                });

                graph.nodes.forEach(function(node) {
                    delete node.x;
                    delete node.y;
                });
                optionSeries0.data = _.cloneDeep(graph.nodes);
                optionSeries0.links = _.cloneDeep(graph.links);
                optionSeries0.categories = _.cloneDeep(graph.categories);*/

                AppPage.Echarts.MyChartOption = {
                    baseOption: baseOption,
                    options: dateOptions
                };


                /*switch (chartType) {
                    case 'rel':
                        nodeHelper.renderNodeGeo(optionSeries0.categories, optionSeries0.data, optionSeries0.links, AppPage.Echarts.myChart.getWidth(), AppPage.Echarts.myChart.getHeight(), 100);
                        optionSeries0.layout = 'none';
                        optionSeries0.lineStyle.normal.curveness = '0.3';
                        break;
                    case 'rel1':
                        optionSeries0.data.forEach(function(node) {
                            node.symbolSize = 5;
                        })
                        nodeHelper.renderNodeGeo(optionSeries0.categories, optionSeries0.data, optionSeries0.links, AppPage.Echarts.myChart.getWidth(), AppPage.Echarts.myChart.getHeight(), 100);
                        optionSeries0.layout = 'none';
                        optionSeries0.lineStyle.normal.curveness = '0.3';
                        break;
                    case 'map':
                        break;
                }*/

                AppPage.Echarts.myChart.clear();
                AppPage.Echarts.myChart.resize();
                AppPage.Echarts.myChart.setOption(AppPage.Echarts.MyChartOption);
                AppPage.Echarts.myChart.off('click');
                //AppPage.Echarts.myChart.off('legendselectchanged');
                AppPage.Echarts.myChart.on('click', onMyChartClicked);
                //AppPage.Echarts.myChart.on('legendselectchanged', onLegendSelectedChanged)
                AppPage.Echarts.currentChartType = chartType;



            }

        });

})(this);