//
define([
        'jQcss3',
        'dot',
        'AppPage'
    ],
    function(css3, dot, AppPage) {

        function OverView() {}

        OverView.prototype = _.create(EventEmitter.prototype, {
            'constructor': OverView
        });

        $.extend(OverView.prototype, {
            root: null,
            getDataUrl: null,
            delDataUrl: null,
            listItemDataFormatter: null,
            getOverViewListUrl: __api_path + "/services/overview/list",
            deleteOverviewUrl: __api_path + "/services/overview/delete",
            getAnalysisDataListUrl: __api_path + "/services/analysis/list",
            deleteAnalysisDataUrl: __api_path + "/services/analysis/delete",
            templateId: '',
            /**
             * OverView初始化
             * @param  {[obj]} opts
             *         type: string
             *         $tmpl: jquery object
             *         listItemDataFormatter: function
             */
            init: function(opts) {
                opts = opts || {};
                this.bindHandleEvent();
                this.$root = $('.overview-list');
                this.$overviewTmpl = $('#overview-temp') || opts.$tmpl;
                var type = this.dataType = this.$root.attr('data-role') || opts.type;
                this.listItemDataFormatter = opts.listItemDataFormatter || function() {};
                this.getDataUrl = opts.type == '' ? this.getOverViewListUrl : this.getAnalysisDataListUrl;
                this.delDataUrl = opts.type == '' ? this.deleteOverviewUrl : this.deleteAnalysisDataUrl;
                this.templateId = AppPage.queryString('templateId');
                this.loadData();
            },
            click: function(e) {
                var $target = $(e.target); //当前点击的元素
                var $this = $target.closest('li'); //当前的事件触发元素li
                if ($target.hasClass('icon-remove')) {
                    $this.addClass('show-confirm-remove');
                } else if ($target.hasClass('btn-confirm-remove')) {
                    $this.addClass('removing-overview');
                    var id = $this.attr('data-overview-id');
                    this.deleteOverview(id, function(actionResult) {
                        $this.removeClass('removing-overview');
                        if (actionResult.success) {
                            $this.addClass('hide-overview');
                            /*bas.track('deleteOverview', {
                                OverViewTitle: $this.find('.overview-h').text()
                            })*/
                        }
                    });
                }
            },
            mouseleave: function(e) {
                var $target = $(e.currentTarget);
                $target.removeClass('show-confirm-remove');
            },
            transitionend: function(e) {
                var $target = $(e.target);
                $target.hasClass('hide-overview') && $target.css('display', 'none') && $target.remove();
            },
            deleteOverview: function(id, cb) {
                AppPage.loadApi({
                    url: this.delDataUrl + '?id=' + id,
                    type: 'post',
                    dataType: 'json',
                    data: '',
                    success: function(actionResult) {
                        if (cb) {
                            cb(actionResult);
                        }
                    }
                });
            },
            loadDataDefer: null,
            loadData: function() {
                var that = this,
                    url, data;

                if (that.dataType == '') {
                    url = that.getOverViewListUrl;
                    data = '';
                } else {
                    if (that.dataType) {
                        url = that.getAnalysisDataListUrl + '?type=' + that.dataType + '&templateId=' + that.templateId;
                    } else {
                        url = that.getAnalysisDataListUrl;
                    }

                    data = '';
                }

                that.loadDataDefer = AppPage.loadApi({
                    url: url,
                    method: 'get',
                    data: data
                });

                this.loadDataDefer.then(function(actionResult) {
                    //非数据概览页面 analysisData
                    if (that.dataType != '') {
                        $(function() {
                            actionResult.data = actionResult.dataObject;
                            if (actionResult.data) {
                                actionResult.data.forEach(function(entity) {
                                    reBuildModel(entity);
                                });
                            }
                            that.renderTemplate(actionResult);
                        });

                    } else {
                        //数据概览页面，需要再获取分析详细信息
                        actionResult.dataObject.forEach(function(entity) {
                            reBuildModel(entity);
                        });
                        AppPage.loadApi({
                            url: that.getAnalysisDataListUrl,
                            data: '',
                            method: 'get',
                            success: function(remoteResult) {
                                var overviews = actionResult.dataObject;
                                var analysisDatas = {};
                                if (remoteResult.dataObject && remoteResult.dataObject.rows && remoteResult.dataObject.rows.length > 0) {
                                    remoteResult.dataObject.rows.forEach(function(doc, index) {
                                        analysisDatas[doc.id] = doc;
                                    });
                                }

                                overviews.forEach(function(overview, index) {
                                    var modules = overview.Modules;
                                    if (modules && modules.length > 0) {
                                        modules.forEach(function(module, index) {
                                            //modules中可能存在删除的analysisData对象。需要特别判断下。
                                            var analysisData = analysisDatas[module.analysisId] || {};
                                            var config = analysisData.file && analysisData.file.length > 0 ? JSON.parse(analysisData.file) : {};
                                            module.currentChart = config.currentChart || '';

                                        })
                                    }
                                })
                                actionResult.data = overviews;

                                $(function() {
                                    that.renderTemplate(actionResult);
                                });
                            }
                        })
                    }

                });

                function reBuildModel(entity) {
                    entity.UniqueID = entity.id;
                    entity.Title = entity.name;
                    entity.Description = entity.Remark = entity.comment || '';
                    if (entity.file) {
                        entity.Config = entity.Modules = JSON.parse(entity.file);

                    } else {
                        entity.Config = entity.Modules = [];
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
            renderTemplate: function(actionResult) {
                var that = this;
                if (actionResult.success) {
                    var tmpl = dot.template(that.$overviewTmpl.html());
                    var listData = actionResult.data;
                    if (that.listItemDataFormatter) {
                        that.listItemDataFormatter(listData);
                    }
                    that.$root.append(tmpl(listData));
                    that.delegateRoot('click transitionend');
                    $('.overview').on('mouseleave', that.mouseleave);
                }
            },
            // 事件委托根元素
            delegateRoot: function(eventTypes) {
                this.$root.on(eventTypes, this.handleEvent);
            },
            handleEvent: function(e) {
                var that = this,
                    type = e.type;
                switch (type) {
                    case 'click':
                        that.click(e);
                        break;
                    case 'mouseleave':
                        that.mouseleave(e);
                        break;
                    case 'transitionend':
                        that.transitionend(e);
                        break;
                }

            }
        });

        OverView.numToZhFormatter = function(num) {
            var a = new Array("零", "单", "双", "三", "四", "五", "六", "七", "八", "九");
            var b = new Array("", "一", "二", "三", "四", "五", "六", "七", "八", "九");
            if (num < 10) {
                return a[num];
            } else {
                var ten = Math.floor(num / 10);
                num = num % 10;
                return b[ten] + '十' + b[num];
            }
        }
        return OverView;

    });