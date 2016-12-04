require([
    'AppPage',
    'dot',
    'materialize',
    'main/data-access/dataGrid',
    'main/data-access/eventBaseData',
    'main/data-access/MainPage',
    'main/data-access/editModal'
], function (AppPage, dot, materialize, Grid, BusinessData, MainPage, EditModal) {
    var customEvent = new MainPage();
    customEvent.init({
        $j_eventTypeEditModal: null,
        $tpl_grid_button: null,
        $tpl_eventType_grid_operate_col: null,
        root: null,
        grid: null,
        defaultGridOpts: {
            tableClass: 'bordered hoverable centered',
            column: [{
                field: '_index',
                title: "编号",
                width: '30%',
                format: function (value, itemData, index) {
                    return index || '';
                }
            }, {
                field: 'label',
                title: '显示名称',
                width: '30%',
                format: function (value, itemData) {
                    return value;
                }
            }, {
                field: 'name',
                title: "事件名称",
                width: '30%',
                format: function (value, itemData) {
                    return value;
                }
            }, {
                field: 'visible',
                title: "显示",
                width: '10%',
                format: function (value, itemData) {
                    if (value) {
                        return '<div class="switch"><label><input role="slideChecked" checked type="checkbox"><span class="lever" role="sliderButton"></span></label></div>';
                    } else {
                        return '<div class="switch"><label><input role="slideChecked" type="checkbox"><span class="lever" role="sliderButton"></span></label></div>';
                    }
                }
            }]
        },
        initElements: function () {
            this.root = $('#event-type');
            this.j_eventTypeEditModal = $('#event-type-edit');
            this.$tpl_grid_button = $('#tpl_eventType_grid_button');
            this.$tpl_eventType_grid_operate_col = $('#tpl_eventType_grid_operate_col');
            this.$submitSchema = $('#btn_saveSchema');
            this.$submitSchema.on('click', function (e) {
                var target = $(this);
                if (target.hasClass('disabled')) return;
                target.addClass('disabled').text('设置中');
                BusinessData.submitSchema().then(function (data) {
                    if (data.success) {
                        Materialize.toast('设置已生效！', 3000, 'success');
                    } else {
                        Materialize.toast(data.msg, 3000, 'warning');
                    }
                }).fail(function (xhr, statuText, data) {
                    console.log(statuText);
                    Materialize.toast('设置超时！', 3000, 'warning');
                }).always(function (xhr, statuText, data) {
                    target.removeClass('disabled').text('应用设置');
                });
            });
        },
        initEditGrid: function () {
            var that = this;
            var gridOpts = $.extend(true, {}, that.defaultGridOpts, {
                root: that.root,
                buttonTem: [that.$tpl_grid_button.text()]
            });
            gridOpts.column.push({
                field: 'operation',
                title: '',
                align: 'right',
                width: '20%',
                visible: true,
                format: function (value, itemData) {
                    return dot.template(that.$tpl_eventType_grid_operate_col.text())(itemData);
                }
            });
            var dataGrid = Grid.create(gridOpts);
            dataGrid.on('roleClick', function (e, eTarget, role) {
                switch (role) {
                    case 'editEventTypeRow':
                        that.editEventTypeRow(eTarget);
                        break;
                    case 'createNewEventType':
                        that.createNewEventType(eTarget);
                        break;
                }
            });
            /**
             * 点击表格行事件
             */
            dataGrid.on('gridRowClick', function (e, eTarget, role) {
                that.clickEditRow(eTarget);
            });
            dataGrid.on('afterSlideButton', function (e, eTarget, rowData) {
                BusinessData.updateEventType(rowData).then(function (res) {
                    if (res) {
                        EditModal.rootShow && that.editModal.cancelEventOperate();
                    }
                });
            });
            dataGrid.on('afterDeleteRow', function (e, eTarget, rowData) {
                var eventId = rowData.id;
                if (!eventId) return;
                BusinessData.deleteEventById(eventId).then(function (data) {
                    if (!data) {
                        that.reLoadData();
                        Materialize.toast('事件删除失败', 3000, 'warning');
                    }
                })
            });
            return dataGrid;
        },
        /**
         * 初始化editModal
         */
        initEditModal: function () {
            var that = this, modal = EditModal.create();
            modal.on('addEventAfter', function (e) {
                that.loadData();
            });
            modal.on('closeAddEventAfter', function (e, target, refresh) {
                if (refresh) {
                    that.loadData();
                }
            });
            return modal;
        },
        editEventTypeRow: function (eTarget) {
            var that = this,
                dataGrid = that.grid;
            var id = $(eTarget.target).attr('data-id');
            var data = $.extend(true, {}, dataGrid.getDataById(id));
        },
        onInited: function () {
            var that = this;
            that.initElements();
            that.grid = that.initEditGrid();
            that.editModal = that.initEditModal();
            that.loadData();
        },
        createNewEventType: function (e) {
            if (EditModal.rootShow) {
                return;
            }
            var that = this,
                $target = $(e.target);
            var ops = {
                type: 'add',
                root: '#event-type',
                data: {
                    "name": "",
                    "label": "",
                    "id": '',
                    "object": _.filter(BusinessData.defaultObject, function (item) {
                        return item.name === 'web'
                    })[0],
                    "subject": _.filter(BusinessData.defaultObject, function (item) {
                        return item.name === 'visitor'
                    })[0]
                },
                gridData: that.grid.getSourceData()
            };
            that.editModal.init(ops);
            $target.parent().addClass('disabled');
        },
        /**
         * 点击编辑行
         * @param e
         */
        clickEditRow: function (e) {
            var $tr = $(e.target).closest('tr'),
                _id = $tr.attr('data-id'),
                that = this,
                rowData = that.grid.getDataById(_id);
            if (EditModal.rootShow || !rowData.edit) {
                return;
            }
            BusinessData.getEventInfoById(rowData.id).then(function (data) {
                if (data) {
                    var _$tr = $('<tr><td class="edit-row-st" colspan="' + $('td', $tr).length + '"></td></tr>');
                    $tr.after(_$tr);
                    var ops = {
                        type: 'edit',
                        root: $('td', _$tr),
                        rowData: rowData,
                        data: data.dataObject,
                        gridData: that.grid.getSourceData()
                    };
                    that.editModal.init(ops);
                }
            });
        },
        loadData: function (eventTypes) {
            var that = this;
            BusinessData.loadEventTypes().then(function (data) {
                that.grid.renderGrid(data);
            });
        },
        reLoadData: function () {
            var that = this;
            BusinessData.loadEventTypes().then(function (data) {
                that.loadData(data);
            });
        }
    });
});