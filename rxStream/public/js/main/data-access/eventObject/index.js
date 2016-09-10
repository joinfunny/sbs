require([
    'AppPage',
    'dot',
    'materialize',
    'main/data-access/eventBaseData',
    'main/data-access/dataGrid',
    'main/data-access/propertySidebar'
], function (AppPage, dot, materialize, BusinessData, Grid, PropertySidebar) {
    var main = {
        grid: null,
        $grid: null,
        $tpl_grid_button: null,
        $tpl_grid_operate_col: null,
        objPropertyDefaultOps: {
            root: '#property-table',
            tableClass: 'bordered hoverable centered',
            defaultData: {
                name: 'o_',
                label: '',
                dataType: 'STRING',
                edit: true,
                newItem: true,
                filterMode: 1,
                visible: true
            },
            column: [{
                field: '_index',
                width: 90,
                title: "编号",
                format: function (value, itemData, index) {
                    return index || '';
                }
            }, {
                field: 'name',
                title: '属性名称',
                editor: {
                    type: 'text',
                    options: {
                        validType: [
                            'empty',
                            'repeat', {
                                type: 'length',
                                len: [0, 50],
                                errorTips: '长度50字以内'
                            }, {
                                type: 'reg',
                                regStr: /^(o_)[a-zA-Z0-9_]*$/,
                                errorTips: '必须以o_开头且只能输入英文数字及下划线'
                            }, {
                                type: 'ajax',
                                ajaxFn: BusinessData.checkRepeat,
                                errorTips: '该值已重复！'
                            }
                        ]
                    }
                },
                format: function (value, itemData) {
                    return value;
                }
            }, {
                field: 'label', //字段名
                title: "显示名称", //字段中文名
                editor: { //编辑
                    type: 'text',
                    options: {
                        validType: [
                            'empty',
                            'repeat', {
                                type: 'length',
                                len: [0, 50],
                                errorTips: '长度50字以内'
                            }, {
                                type: 'reg',
                                regStr: /^[\u0391-\uFFE5\w]+$/,
                                errorTips: '只允许汉字、英文字母、数字及下划线。'
                            }, {
                                type: 'ajax',
                                ajaxFn: BusinessData.checkRepeat,
                                errorTips: '该值已重复！'
                            }
                        ]
                    }
                },
                format: function (value, itemData) {
                    return value;
                }
            }, {
                field: 'dataType',
                width: 120,
                title: "数据类型",
                editor: {
                    type: 'select',
                    options: {
                        data: BusinessData.dataTypeData
                    }
                },
                format: function (value, rowData) {
                    return _.find(BusinessData.dataTypeData, function (mode) {
                        return mode.value == value;
                    }).text;
                }
            }, {
                field: 'filterMode',
                width: 120,
                title: "筛选方式",
                editor: { //编辑
                    type: 'select',
                    options: {
                        data: BusinessData.filterModeData
                    }

                },
                format: function (value, itemData) {
                    var filterMode = _.find(BusinessData.filterModeData, function (mode) {
                        return mode.value == value;
                    });
                    return filterMode ? filterMode.text : '';
                }
            }, {
                field: 'operation',
                title: '',
                align: 'right',
                visible: true,
                format: function (value, itemData) {
                    return dot.template($('#tpl_property_grid_operate_col').text())(itemData);
                }
            }]
        },
        defaultGridOpts: {
            tableClass: 'bordered hoverable centered',
            column: [{
                field: '_index',
                title: "编号",
                format: function (value, itemData, index) {
                    return index || '';
                }
            }, {
                field: 'name',
                title: "对象名称",
                format: function (value, itemData) {
                    return value;
                }
            }, {
                field: 'label',
                title: '对象显示名',
                format: function (value, itemData) {
                    return value;
                }
            }
            ]
        },
        init: function () {
            this.initElements();
            this.initDataGrid();
            this.initPropertySidebar();
            this.loadData();
        },
        initElements: function () {
            this.$grid = $('#event-object');
            this.$tpl_grid_button = $('#tpl_eventObject_grid_button');
            this.$tpl_grid_operate_col = $('#tpl_eventObject_grid_operate_col');
            this.$tpl_property_slide_button = $('#tpl_property_slide_button');
        },
        loadData: function () {
            var that = this;
            BusinessData.loadEventObjectList().then(function (data) {
                that.grid.renderGrid(data);
            });
        },
        initPropertySidebar: function () {
            var that = this, side = PropertySidebar.create();
            side.on('savePropertyAfter', function (e, type, status) {
                that.loadData();
            });
            this.sideInstance = side;
        },
        initDataGrid: function () {
            var that = this;
            var gridOpts = $.extend(true, {}, that.defaultGridOpts, {
                root: that.$grid,
                buttonTem: [that.$tpl_grid_button.text()]
            });
            gridOpts.column.push({
                field: 'operation',
                title: '',
                align: 'right',
                width: '20%',
                visible: true,
                format: function (value, itemData) {
                    return '';
                }
            });
            var dataGrid = Grid.create(gridOpts);
            dataGrid.on('roleClick', function (e, eTarget, role) {
                switch (role) {
                    case 'addEventObject':
                        that.addEventObject(eTarget);
                        break;
                }
            });
            /**
             * 点击表格行事件
             */
            dataGrid.on('gridRowClick', function (e, eTarget, role) {
                that.objEditGridRow(eTarget);
            });
            dataGrid.on('afterSlideButton', function (e, eTarget, rowData) {
                /*BusinessData.changeEventTypeVisible(JSON.stringify(rowData)).then(function(data) {
                 if (!data.success) {
                 that.reLoadData();
                 Materialize.toast('事件属性更新失败', 3000, 'warning');
                 }
                 });*/
            });
            dataGrid.on('afterDeleteRow', function (e, eTarget, rowData) {
                /*var eventId = rowData.id;
                 if (!eventId) return;
                 BusinessData.deleteEventTypeInfo(rowData).then(function(data) {
                 if (!data.success) {
                 that.reLoadData();
                 Materialize.toast('事件删除失败', 3000, 'warning');
                 }
                 })*/
            });
            this.grid = dataGrid;
        },
        /**
         * 创建对像
         * @param e
         */
        addEventObject: function (e) {
            var $target = $(e.target), that = this;
            var ops = {
                type: 'object',
                status: 'add',
                typeData: {edit: true},
                objectData: that.grid.getGridData(),
                gridOptions: $.extend(that.objPropertyDefaultOps, {
                    buttonTem: [that.$tpl_property_slide_button.text()],
                    gridData: []
                })
            };
            that.sideInstance.init(ops);
        },
        /**
         * 编辑对像
         * @param e
         */
        objEditGridRow: function (e) {
            var $target = $(e.target),
                that = this,
                gridData = that.grid.getDataById($target.parents('tr[data-id]').attr('data-id')),
                value = +gridData.id,
                name = gridData.name,
                edit = gridData.edit,
                text = gridData.label;
            BusinessData.getObjectById(value).then(function (res) {
                if (res) {
                    var ops = {
                        type: 'object',
                        status: 'edit',
                        typeData: {text: text, value: value, name: name, edit: edit},
                        objectData: that.grid.getGridData(),
                        gridOptions: $.extend(that.objPropertyDefaultOps, {
                            buttonTem: [that.$tpl_property_slide_button.text()],
                            gridData: res.data.props || []
                        })
                    };
                    that.sideInstance.init(ops);
                }
            });
        }
    };
    main.init();
});