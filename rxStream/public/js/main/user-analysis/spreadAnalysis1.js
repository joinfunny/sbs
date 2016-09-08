

// 图表公用配置
(function(window) {

    // 使用
    require(
        [
            'echarts',
            './main/user-analysis/Spread/init',
            './main/data-overview/echarts-ops',
            './main/data-overview/echarts-grid-x',
            './main/data-overview/echarts-switch',
            './main/user-analysis/transformData',
            './main/js/analysis-panel'
        ],
        function(ec, myAnalysis, os, grid, switchChart, transformData, AnalysisPanel) {

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
                    analysisType: 'behavior',
                    mutiSelect: false,
                    onSubmit: function(analysisId) {
                        location.href = __path + '/main/user-analysis/Spread/analysis?id=' + analysisId;
                    }
                })
                instance.loadData();
                return instance;
            }

            var analysisPanel = loadAnalysisPanel();

            myAnalysis.on('onAnalysisSaved', function(event, data) {
                if (AppPage.queryString('id')) {
                    analysisPanel.updateAnalysisItem(data);
                } else {
                    if (myAnalysis.analysisId) {
                        analysisPanel.addAnalysisItem(data);
                    } else {
                        analysisPanel.updateAnalysisItem(data);
                    }
                }
            });
            // 通过请求数据，跨域获取分析结果，
            // 渲染图形和表格
            // @requestDatas 请求数据集，请求对比数据为第二个（见API）
            function requestRender(requestDatas, requestZhData) { //return;
                if (AppPage.Echarts.ajaxDefers) {
                    AppPage.Echarts.ajaxDefers.forEach(function(ajaxItem) {
                        ajaxItem.abort();
                    });
                }
                var ajaxDefers = AppPage.Echarts.ajaxDefers = requestDatas.map(function(requestData) {
                    return ajaxDefer(requestData);
                });


                Promise.all(ajaxDefers)
                    .then(function(res) { // res 为分析响应的结果，若length==1单个请求，length==2为对比请求
                            AppPage.Echarts.isCompare = res.length > 1;
                            //if (res[0].error_response || !res[0].bas_events_get_response.result.lines.length || !res[0].bas_events_get_response.result.sequences.length) {
                            //    if (res[0].error_response) {
                            //        myAnalysis.messageTips('服务器无响应，请重试！');
                            //        echartsTips('服务器无响应，请重试！');
                            //    } else {
                            //        echartsTips('暂无数据展示，请修改日期区间！');
                            //    }
                            //    AppPage.Echarts.myChart.clear();
                            //    $(analysisMain.tableWrapper).empty();
                            //    return;
                            //}
                            //res[0].bas_events_get_response.msg && myAnalysis.messageTips(res[0].bas_events_get_response.msg);
                            // 抽取实际操作的数据
                            //var results = res.map(function (res) {
                            //    return res.bas_events_get_response.result;
                            //});
                            //$('.panel-echarts').removeClass('echarts-disable');
                            //console.log(res.bas_events_get_response.result);

                            AppPage.Echarts.requestDatas = requestDatas;
                            //AppPage.Echarts.requestZhData = requestZhData;
                            AppPage.Echarts.responesTransformDatas = res[0].data;
                            //console.log(AppPage.Echarts.responesTransformDatas);
                            AppPage.Echarts.responesTransformDatas.nodes.forEach(function(node) {

                                if (node.id.indexOf('subject-') > -1) {
                                    node.label = {
                                        normal: {
                                            show: true
                                        }
                                    }
                                }
                            })
                            AppPage.Echarts.render();

                            var categories = AppPage.Echarts.responesTransformDatas.categories;
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
                            chartGrid.loadData(data);

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
            function ajaxDefer(requestData) {
                var requestDataStr = 'bas_event=' + encodeURIComponent(JSON.stringify(requestData));
                return $.ajax({
                    url: __path + "/services/getSpreadData",
                    type: 'POST',
                    dataType: 'json',
                    data: requestDataStr,
                    crossDomain: true,
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

            var nodeHelper = {
                nodeGeos: [
                    [],
                    [
                        [1 / 2, 1 / 2]
                    ],
                    [
                        [1 / 4, 1 / 2],
                        [3 / 4, 1 / 2]
                    ],
                    [
                        [1 / 2, 1 / 3],
                        [1 / 3, 2 / 3],
                        [2 / 3, 2 / 3]
                    ],
                    [
                        [1 / 2, 1 / 2],
                        [1 / 4, 1 / 4],
                        [3 / 4, 1 / 4],
                        [1 / 2, 3 / 4]
                    ],
                    [
                        [1 / 2, 1 / 2],
                        [1 / 4, 1 / 4],
                        [3 / 4, 1 / 4],
                        [1 / 4, 3 / 4],
                        [3 / 4, 3 / 4]
                    ]
                ],
                renderNodeGeo: function(categories, nodes, links, width, height, radius) {
                    var selectedCateogoryLen = _.filter(categories, function(category) {
                            return category.selected
                        }).length,
                        geoArr = this.nodeGeos[selectedCateogoryLen],
                        geoIndex = 0;
                    categories.forEach(function(category, index) {
                        if (!category.selected) return;
                        var x = geoArr[geoIndex][0] * width,
                            y = geoArr[geoIndex][1] * height;
                        console.log(x);
                        console.log(y);
                        var rootNode = getRootNode(index);
                        rootNode.x = x;
                        rootNode.y = y;
                        geoIndex += 1;
                        var nextNodes = getNextNodes(index, rootNode.id);

                        if (nextNodes && nextNodes.length > 0) {
                            renderNextNodesGeo(index, rootNode, nextNodes, 0, Math.PI * 2, radius);
                        }
                    })

                    function getRootNode(categoryId) {
                        var rootNode = _.find(nodes, function(node) {
                            return node.id == 'subject-' + categoryId;
                        });
                        return rootNode;
                    }

                    function getNextNodes(categoryId, id) {
                        var ids = _.filter(links, function(link) {
                            return link.source == id && link.category == categoryId;
                        }).map(function(link) {
                            return link.targetNode.id;
                        });

                        return _.filter(nodes, function(node) {
                            return ids.indexOf(node.id) > -1;
                        })
                    }

                    function renderNextNodesGeo(categoryId, parentNode, nextNodes, startArc, endArc, radius) {
                        nextNodes = _.filter(nextNodes, function(nextNode) {
                            return !(nextNode.x || nextNode.y);
                        })
                        var nodeLen = nextNodes.length,
                            arcLen = endArc - startArc,
                            interval = arcLen / nodeLen,
                            curPi = startArc;

                        var hasChildNodes = [],
                            hasNotChildNodes = [];
                        nextNodes.forEach(function(nextNode, index) {
                            nextNode.NextNodes = getNextNodes(categoryId, nextNode.id);
                            nextNode.hasChild = nextNode.NextNodes && nextNode.NextNodes.length > 0;
                            nextNode.radius = nextNode.hasChild ? radius : Math.ceil(radius * Math.random() / 2 + radius / 10);
                            if (nextNode.hasChild) {
                                hasChildNodes.push(nextNode);
                            } else {
                                hasNotChildNodes.push(nextNode);
                            }
                        })

                        nodeLen = hasChildNodes.length;
                        arcLen = endArc - startArc;
                        interval = arcLen / nodeLen;
                        curPi = startArc;

                        for (var i = 0; i < nodeLen; i++) {
                            curPi += interval;

                            var curNode = hasChildNodes[i],
                                cx = parentNode.x,
                                cy = parentNode.y,
                                nodeX = cx + Math.cos(curPi) * curNode.radius,
                                nodeY = cy + Math.sin(curPi) * curNode.radius;
                            curNode.x = nodeX;
                            curNode.y = nodeY;

                            var childR = radius; //+ Math.ceil(5 * Math.random());
                            childR = childR > 0 ? childR : 1;
                            var arcLen = interval / 2 + Math.asin(radius / childR * Math.sin(interval / 2));
                            var childStartArc = curPi - (arcLen - interval) / 2,
                                childEndArc = childStartArc + arcLen;

                            renderNextNodesGeo(categoryId, curNode, curNode.NextNodes, childStartArc, childEndArc, childR);

                            delete curNode.NextNodes;
                            delete curNode.hasChild;
                            delete curNode.radius;
                        }

                        nodeLen = hasNotChildNodes.length;
                        arcLen = Math.PI * 2;
                        interval = arcLen / nodeLen;

                        curPi = 0;
                        for (var i = 0; i < nodeLen; i++) {
                            curPi += interval;
                            var curNode = hasNotChildNodes[i],
                                cx = parentNode.x,
                                cy = parentNode.y,
                                nodeX = cx + Math.cos(curPi) * curNode.radius,
                                nodeY = cy + Math.sin(curPi) * curNode.radius;
                            curNode.x = nodeX;
                            curNode.y = nodeY;
                            delete curNode.NextNodes;
                            delete curNode.hasChild;
                            delete curNode.radius;
                        }
                    }
                }
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
                $('.panel-echarts').removeClass('echarts-disable');

                chartType || (chartType = AppPage.Echarts.currentChartType);

                var graph = AppPage.Echarts.responesTransformDatas;

                var graphCategories = graph.categories;

                var option = {
                    title: {
                        text: '',
                        subtext: '',
                        top: 'bottom',
                        left: 'right'
                    },
                    tooltip: {
                        formatter: function(item) {
                            var person = item.data.person;
                            var out = [];
                            if (person) {
                                out.push('    ID：' + person.id);
                                out.push('  姓名：' + person.name);
                                out.push('  性别：' + person.sex);
                                out.push('  城市：' + person.address);

                            }
                            var chartCategories = AppPage.Echarts.myChart.getOption().series[0].categories;
                            var categories = item.data.categories;
                            var values = item.data.values;
                            if (categories && categories.length > 0) {
                                !item.data.prevLink ? out.push('传播主题：') : out.push('浏览量：')

                                categories.forEach(function(category, index) {
                                    var curCategory = chartCategories[category];
                                    if (curCategory && curCategory.selected) {
                                        out.push(curCategory.name + '：' + values[index]);
                                    }

                                });
                            }

                            return out.join('<br />');
                        }
                    },
                    legend: [{
                        orient: 'vertical',
                        align: 'left',
                        left: 'left',
                        data: graph.categories.map(function(a) {
                            return a.name;
                        })
                    }],
                    animation: false,
                    animationDuration: 1000,
                    animationEasingUpdate: 'linear',
                    series: [{
                        name: '传播分析',
                        type: 'graph',
                        layout: 'force',
                        data: graph.nodes,
                        links: graph.links,
                        categories: graph.categories,
                        roam: true,
                        hoverable: true,
                        draggable: true,
                        animation: false,
                        label: {
                            normal: {
                                position: 'right',
                                formatter: function(params) {
                                    return '传播主题：' + params.name;
                                }
                            }
                        },
                        roamDetail: {
                            x: 0,
                            y: 0,
                            zoom:1
                        },
                        lineStyle: {
                            normal: {
                                curveness: 0
                            }
                        },
                        force: {
                            repulsion: 1000
                        }
                    }]
                };

                graph.categories.forEach(function(category, index) {
                    category.selected = true;
                });

                graph.nodes.forEach(function(node) {
                    delete node.x;
                    delete node.y;
                });
                option.series[0].data = _.cloneDeep(graph.nodes);
                option.series[0].links = _.cloneDeep(graph.links);
                option.series[0].categories = _.cloneDeep(graph.categories);
                AppPage.Echarts.myChart.clear();
                switch (chartType) {
                    case 'rel':
                        option.series[0].layout = 'force';
                        option.series[0].lineStyle.normal.curveness = '0.2';
                        break;
                    case 'rel1':
                        //AppPage.Echarts.myChart.clear();
                        nodeHelper.renderNodeGeo(option.series[0].categories, option.series[0].data, option.series[0].links, AppPage.Echarts.myChart.getWidth(), AppPage.Echarts.myChart.getHeight(), 100);
                        option.series[0].layout = 'none';
                        option.series[0].lineStyle.normal.curveness = '0';
                        break;
                    case 'map':
                        break;
                }


                AppPage.Echarts.myChart.resize();
                AppPage.Echarts.myChart.setOption(option);

                AppPage.Echarts.myChart.off('legendselectchanged');

                AppPage.Echarts.myChart.on('legendselectchanged', function(action) {
                    onLegendSelectedChanged(action);
                });

                function onLegendSelectedChanged(action) {
                    console.log(AppPage.Echarts.myChart.getOption());
                    var optionSeries0 = option.series[0];
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

                    optionSeries0.data.forEach(function(node, index) {
                        var nodeCategories = node.categories;
                        if (nodeCategories.length > 0) {
                            for (var i = 0, len = nodeCategories.length; i < len; i++) {
                                if (currentSelectedCategories.indexOf(nodeCategories[i]) >= 0) {
                                    node.category = nodeCategories[i];
                                    break;
                                }
                            }
                        }
                    });
                    var links = _.cloneDeep(graph.links);

                    links = _.filter(links, function(link) {
                        return currentSelectedCategories.indexOf(link.category) >= 0;
                    });
                    optionSeries0.links = links;
                    AppPage.Echarts.myChart.resize();
                    optionSeries0.data.forEach(function(node) {
                        delete node.x;
                        delete node.y;
                    })
                    if (AppPage.Echarts.currentChartType == 'rel1') {
                        nodeHelper.renderNodeGeo(optionSeries0.categories, optionSeries0.data, optionSeries0.links, AppPage.Echarts.myChart.getWidth(), AppPage.Echarts.myChart.getHeight(), 100);
                    }
                    AppPage.Echarts.myChart.setOption(option);
                }

                AppPage.Echarts.currentChartType = chartType;
            }

            // 用原始数据请求
            myAnalysis.originalDataRequestRender(requestRender);
        }
    );


})(this);