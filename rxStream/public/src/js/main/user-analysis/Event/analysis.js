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
    ],
    function(AppPage, bs, ec, myAnalysis, os, grid, switchChart, transformData, AnalysisPanel) {

        $('[data-toggle="tooltip"]').tooltip();

        var myChart = ec.init(document.querySelector('.echarts-main'));

        Object.ns('AppPage.Echarts', {
            myChart: myChart,
            ajaxDefer: null,
            currentChartType: 'bar',
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
            // 清除请求
            clearAjaxDefer();
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

            var ajaxDefer = createAjaxDefer(requestData, isCompare);

            ajaxDefer.then(function(res) {
                    //console.log(JSON.stringify({data:requestData}, null, 4));
                    // 已修改对比接口
                    //console.log(JSON.stringify(res, null, 4)); return;

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
                        clearChart()
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
                                return transformData(item.dataObject, requestZhData, requestData);
                            });
                        } else {
                            myAnalysis.messageTips('对比无数据，请修改数据日期区间！');
                            echartsTips('对比无数据，请修改数据日期区间！');
                            clearChart();
                            return;
                        }
                    } else {
                        AppPage.Echarts.responesTransformDatas = [transformData(res.dataObject, requestZhData, requestData), null];
                    }
                    //
                    AppPage.Echarts.render();
                    grid.init({
                        root: myAnalysis.analysisMain.tableWrapper,
                        gridData: AppPage.Echarts.isCompare && AppPage.Echarts.responesTransformDatas[1] ? AppPage.Echarts.responesTransformDatas[1].gridData : AppPage.Echarts.responesTransformDatas[0].gridData,
                        tdFormat: tdFormat
                    });

                },
                function(err) {

                });
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

            clearAjaxDefer();

            var data = {
                data: requestData
            };
            var dataStr = JSON.stringify(data);
            var analysisTypeId = AppPage.getAnalysisTypeId(myAnalysis.analysisType);
            var url = AppPage.UserAnalysis.analysisUrl + '?type=' + myAnalysis.analysisType;

            return AppPage.Echarts.ajaxDefer = AppPage.loadApi({
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

        // 清除请求
        function clearAjaxDefer() {
            var ajaxDefer = AppPage.Echarts.ajaxDefer;
            if (ajaxDefer) {
                ajaxDefer.abort();
                delete AppPage.Echarts.ajaxDefer;
            }
        }

        // 通过请求数据的判断是否显示图表
        // @requestData 请求数据（见API）
        // return boolean
        function showEcharts(requestData) {
            return requestData && requestData.actions.length < 2 && requestData.groupFields.length < 3;
        }

        //格式化td
        function tdFormat(td) {
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
        }

        //显示对比饼图对应的时间段
        function showPieDate(b) {
            var echartsParent = $('.pie-range-warp');
            if (b) {
                $('.source-date').html($('[name="dateRange1"]').val());
                $('.compare-date').html($('[name="dateRange2"]').val());
                echartsParent.show();
            } else {
                echartsParent.hide();
            }
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
            var chartData = AppPage.Echarts;
            showPieDate(false);
            chartType && (chartData.currentChartType = chartType);
            if (!chartData.requestData) {
                return false;
            }
            if (!showEcharts(chartData.requestData)) {
                myAnalysis.messageTips('多指标或多于2种分组维度的查询不支持图形展示');
                echartsTips('多指标或多于2种分组维度的查询不支持图形展示');
                chartData.myChart.clear();
                $('[role="switchTableBtn"]').trigger('click');
                return false;
            }
            chartType || (chartType = chartData.currentChartType);
            if (chartType === 'pie' && chartData.requestData.groupFields.length == 0) {
                //myAnalysis.messageTips('饼图只适用于有分组的查询');
                echartsTips('饼图只适用于有分组的查询');
                chartData.myChart.clear();
                return false;
            }
            echartsTips();
            // piechart histogram diagram
            var ops = $.extend(true, {
                'hasChecked': true
            }, chartData.responesTransformDatas[0].chartData);
            var isCompare = chartData.isCompare;
            var opsTwo = isCompare && chartData.responesTransformDatas[1] ? $.extend(true, {}, chartData.responesTransformDatas[1].chartData) : null;
            switch (chartType) {
                case 'pie':
                    ops.type = 'pie';
                    ops = os(ops, opsTwo);
                    break;
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

            (isCompare && chartType === 'pie') && showPieDate(true);
            chartData.myChart.resize();
            chartData.myChart.setOption(ops, true);

        }

    });

/*bas.track('useAnalysis', {
    AnalysisType: '漏斗分析'
})*/