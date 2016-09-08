define([
    'AppPage',
    'AppPage/Utils/Date',
    'dot'
], function(AppPage,Date,dot) {

    function AnalysisPanel() {

    }

    // 原型
    AnalysisPanel.prototype = _.create(EventEmitter.prototype, {
        'constructor': AnalysisPanel
    });
    $.extend(AnalysisPanel.prototype, {
        root: null,
        dataContainer: null,
        dataTemplate: null,
        localData: [],
        mutiSelect: true,
        analysisType: '',
        templateId: '',
        url: __api_path + '/services/analysis/list',
        labelCheckedClass: 'label-checked label-checkbox-checked',
        create: function(opts) {
            opts = opts || {};
            this.bindHandleEvent();
            this.root = $('.analysis-list-panel');
            this.dataContainer = $('.analysis-list-panel-body>ul');
            this.dataTemplate = $('#analysis-list-temp');
            this.dataSingleTemplate = $('#analysis-single-temp');
            this.dataMutiTemplate = $('#analysis-muti-temp');
            this.dropdownList = $('.analysis-list-panel-header>.dropdown');
            this.initAnalysisTypeSelect();
            this.checkAllBox = $('.label-checkbox_analysis_all');
            this.mutiSelect = opts.mutiSelect == undefined ? true : opts.mutiSelect;
            if (!this.mutiSelect) {
                $('.analysis-list-panel-header,.analysis-list-panel-handle').remove();
            }
            this.analysisType = opts.analysisType || '';
            this.templateId = AppPage.queryString('templateId') ||AppPage.getAnalysisTypeId(this.analysisType) || '';
            this.options = $.extend(true, {}, opts);
            this.delegateRoot('click focusin filter');

            return this;
        },
        initAnalysisTypeSelect: function () {
            var that = this;
            var container = that.dropdownList.find('ul');
            AppPage.loadApi({
                url: __api_path + '/services/analysis/getAnalysisTypes',
                method:'get',
                data: {},
                success: function(res) {
                    container.html('<li data-value="" class="active"> <a role="dropdownMenuItem">全部</a> </li>');
                    var tmpl = dot.template('{{for(var item in it){if(it[item].status)}}\
                    <li data-value="{{=it[item].type}}"><a role="dropdownMenuItem" >{{=it[item].name}}</a> </li>\
                    {{}}}');
                    container.append(tmpl(res.dataObject));
                }
            });

        },
        // 事件委托根元素
        delegateRoot: function(eventTypes) {
            this.root.on(eventTypes, this.handleEvent);
        },
        handleEvent: function(e) {
            var that = this,
                type = e.type;
            switch (type) {
                case 'click':
                    that.click(e);
                    break;
                case 'focusin':
                    that.focusin(e);
                    break;
                case 'focusout':
                    that.focusout(e);
                    break;
                case 'filter':
                    that.onFilter(e);
                    break;
            }

        },
        click: function(e) {
            var that = this,
                target = e.target,
                role = target.getAttribute('role');
            switch (role) {
                case 'dropdownMenuItem':
                    that.selectDropDownMenuItem(e);
                    break;
                case 'singleAnalysisData':
                case 'hideAnalysisListPanel':
                    that.submit(e);
                    break;
                case 'labelCheckBox':
                    that.labelCheck(e);
                    break;
                case 'labelCheckAllBox':
                    that.labelCheckAll(e);
                    break;
            }
        },
        // 聚焦事件
        focusin: function(e) {
            var that = this,
                target = e.target,
                role = target.getAttribute('role');

            // 若为分组筛选输入框
            switch (role) {
                case 'inputAnalysisFilter':
                    this.analysisTitleFilter(e);
                    break;
            }
        },
        // 失焦事件
        focusout: function(e) {
            var target = e.target,
                role = target.getAttribute('role');

            // 若为分组筛选输入框
            switch (role) {
                case 'inputAnalysisFilter':

                    var targetValue = $(target).val();

                    if (targetValue) {
                        this.emit('onInputAnalysisFiltered', targetValue);
                    }

                    this.clearAnalysisTitleFilterTimeout();
                    break;
            }

        },

        onFilter: function(e) {
            var len = this.dataContainer.find('li:visible>label:not(.label-checkbox-checked)').length;
            if (len > 0) {
                this.checkAllBox.removeClass(this.labelCheckedClass);
            } else {
                this.checkAllBox.addClass(this.labelCheckedClass);
            }
        },
        // 清除定时器
        clearAnalysisTitleFilterTimeout: function() {
            this.root.off('focusout', this.handleEvent);
            clearTimeout(this.analysisTitleFilterTimeoutId);
            delete this.analysisTitleFilterTimeoutId;
        },
        // 选择下拉框
        selectDropDownMenuItem: function(e) {
            var that = this;
            var target = $(e.target),
                li = target.parent();
            li.siblings().removeClass('active');
            li.addClass('active');
            that.dropdownList.find('.dropdown-selection-label').text(target.text());
            that.analysisType = li.attr('data-value');
            that.filterData();
        },
        // 标题过滤
        analysisTitleFilter: function(e) {
            var that = this,
                target = e.target,
                lastValue = target.value.trim();

            that.root.on('focusout', this.handleEvent);
            that.analysisTitleFilterTimeoutId = setTimeout(_analysisTitleFilter, 200);

            function _analysisTitleFilter() {

                var value = target.value.trim(),
                    noMatchIndexes = [],
                    filterValues;

                if (value !== lastValue) {
                    that.filterData(value);
                    lastValue = value;
                    //console.log(lastValue);
                }
                that.analysisTitleFilterTimeoutId = setTimeout(_analysisTitleFilter, 200);
            }

        },

        // 获取数据
        loadData: function() {
            var that = this;
            AppPage.loadApi({
                url: that.url + '?type=' + that.analysisType,
                method:'get',
                data:'',
                 /*{
                    type: that.analysisType,
                    templateId: that.templateId
                }*/
                success: function(actionResult) {
                    if (!actionResult.success) return;
                    actionResult.data = actionResult.dataObject;
                    if (actionResult.data) {
                        actionResult.data.forEach(function(entity) {
                            entity.UniqueID = entity.id;
                            entity.Title = entity.name;
                            entity.TemplateID = entity.templateId,
                            entity.Remark = entity.comment || '';
                            entity.AnalysisType = entity.type;
                            if (entity.file) {
                                entity.Config = JSON.parse(entity.file);
                            } else {
                                entity.Config = {};
                            }
                            entity.LastTime = entity.updateTime || entity.createTime || '';

                            delete entity.id;
                            delete entity.name;
                            delete entity.comment;
                            delete entity.templateId;
                            delete entity.file;
                            delete entity.type;
                            delete entity.updateTime;
                            delete entity.createTime;
                        });
                    }
                    var newData = {};
                    newData.data = actionResult.data;
                    newData.options = {
                        mutiSelect: that.mutiSelect
                    };
                    that.renderData(newData);
                }
            });
        },
        // 填充数据视图
        renderData: function(data) {
            var that = this;
            var tmpl = dot.template(that.dataTemplate.html());
            that.dataContainer.html(tmpl(data));
            that.localData = data.data;
            //console.log(that.localData);
        },
        // 客户端过滤
        filterData: function() {
            var that = this;
            var title = arguments.length > 0 ? arguments[0] : '';
            that.dataContainer.children().show();
            if (that.analysisType != '') {
                that.dataContainer.children('li[data-type!="' + that.analysisType + '"]').hide();
            }

            if (title != '') {
                that.dataContainer.children('li:visible:not(:contains("' + title + '"))').hide();
            }
            that.root.trigger('filter');
        },
        //隐藏分析列表面板
        submit: function(e) {
            var that = this;
            var analysiss;
            if (that.mutiSelect) {
                var checkedItems = that.dataContainer.find('li>label[class*="' + that.labelCheckedClass + '"]');

                analysiss = checkedItems.map(function(index, cb) {
                    return $(this).parent().attr('data-uniqueid');
                }).get();
            } else {
                var selectedItem = $(e.target).parent();
                analysiss = selectedItem.attr('data-uniqueid');
            }

            that.emit('submit', analysiss);

            e.stopDelegate();
            that.root.removeClass('show-analysis');

        },
        labelCheck: function(e) {
            var that = this;
            var target = $(e.target);
            target.closest('label').toggleClass(that.labelCheckedClass);
            that.root.trigger('filter');
        },
        //全选
        labelCheckAll: function(e) {
            var that = this,
                target = $(e.target).closest('label');
            target.toggleClass(that.labelCheckedClass);
            if (target.hasClass(that.labelCheckedClass)) {
                that.dataContainer.find('li:visible>label').each(function() {
                    $(this).addClass(that.labelCheckedClass);
                });
            } else {
                that.dataContainer.find('li:visible>label').each(function() {
                    $(this).removeClass(that.labelCheckedClass);
                });
            }
        },
        //多选模式下只是为了选中
        //单选模式下是为了添加新分析，所以需要插入localData
        addAnalysisItem: function(analysisId) {
            var that = this;
            if (that.mutiSelect) {
                that.dataContainer.find('li[data-uniqueid="' + analysisId + '"]').find('label').addClass(that.labelCheckedClass);
                that.root.trigger('filter');
            } else {
                if (typeof analysisId == 'object') {
                    var data = analysisId;
                    if (that.localData.length > 0) {
                        var index = _.findIndex(that.localData, function(item) {
                            return item.UniqueID == data.UniqueID;
                        });
                        var isExists = index >= 0;
                        if (isExists) return;
                    }
                    var tmpl = dot.template(that.dataSingleTemplate.html());
                    that.dataContainer.append(tmpl(data));
                    that.localData.push(data);
                }
            }
        },
        //只有单选模式下才会使用此方法，需要更新localData
        updateAnalysisItem: function(itemData) {
            var that = this;
            if (that.mutiSelect) {

            } else {
                that.dataContainer.find('li[data-uniqueid="' + itemData.UniqueID + '"]>a').text(itemData.Title);

                var index = _.findIndex(that.localData, function(item) {
                    return item.UniqueID == itemData.UniqueID;
                });
                that.localData[index] = itemData;
            }
        },
        //只有多选模式下才会使用此方法
        removeAnalysisItem: function(analysisId) {
            var that = this;
            if (that.mutiSelect) {
                that.dataContainer.find('li[data-uniqueid="' + analysisId + '"]').find('label').removeClass(that.labelCheckedClass);
                that.root.trigger('filter');
            }
        }
    });
    // 静态成员
    $.extend(AnalysisPanel, {
        create: function(opts) {
            return new AnalysisPanel().create(opts);
        }
    });

    return AnalysisPanel;

});