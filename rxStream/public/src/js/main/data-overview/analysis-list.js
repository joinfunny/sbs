// 图表公用配置
(function(window) {
    // 使用
    require(
        [
            'main/common',
            'echarts',
            'main/data-overview/dashboard',
            'main/data-overview/overview',
            'main/analysis-panel'
        ],
        function(AppPage, ec, Dashboard, overview, analysisPanel) {
            var dashboard = Dashboard.create('.dashboard-widgets-list');
            var page = {
                analysisPanel: null,
                getOverviewDataUrl: __api_path + '/services/overview/get?id=',
                getAnalysisDataUrl: __api_path + '/services/analysis/get?id=',
                saveOverViewUrl: __api_path + '/services/overview/save/',
                getAnalysisDataListUrl: __api_path + '/services/analysis/list',
                saveBtn: null,
                init: function() {
                    this.$docRoot = $(document.documentElement);
                    this.$dashboardWidgetsList = $('.dashboard-widgets-list');
                    this.$dashboardBlankSlate = $('.dashboard-blank-slate');
                    this.$dashboardHeader = $('#my_dashboard_head');
                    this.saveBtn = $('.icon-save');
                    this.overviewId = this.$dashboardWidgetsList.attr('data-uniqueid');
                    this.locationFormat();

                    this.loadAnalysisPanel();
                    this.loadAnalysisWidgetList();
                    this.bindEvents();

                },
                /**
                 * 地址栏Hash格式化
                 * {
                 *     mode: default|integrated
                 *     analysisId:9cf9ds9fd9fs,dsauf9dsaf9d,fdsa8fds8af8dsaf8dsa8f
                 * }
                 * http://120.55.91.133:8081/8aaffc4854423b83015442608f8801c4#mode=integrated&analysisId=8aaffc4854423b830154425ee6b501b4
                 */
                locationFormat: function() {
                    var that = this,
                        hash = location.hash;
                    that.options = {};

                    that.options.mode = AppPage.queryHashString('mode') || '';
                    that.options.analysisId = AppPage.queryHashStringAll('analysisId');
                    that.options.view = AppPage.queryHashString('view');
                    that.options.layout = AppPage.queryHashString('layout') || 'default';
                    //console.log(that.options);
                    that.options.mode && that.$docRoot.addClass(that.options.mode);
                    that.options.view && that.$docRoot.addClass(that.options.view);
                    that.options.mode === 'integrated' && that.$docRoot.addClass('layout-' + that.options.layout);
                },
                bindEvents: function() {
                    var that = this;
                    $(window).on('resize', this.renderMainsAll);
                    this.saveBtn.on('click', function(e) {
                        var target = $(this);
                        if (target.hasClass('grey')) {
                            return;
                        }
                        var title = $('.header-title>input:eq(0)').val().trim();
                        if (title.length <= 0) {
                            that.messageTips("请输入概览标题！");
                            return;
                        }
                        var modules = [],
                            desc = [];
                        var ovs = overview.instances;
                        if (ovs.length > 0) {
                            ovs.forEach(function(item, index) {
                                var opts = item.instance.options;
                                desc.push(opts.data.Title);
                                modules.push({
                                    analysisId: item.analysisId,
                                    type: item.instance.options.analysisType,
                                    currentMenu: item.instance.currentMenu,
                                    currentChart: item.instance.currentOverviewChart
                                });
                            });
                        }
                        if (modules.length <= 0) {
                            that.messageTips("您目前还未添加任何的数据分析！");
                            return;
                        }

                        var id = that.overviewId || '',
                            name = $('.header-title>input:eq(0)').val(),
                            comment = desc.join(','),
                            file = JSON.stringify(modules);
                        AppPage.loadApi({
                            url: that.saveOverViewUrl + id,
                            type: 'post',
                            dataType: 'json',
                            data: JSON.stringify({
                                overviewObject: {
                                    id: id,
                                    name: name,
                                    comment: comment,
                                    file: file
                                }
                            }),
                            success: function(actionResult) {
                                if (actionResult.success) {
                                    that.actionMessageTip('本次概览模型已保存成功！', true);
                                    /*bas.track('createOverview', {
                                        OverViewTitle: title,
                                        AnalysisCount: ovs.length
                                    })*/
                                } else {
                                    that.actionMessageTip(actionResult.message, false);
                                }
                            }
                        })
                    })
                },
                messageTips: function(text) {
                    var $tipsBox = $('.message-tips');
                    if ($tipsBox.length === 0) {
                        $tipsBox = $('<div style="top: -80px" class="message-tips">' + text + '</div>');
                        $(document.body).append($tipsBox);
                    } else {
                        $tipsBox.text(text);
                    }
                    $tipsBox.stop().animate({
                        'top': 20
                    });
                    window.setTimeout(function() {
                        $tipsBox.stop().animate({
                            'top': -80
                        });
                    }, 3000);
                },
                renderMainsAll: function() {
                    $('.echarts-main').each(function() {
                        var container = this.parentNode;
                        this.width = container.clientWidth;
                        this.height = container.clientHeihgt;
                        var myChart = ec.getInstanceById($(this).attr('_echarts_instance_')); //echarts-main
                        setTimeout(function() {
                            if (myChart)
                                myChart.resize();
                        }, 1);
                    });
                },

                //加载页面分析分析
                loadAnalysisWidgetList: function() {
                    var that = this
                    mode = that.options.mode,
                        showAnalysisIds = mode == 'integrated' ? that.options['analysisId'] : [];
                    if (that.overviewId != '') {
                        AppPage.loadApi({
                            url: that.getOverviewDataUrl + that.overviewId
                        }).then(function(remoteResult) {
                            reBuildModel(remoteResult.dataObject);
                            if (!remoteResult.dataObject.Modules.length > 0) {
                                return;
                            }
                            AppPage.loadApi({
                                url: that.getAnalysisDataListUrl,
                                method: 'get'
                            }).then(function(actionResult) {
                                if (actionResult.success) {

                                    //实体转换
                                    var overviews = remoteResult.dataObject;
                                    var modules = overviews.Modules;
                                    var analysisIds = modules.map(function(module, index) {
                                        return module;
                                    });
                                    var analysisDatas = [];

                                    if (actionResult.dataObject && actionResult.dataObject.rows && actionResult.dataObject.rows.length > 0) {

                                        actionResult.dataObject.rows.forEach(function(analysisData, index) {
                                            /*if (analysisIds.indexOf(analysisData.id) > -1) {
                                             var doc = {};
                                             doc.UniqueID = analysisData.id;
                                             doc.AnalysisType = analysisData.type;
                                             doc.TemplateID = analysisData.templateId;
                                             doc.Title = analysisData.name;
                                             doc.Remark = analysisData.comment;
                                             doc.LastTime = analysisData.createTime || analysisDatas.updateTime;
                                             doc.Config = analysisData.file ? JSON.parse(analysisData.file) : {};
                                             analysisDatas.push(doc);
                                             }*/
                                            analysisIds.some(function(item) {
                                                if (item.analysisId == analysisData.id) {
                                                    var doc = {};
                                                    doc.UniqueID = analysisData.id;
                                                    doc.AnalysisType = analysisData.type;
                                                    doc.TemplateID = analysisData.templateId;
                                                    doc.Title = analysisData.name;
                                                    doc.Remark = analysisData.comment;
                                                    doc.LastTime = analysisData.createTime || analysisDatas.updateTime;
                                                    doc.Config = analysisData.file ? JSON.parse(analysisData.file) : {};
                                                    item.currentMenu && item.currentMenu != 'rollup' ? doc.Config.requestData.unit = item.currentMenu : doc.currentMenu = item.currentMenu || null;
                                                    item.currentChart && (doc.Config.currentChart = item.currentChart);
                                                    analysisDatas.push(doc);
                                                    return true;
                                                }
                                            });
                                        });
                                    }
                                    overviews.Modules = analysisDatas;
                                    //delete remoteResult.dataObject;
                                    actionResult.data = overviews;
                                    //转换结束

                                    var data = actionResult.data;
                                    $('.header-title>input:eq(0)').val(data.Title);

                                    if (data.Modules && data.Modules.length > 0) {
                                        that.$dashboardBlankSlate.hide();
                                        that.saveBtn.removeClass('grey');

                                        data.Modules.forEach(function(module, index) {
                                            var show = true;
                                            if (mode == 'integrated' && showAnalysisIds.length) {
                                                show = showAnalysisIds.indexOf(module.UniqueID) > -1;
                                            }
                                            if (!show) return;
                                            var overviewOptions = that.overviewOptions(module.UniqueID, module.AnalysisType, module.TemplateID, module);

                                            //overviewOptions.onInited = function (ov) {
                                            //    analysisPanel.addAnalysisItem(ov.analysisId);
                                            //}
                                            //console.log(overviewOptions);
                                            //合并过滤条件
                                            that.extendChartRequest(overviewOptions.data.Config.requestData, overviewOptions.analysisType);
                                            overview.create(overviewOptions);

                                            mode == 'default' && (that.analysisPanel.addAnalysisItem(module.UniqueID));

                                        })
                                        console.log('请拷贝以下字符串，获取分析模型的analysisId集合：\r\n' + data.Modules.map(function(module) {
                                            return module.UniqueID
                                        }).join(','));
                                    }
                                }
                            })


                        })
                    } else {
                        that.$dashboardBlankSlate.show();
                        that.saveBtn.removeClass('grey');
                    }

                    function reBuildModel(entity) {
                        entity.UniqueID = entity.id;
                        entity.Title = entity.name;
                        entity.Description = entity.comment || '';
                        if (entity.file) {
                            entity.Description = entity.Modules = JSON.parse(entity.file);
                        } else {
                            entity.Description = entity.Modules = [];
                        }
                        entity.LastTime = entity.updateTime || entity.createTime || '';

                        delete entity.id;
                        delete entity.name;
                        delete entity.comment;
                        delete entity.file;
                        delete entity.updateTime;
                        delete entity.createTime;
                    }
                },
                //合并chart过滤条件
                extendChartRequest: function(targetRequest, type) {
                    var $filterInput = $('#filter-input'),
                        b, filterType;
                    if ($filterInput.length > 0 && $filterInput.is(':hidden')) {
                        var filterData = JSON.parse($.trim($filterInput.val())),
                            filterItem = {
                                "field": "b_dollar_city",
                                "expression": "EQ",
                                "values": filterData.userIds
                            },
                            defaultFilterCondition = {
                                "relation": "and",
                                "conditions": []
                            };
                        if (type == 'Retained' || type == 'Revisit') {
                            filterType = targetRequest.userFilterCondition;
                        } else {
                            filterType = targetRequest.filterCondition;
                        }
                        if (filterType) {
                            b = filterType.conditions.some(function(item) {
                                if (item.field == filterItem.field && item.expression == filterItem.expression) {
                                    item.values = item.values.concat(filterItem.values);
                                    return true;
                                }
                            });
                            !b && filterType.conditions.push(filterItem);
                        } else {
                            defaultFilterCondition.conditions.push(filterItem);
                            type == 'Retained' || type == 'Revisit' ? targetRequest.userFilterCondition = defaultFilterCondition : targetRequest.filterCondition = defaultFilterCondition;
                        }
                    }
                },
                loadAnalysisPanel: function() {
                    var that = this;
                    if (that.options.mode == 'integrated' && that.options.view !== 'toolbar') return;
                    that.analysisPanel = analysisPanel.create();
                    that.analysisPanel.loadData();
                    that.analysisPanel.on('submit', function(e, analysisIds) {
                        if (!analysisIds)
                            return;
                        var ids = overview.instances.map(function(item, index) {
                            return item.analysisId;
                        });
                        var union = _.union(ids, analysisIds);
                        var deleted = _.difference(union, analysisIds);
                        var added = _.difference(union, ids);
                        //						console.log(ids);
                        //						console.log(deleted);
                        //						console.log(added);
                        added.forEach(function(item, index) {
                            that.renderOverView(item);
                        });
                        deleted.forEach(function(item, index) {
                            overview.remove(item);
                        });
                    });
                },
                //绘制分析模型
                renderOverView: function(analysisId) {
                    var that = this;
                    var data = _.find(that.analysisPanel.localData, function(item) {
                        return item.UniqueID == analysisId;
                    });

                    overview.create(that.overviewOptions(data.UniqueID, data.AnalysisType, data.TemplateID, data));

                    /* AppPage.loadApi({
                     url: that.getAnalysisDataUrl + analysisId,
                     success: function(actionResult) {console.log(actionResult);
                     if (actionResult.success) {
                     var data = actionResult.dataObject;
                     data.UniqueID = data.id;
                     data.Title = data.name;
                     data.AnalysisType = data.type;
                     data.TemplateID = data.templateId;
                     data.Description = data.Remark = data.comment || '';
                     if (data.file) {
                     data.Config = JSON.parse(data.file);
                     } else {
                     data.Config = {};
                     }
                     data.LastTime = data.updateTime || data.createTime || '';

                     delete data.id;
                     delete data.name;
                     delete data.comment;
                     delete data.file;
                     delete data.type;
                     delete data.createTime;
                     delete data.updateTime;

                     overview.create(that.overviewOptions(data.UniqueID, data.AnalysisType, data.TemplateID, data));
                     }
                     }
                     })*/
                },
                overviewOptions: function(analysisId, analysisType, templateId, data) {
                    var that = this;
                    return $.extend(true, {}, {
                        analysisId: analysisId,
                        analysisType: analysisType,
                        templateId: templateId,
                        data: data,
                        onInited: function(ov) {
                            that.$dashboardBlankSlate.hide();
                            that.saveBtn.removeClass('grey');
                        },
                        onDeleted: function(ov) {
                            if (overview.instances.length <= 0) {
                                that.$dashboardBlankSlate.show();
                                that.saveBtn.addClass('grey');
                            }
                            that.analysisPanel.removeAnalysisItem(ov.options.analysisId);
                        }

                    })
                },
                actionMessageTip: function(msg, flag) {
                    var icon = flag ? 'ok' : 'remove';
                    var tag = flag ? 'success' : 'failure';
                    $('<div class="analysis-save-hint"><i class="glyphicon glyphicon-' + icon + '"></i>' + msg + '</div>')
                        .appendTo(document.body)
                        .on('animationend', function(e) {
                            $(e.currentTarget).remove();
                        })
                        .addClass('analysis-save-' + tag);
                }
            };
            page.init();

        }
    );

})(this);