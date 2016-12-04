require(
    [
        'AppPage',
        'bootstrap',
        'echarts',
        'main/user-analysis/Funnel/init',
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
            currentChartType: 'funnel',
            isCompare: false,
            render: render,
            requestRender: requestRender,
            echartsTips: echartsTips
        });

        // 右侧当前分析类型的分析列表
        var analysisPanel = AnalysisPanel.create({
            analysisType: myAnalysis.analysisType,
            mutiSelect: false
        });

        analysisPanel.loadData();
        analysisPanel.on('submit', function(evt, analysisId) {
            location.href = __path + '/main/user-analysis/Funnel/analysis?id=' + analysisId;
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
        function requestRender(requestData, requestZhData) {

            var ajaxDefer = AppPage.Echarts.ajaxDefer;
            if (ajaxDefer) {
                ajaxDefer.abort();
            }
            ajaxDefer = AppPage.Echarts.ajaxDefer = createAjaxDefer(requestData);

            ajaxDefer.then(function(res) {

                    //console.log(JSON.stringify({data:requestData}, null, 4));
                    //console.log(JSON.stringify(res, null, 4));
                    if (!res.success || !res.dataObject) {
                        if (!res.success) {
                            myAnalysis.messageTips('服务器无响应，请重试！');
                            echartsTips('服务器无响应，请重试！');
                        } else {
                            myAnalysis.messageTips(res.message || '暂无数据展示，请修改日期区间！');
                            echartsTips(res.message || '暂无数据展示，请修改日期区间！');
                        }

                        AppPage.Echarts.myChart.clear();
                        $(myAnalysis.analysisMain.tableWrapper).empty();
                        $('.page-warp').remove();
                        return;
                    }
                    $('.panel-echarts').removeClass('echarts-disable');
                    AppPage.Echarts.requestData = requestData;
                    AppPage.Echarts.requestZhData = requestZhData;
                    AppPage.Echarts.responesTransformDatas = formatData(res, requestZhData);
                    AppPage.Echarts.render();
                    grid.init({
                        root: myAnalysis.analysisMain.tableWrapper,
                        gridData: AppPage.Echarts.responesTransformDatas.gridData,
                        type: 'funnelGrid'
                    });

                },
                function(err) {

                });
        }

        // @requestData 请求数据（见API）
        // return defer
        function createAjaxDefer(requestData) {
            var data = {
                data: requestData
            };
            var dataStr = JSON.stringify(data);
            var analysisTypeId = AppPage.getAnalysisTypeId(myAnalysis.analysisType);
            //var url = AppPage.UserAnalysis.analysisUrl + '?id=' + analysisTypeId;
            var url = AppPage.UserAnalysis.analysisUrl + '?type=' + myAnalysis.analysisType;

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
            })
        }

        //格式化漏斗数据
        function formatData(res, requestZhData) {
            var chartData = {},
                gridData = {},
                legend = [],
                resData = res.dataObject,
                group = ['全部'].concat(resData.groupValues),
                groupZh = requestZhData.groupField_zh ? [requestZhData.groupField_zh] : [''],
                actionsZh = renameUnique(requestZhData.funnels.map(function(item) {
                    return item.actionName_zh;
                }));

            gridData.headerData = groupZh.concat(actionsZh);
            gridData.bodyData = resData.overview.map(function(item, i) {
                var obj = {};
                obj.name = group[i];
                obj.value = item.map(function(itemData) {
                    return [itemData.convertedUser, itemData.conversionRate];
                });
                return obj;
            });
            gridData.steps = resData.steps.map(function(item) {
                if (item.lines.length) {
                    item.lines.forEach(function(itemData, i) {
                        itemData.name = group[i]
                    });
                }
                return item;
            });
            chartData.series = resData.overview[0].map(function(item, i) {
                var obj = {};
                var str = actionsZh[i] + ',' + item.convertedUser + '人';
                obj.name = str;
                legend.push(str);
                obj.value = item.conversionRate;
                obj.checked = true;
                return obj;
            });
            chartData.legend = legend;
            return {
                chartData: chartData,
                gridData: gridData
            };
        }

        /*
         * 重命名唯一
         * @arr String Array
         * @accumulator function 可选项，累加器
         */

        function renameUnique(arr, accumulator) {
            var newArrStr = [];
            accumulator || (accumulator = accu);
            arr.map(function(item, i) {
                var newStr = item,
                    r = 1;
                while (newArrStr.indexOf(newStr) > -1) {
                    newStr = accumulator.call(this, item, r++);
                }
                newArrStr.push(newStr);
                return newStr
            });
            return newArrStr;
            //默认累加器
            function accu(str, repeatNumber) {
                return str + '-' + repeatNumber;
            }
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

        // 渲染
        function render(chartType) {
            if (!AppPage.Echarts.requestData) {
                return false;
            }
            $('.panel-echarts').removeClass('echarts-disable');
            // piechart histogram diagram
            var ops = $.extend(true, {}, AppPage.Echarts.responesTransformDatas.chartData);
            chartType || (chartType = AppPage.Echarts.currentChartType);
            switch (chartType) {
                case 'funnel':
                    ops.type = 'funnel';
                    ops = os(ops);
                    break;
            }

            AppPage.Echarts.myChart.resize();
            AppPage.Echarts.myChart.setOption(ops, true);

            AppPage.Echarts.currentChartType = chartType;
        }

    });

/*bas.track('useAnalysis', {
    AnalysisType: '事件分析'
})*/