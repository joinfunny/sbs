require(
    [
        'echarts',
        './init',
        '../../data-overview/echarts-ops',
        '../../data-overview/echarts-grid-new',
        '../../data-overview/echarts-switch',
        '../transformData',
        '../../analysis-panel'
    ],
    function(ec, myAnalysis, os, grid, switchChart, transformData, AnalysisPanel) {

        $('[data-toggle="tooltip"]').tooltip();

        var myChart = ec.init($('.echarts-main')[0]);

        Object.ns('AppPage.Echarts', {
            myChart: myChart,
            ajaxDefer: null,
            currentChartType: 'radar',
            isCompare: false,
            render: render,
            dataIsEmpty: false,
            requestRender: requestRender,
            responesTransformDatas: [],
            echartsTips: echartsTips
        });

        // 右侧当前分析类型的分析列表
        var analysisPanel = AnalysisPanel.create({
            analysisType: myAnalysis.analysisType,
            mutiSelect: false
        });

        analysisPanel.loadData();
        analysisPanel.on('submit', function(e, analysisId) {
            location.href = __path + '/main/user-analysis/' + myAnalysis.analysisType + '/analysis?id=' + analysisId;
        });


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

        // 发送分析请求数据不合法事件
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
        // @requestData 请求数据
        // @requestZhData 请求数据中文转述
        // @isCompare 是否为对比数据
        function requestRender(requestData, requestZhData, isCompare) {

            var ajaxDefer = AppPage.Echarts.ajaxDefer;
            if (ajaxDefer) {
                ajaxDefer.abort();
            }

            ajaxDefer = AppPage.Echarts.ajaxDefer = createAjaxDefer(requestData, isCompare);

            ajaxDefer.then(function(res) {
                    //console.log(JSON.stringify({data:requestData}, null, 4));
                    // 已修改对比接口
                    //console.log(JSON.stringify(res, null, 4)); return;
                    res.message = res.message && messageFormat(res.message, requestData, requestZhData);
                    if (!res.success || !res.dataObject) {
                        if (!res.success) {
                            myAnalysis.messageTips('服务器无响应，请重试！');
                            echartsTips('服务器无响应，请重试！');
                            //console.log(res.msg);
                        } else {
                            myAnalysis.messageTips(res.message || '暂无数据展示，请修改日期区间！');
                            echartsTips(res.message || '暂无数据展示，请修改日期区间！');
                        }
                        AppPage.Echarts.dataIsEmpty = true;
                        clearChart();
                        $('.page-warp').remove();
                        return;
                    }
                    if (requestData.isCompare && !res.dataObject[0].dataObject) {
                        myAnalysis.messageTips('暂无数据展示，请修改日期区间！');
                        echartsTips('暂无数据展示，请修改日期区间！');
                        clearChart();
                        return;
                    }
                    AppPage.Echarts.dataIsEmpty = false;
                    res.message && myAnalysis.messageTips(res.message);
                    //res[0].bas_events_get_response.msg && myAnalysis.messageTips(res[0].bas_events_get_response.msg);
                    echartsTips();
                    //console.log(res.bas_events_get_response.result);

                    AppPage.Echarts.isCompare = isCompare;
                    AppPage.Echarts.requestData = requestData;
                    AppPage.Echarts.requestZhData = requestZhData;
                    if (isCompare) {
                        if (res.dataObject[1].dataObject) {
                            AppPage.Echarts.responesTransformDatas = res.dataObject.map(function(item) {
                                return transformData(item, requestZhData, requestData);
                            });
                        } else {
                            myAnalysis.messageTips('对比无数据，请修改数据日期区间！');
                            echartsTips('对比无数据，请修改数据日期区间！');
                            clearChart();
                            return;
                        }
                    } else {
                        AppPage.Echarts.responesTransformDatas = [formatData(res, requestZhData, requestData), null];
                    }
                    AppPage.Echarts.render();
                    grid.init({
                        root: myAnalysis.analysisMain.tableWrapper,
                        gridData: AppPage.Echarts.isCompare && AppPage.Echarts.responesTransformDatas[1] ? AppPage.Echarts.responesTransformDatas[1].gridData : AppPage.Echarts.responesTransformDatas[0].gridData,
                        type: 'radarGrid'
                    });

                },
                function(err) {

                });

            //demo data
            /*var demoData = {
             dataObject: {
             lines: [
             {
             groupValues: ['全部'],
             values: [{num: 985, percent: 25, score: 95}, {num: 845, percent: 69, score: 95}, {
             num: 956,
             percent: 23,
             score: 95
             }, {
             num: 325,
             percent: 23, score: 95
             }, {num: 159, percent: 23, score: 95}, {num: 6356, percent: 23, score: 95}]
             },
             {
             groupValues: ['男'],
             values: [{num: 526, percent: 80, score: 95}, {num: 583, percent: 59, score: 95}, {
             num: 58,
             percent: 23,
             score: 95
             }, {
             num: 235,
             percent: 23, score: 95
             }, {num: 365, percent: 23, score: 95}, {num: 455, percent: 23, score: 95}]
             },
             {
             groupValues: ['女'],
             values: [{num: 646, percent: 65, score: 95}, {num: 2858, percent: 65, score: 95}, {
             num: 111,
             percent: 22,
             score: 95
             }, {
             num: 196,
             percent: 23, score: 95
             }, {num: 565, percent: 23, score: 95}, {num: 987, percent: 23, score: 95}]
             },
             {
             groupValues: ['其它'],
             values: [{num: 77, percent: 99, score: 95}, {num: 8899, percent: 98, score: 95}, {
             num: 23,
             percent: 55,
             score: 95
             }, {
             num: 89,
             percent: 23, score: 95
             }, {num: 4566, percent: 23, score: 95}, {num: 565, percent: 23, score: 95}]
             }
             ],
             sequences: ['支付订单金额的人均数', '支付订单的人均次数', '任意事件人数', '注册人数', '提交订单人数', '收到商品人数']
             }
             };
             AppPage.Echarts.isCompare = isCompare;
             AppPage.Echarts.requestData = requestData;
             AppPage.Echarts.requestZhData = requestZhData;
             AppPage.Echarts.responesTransformDatas[0] = formatData(demoData, requestZhData);
             AppPage.Echarts.render();
             grid.init({
             root: myAnalysis.analysisMain.tableWrapper,
             gridData: AppPage.Echarts.responesTransformDatas[0].gridData,
             type: 'radarGrid'
             });*/
        }

        //处理messgae中英文的用户行为字段
        function messageFormat(msg, req, reqZh) {
            var reg = /\[.+\]/,
                matchMsg = msg.match(reg),
                msgZh;
            if (matchMsg) {
                req.actions.some(function(item, i) {
                    if (matchMsg[0].indexOf(item.actionName) != -1) {
                        msgZh = reqZh.actions[i].actionName_zh;
                        return true;
                    }
                });
                msg = msg.replace(reg, msgZh);
            }
            return msg;
        }

        //清空表格 图标
        function clearChart() {
            AppPage.Echarts.requestData = null;
            AppPage.Echarts.responesTransformDatas = [];
            AppPage.Echarts.myChart.clear();
            $(myAnalysis.analysisMain.tableWrapper).empty();
            $('.page-warp').empty();
        }

        // @requestData 请求数据（见API）
        // return defer
        function createAjaxDefer(requestData, isCompare) {
            var data = {
                data: requestData
            };
            var dataStr = JSON.stringify(data);
            var analysisTypeId = AppPage.getAnalysisTypeId(myAnalysis.analysisType);
            //var url = AppPage.UserAnalysis.analysisUrl + '?id=' + analysisTypeId;
            var url = AppPage.UserAnalysis.analysisUrl + '?type=' + myAnalysis.analysisType + '&userName=' + localStorage['bas_userName'];

            return AppPage.loadApi({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: {
                    data: dataStr
                },
                crossDomain: true,
                beforeSend: function() {
                    // 遮罩
                    myAnalysis.loadingMask(true);
                },
                complete: function() {
                    // 去除遮罩
                    myAnalysis.loadingMask(false);
                }
            });
        }

        //格式化雷达数据
        function formatData(res, requestZhData, requestData) {
            var chartData = {},
                gridData = {},
                resData = res.dataObject,
                group;
            if (!requestData.groupFields || requestData.groupFields.length == 0) {
                resData.lines[0].groupValues = ['全部']
            }
            //null 替换 未知
            resData.lines.forEach(function(item) {
                item.groupValues = item.groupValues.map(function(itemData) {
                    return !itemData.trim() ? '未知' : itemData;
                });
            });
            group = resData.lines.map(function(item) {
                return item.groupValues.join(',');
            });
            resData.sequences = requestZhData.actions.map(function(item) {
                return item.actionName_zh + (item.field_zh || '') + (item.operation_zh || '');
            });
            gridData.headerData = group;
            gridData.bodyData = resData.lines;
            gridData.columHeader = resData.sequences;
            chartData.series = resData.lines.map(function(item, i) {
                var obj = {};
                obj.name = item.groupValues.join(',');
                obj.value = item.values.map(function(itemData) {
                    return itemData.num;
                });
                i < 3 ? obj.checked = true : obj.checked = false;
                return obj;
            });
            chartData.legend = group;
            chartData.radar = resData.sequences.map(function(item, i) {
                var obj = {};
                obj.name = item;
                return obj;
            });
            return {
                chartData: chartData,
                gridData: gridData
            };
        }

        // 通过请求数据的判断是否显示图表
        // @requestData 请求数据（见API）
        // return boolean
        function showEcharts(requestData) {
            return requestData && requestData.actions.length < 2 && requestData.groupFields.length < 3;
        }


        $(window).on('resize', function() {
            AppPage.Echarts.render();
        });

        //图表提示信息

        function echartsTips(text) {
            var echartsParent = $('.panel-echarts');
            if (text) {
                echartsParent.addClass('echarts-disable');
                $('.echarts-none', echartsParent).html(text);
            } else {
                echartsParent.removeClass('echarts-disable');
            }
        }

        // 渲染
        function render(chartType) {
            /*if (!AppPage.Echarts.requestData) {
             return false;
             }*/
            $('.panel-echarts').removeClass('echarts-disable');
            // piechart histogram diagram
            var ops = $.extend(true, {}, AppPage.Echarts.responesTransformDatas[0].chartData);
            chartType || (chartType = AppPage.Echarts.currentChartType);
            switch (chartType) {
                case 'radar':
                    ops.type = 'radar';
                    ops = os(ops);
                    break;
            }
            ops.tooltip.formatter = function(resData) {
                var data = resData,
                    gridData = AppPage.Echarts.responesTransformDatas[0].gridData;
                return '<p>' + data.name + '</p>' + gridData.columHeader.map(function(item, i) {
                    return '<p>' + item + ':' + data.data.value[i] + ' 占比：' + gridData.bodyData[data.dataIndex].values[i].percent + '% 评分：' + gridData.bodyData[data.dataIndex].values[i].score + '</p>';
                }).join('');
            };

            ops.legend.orient = 'vertical';
            ops.legend.left = 10;

            AppPage.Echarts.myChart.resize();
            AppPage.Echarts.myChart.setOption(ops, true);

            AppPage.Echarts.currentChartType = chartType;
        }

    });

/*bas.track('useAnalysis', {
    AnalysisType: '漏斗分析'
})*/