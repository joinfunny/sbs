require(
    [
        'AppPage',
        'bootstrap',
        'echarts',
        'main/user-analysis/Revisit/init',
        'main/data-overview/echarts-ops',
        'main/data-overview/echarts-grid-new',
        'main/data-overview/echarts-switch',
        'main/user-analysis/transformData',
        'main/analysis-panel'
    ],
    function(AppPage, bs, ec, myAnalysis, os, grid, switchChart, transformData, AnalysisPanel) {

        $('[data-toggle="tooltip"]').tooltip();


        Object.ns('AppPage.Echarts', {
            ajaxDefer: null,
            isCompare: false,
            requestRender: requestRender,
            echartsTips: echartsTips
        });

        // 右侧当前分析类型的分析列表
        var analysisPanel = AnalysisPanel.create({
            analysisType: myAnalysis.analysisType,
            mutiSelect: false
        });

        analysisPanel.loadData();
        analysisPanel.on('submit', function(e, analysisId) {
            location.href = __path + '/main/user-analysis/Revisit/analysis?id=' + analysisId;
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

                    //console.log(JSON.stringify({data: requestData}, null, 4));
                    //console.log(JSON.stringify(res, null, 4));

                    if (!res.success || !res.dataObject) {
                        if (!res.success) {
                            myAnalysis.messageTips('服务器无响应，请重试！');
                            echartsTips('服务器无响应，请重试！');
                            console.log(res.message);
                        } else {
                            myAnalysis.messageTips(res.message || '暂无数据展示，请修改日期区间！');
                            echartsTips(res.message || '暂无数据展示，请修改日期区间！');
                        }
                        $(myAnalysis.analysisMain.tableWrapper).empty();
                        $('.page-warp').remove();
                        return;
                    }
                    $('.panel-table').removeClass('echarts-disable');
                    AppPage.Echarts.requestData = requestData;
                    AppPage.Echarts.requestZhData = requestZhData;
                    AppPage.Echarts.responesTransformDatas = formatData(res, requestZhData, requestData);
                    grid.init({
                        root: myAnalysis.analysisMain.tableWrapper,
                        gridData: AppPage.Echarts.responesTransformDatas.gridData,
                        type: 'revisitGrid',
                        tdFormat: tdFormat
                    });
                    $('[role="switchTableBtn"]').trigger('click');
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

        //格式化留存数据
        function formatData(res, requestZhData, requestData) {
            var chartData = {},
                gridData = {},
                resData = res.dataObject;
            switch (requestData.type) {
                case 'time':
                    gridData.unitText = requestData.unit == 'day' ? '小时' : '天';
                    break;
                case 'frequency':
                    gridData.unitText = '次';
                    break;
            }
            gridData.requestZhData = requestZhData;
            gridData.bodyData = resData.rows.map(function(item) {
                item.groupValue = parseDate(item.groupValue);
                return item;
            });

            //按留存的类型，周，日，月，处理日期
            function parseDate(dateStr) {
                var dateReg = /^\d{4}-\d{1,2}-\d{1,2}$/,
                    date = dateStr;
                if (date && date.match(dateReg)) {
                    switch (requestData.unit) {
                        case 'week':
                            date = date.replace(/^\d{4}-/, "") + '当周'
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

        //图表提示信息

        function echartsTips(text) {
            var echartsParent = $('.panel-table');
            echartsParent.addClass('echarts-disable');
            $('.echarts-none', echartsParent).html(text);
        }

        //格式化td
        function tdFormat(td) {
            var defaultBgc = ["#2865CA", "#3d74cf", "#5384d5", "#6893da", "#7ea3df", "#93b2e4", "#a9c1ea", "#bed0ef", "#d4e0f4", "#e9effa"],
                bgc, fc;
            var n = $(td).find('.percentage').data('value') * 100;
            if (n <= 100000 && n > 9000) {
                bgc = defaultBgc[0];
                fc = '#fff';
            } else if (n <= 9000 && n > 8000) {
                bgc = defaultBgc[1];
                fc = '#fff';
            } else if (n <= 8000 && n > 7000) {
                bgc = defaultBgc[2];
                fc = '#fff';
            } else if (n <= 7000 && n > 6000) {
                bgc = defaultBgc[3];
                fc = '#fff';
            } else if (n <= 6000 && n > 5000) {
                bgc = defaultBgc[4];
                fc = '#fff';
            } else if (n <= 5000 && n > 4000) {
                bgc = defaultBgc[5];
                fc = '#333';
            } else if (n <= 4000 && n > 3000) {
                bgc = defaultBgc[6];
                fc = '#333';
            } else if (n <= 3000 && n > 2000) {
                bgc = defaultBgc[7];
                fc = '#333';
            } else if (n <= 2000 && n > 1000) {
                bgc = defaultBgc[8];
                fc = '#333';
            } else if (n <= 1000 && n > 0) {
                bgc = defaultBgc[9];
                fc = '#333';
            }
            $(td).css({
                'background-color': bgc,
                'color': fc
            });
        }

    });