/**
 * Created by fisher810 on 2016-7-26.
 */
define([
    'main/data-access/selectComponent'
], function (select) {

    function DataGrid() {
    }

    // 原型
    DataGrid.prototype = _.create(EventEmitter.prototype, {
        'constructor': DataGrid
    });
    $.extend(DataGrid.prototype, {
        options: null,
        sourceData: null,
        $root: null,
        tbody: null,
        editRow: null,
        editRowClass: 'edit-row',

        init: function (ops) {
            this.options = ops;
            this.$root = typeof ops.root === 'string' ? $(ops.root) : ops.root;
            this.bindHandleEvent();
            this.initRoot();
            this.parseGridData();
            this.createGird();
            return this;
        },
        //创建表格按钮区 ops.globalButton=['add','save','自定义HTML'],add save 为默认，其它按钮事件需要自行定义
        createGlobalButton: function () {
            var $button = $('<div class="gird-button-area"></div>'),
                domStr = '';
            _.forEach(this.options.buttonTem, function (item) {
                switch (item) {
                    case 'add':
                        domStr += '<a href="javascript:;" role="addRow" class="add-row">加</a>';
                        break;
                    default:
                        domStr += item;
                }
            });
            $button.html(domStr);
            this.$root.append($button);
        },
        //创建表格头
        createGridHead: function (data) {
            var that = this,
                headerStr = '';
            headerStr = '<thead><tr>' + _.map(that.options.column, function (itemData) {
                return '<th style="' + that.parseStyle(itemData) + '">' + itemData.title + '</th>';
            }).join('') + '</tr></thead>';
            return headerStr;
        },
        //创建表格主体
        createGridBody: function (data) {
            var that = this,
                bodyStr = '',
                gridData = data || this.sourceData;
            bodyStr = _.map(gridData, function (item, i) {
                return '<tr tabindex="0" role="clickEditRow" data-id="' + item.dataId + '">' + _.map(that.options.column, function (itemData) {
                        var tdValue = that.formatValue(item[itemData.field], item, itemData.format, i + 1);
                        return '<td style="' + that.parseStyle(itemData) + '">' + tdValue + '</td>'
                    }).join('') + '</tr>'
            }).join('');
            return bodyStr;
        },
        //创建表格

        createGird: function () {
            var that = this,
                table = $('<table class="' + (this.options.tableClass || '') + '"></table>');
            this.createGlobalButton();
            table.html(this.createGridHead() + '<tbody>' + this.createGridBody() + '</tbody>');
            this.$root.append(table);
            this.tbody = table[0].tBodies[0];
        },
        //解析表格数据 加入UUID
        parseGridData: function (data) {
            var that = this,
                myData = data || this.options.gridData;
            if (myData && myData.length > 0) {
                this.sourceData = _.map(myData, function (item) {
                    item.dataId = that.generateID();
                    return item;
                });
            } else {
                this.sourceData = [];
            }
        },
        //生成UUID
        generateID: function () {
            return "stream" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        },
        //解析表格td样式
        parseStyle: function (itemstyle) {
            var styleStr = '';
            if (itemstyle.width) {
                styleStr = 'width:' + (typeof itemstyle.width == 'number' ? itemstyle.width + 'px;' : itemstyle.width + ';');
            }
            if (itemstyle.align) {
                styleStr += 'text-align:' + itemstyle.align + ';';
            }
            if (!itemstyle.visible && typeof itemstyle.visible != 'undefined') {
                styleStr += 'visibility:hidden;'
            }
            return styleStr;
        },
        //格式化td数据
        formatValue: function (value, data, callback, index) {
            if (callback) {
                return callback(value, data, index);
            } else {
                return value;
            }
        },
        //绑定事件
        click: function (e) {
            var target = e.target, role = target.getAttribute('role');
            switch (role) {
                case 'addRow':
                    this.addRow(e);
                    break;
                case 'editGridRow':
                    this.editGridRow(e);
                    break;
                case 'deleteGridRow':
                    this.deleteGridRow(e);
                    break;
                case 'gridOperate':
                    this.gridOperate(e);
                    break;
                case 'triggerSelect':
                    this.triggerSelect(e);
                    break;
                case 'sliderButton':
                case 'slideChecked':
                    break;
                default:
                    var roleTow = $(target).closest('tr').attr('role');
                    switch (roleTow) {
                        case 'clickEditRow':
                            this.emit('gridRowClick', e, role);
                            break;
                        default:
                            role = target.getAttribute('data-role');
                            this.emit('roleClick', e, role);
                    }
            }
        },
        focusout: function (e) {
            var role = e.target.getAttribute('role');
            if (this.editRow) {
                if (this.editRow !== e.relatedTarget && !$.contains(this.editRow, e.relatedTarget) && $('.select-component-warp')[0] !== e.relatedTarget) {
                    this.setDataById(this.editRow.dataset.id, this.getEditData());
                    this.cancelEdit();
                }
            }
        },
        focusin: function (e) {
            var role = e.target.getAttribute('role');
            switch (role) {
                case 'checkInput':
                    this.deleteCheckStatus(e);
                    break;
                default:
            }
        },
        change: function (e) {
            var role = e.target.getAttribute('role');
            switch (role) {
                case 'slideChecked':
                    this.slideButton(e);
                    break;
                default:
            }
        },
        initRoot: function () {
            this.$root
                .on('click focusout', this.handleEvent)
                .on('change', '.switch input', this.handleEvent)
                .on('focusin', this.handleEvent);
            $(document).off('click').on('click', function (e) {
                if (!$(e.target).is('.grid-operate') && !$(e.target).is('.operate-menu') && $('.operate-menu').find($(e.target)).length === 0) {
                    $('.operate-menu').hide();
                }
            });
        },
        /**
         * 表格操作
         * @param e
         */
        gridOperate: function (e) {
            var $target = $(e.target);
            $('.operate-menu').hide();
            $('.operate-menu', $target).show();
        },
        slideButton: function (e) {
            var $target = $(e.target),
                $tr = $target.parents('tr'),
                id = $tr.attr('data-id');
            var curData = this.sourceData[this.getIndexById(id)];
            curData.visible = $target.prop('checked');
            this.emit('afterSlideButton', $target, curData);
        },
        //删除验证状态
        deleteCheckStatus: function (e) {
            var $target = $(e.target);
            $target.removeClass('error-input');
            this.createInputTips($target);
        },
        //验证input
        checkInput: function (dom) {
            var editInput = dom ? [$(dom)] : $('input[role="checkInput"]', this.$root),
                that = this,
                b = true;
            if (editInput.length > 0) {
                editInput.each(function () {
                    if (!that.checkValue(this)) {
                        b = false;
                        return false;
                    }
                });
            }
            return b;
        },
        checkValue: function (inputDom) {
            var checkStatus = true,
                validObj, that = this,
                _value = $.trim($(inputDom).val()),
                _defaultValue = $.trim($(inputDom).attr('data-val')),
                id = $(inputDom).parents('tr').attr('data-id'),
                _name = $(inputDom).attr('name');
            _.some(that.options.column, function (itemData) {
                if (itemData.field == _name) {
                    validObj = itemData.editor.options.validType;
                    return true;
                }
            });
            validObj && _.some(validObj, function (item) {
                switch (item) {
                    case 'empty':
                        if (_value == '' || _value == _defaultValue) {
                            checkStatus = false;
                            $(inputDom).addClass('error-input');
                            that.createInputTips($(inputDom), '该项不能为空');
                        }
                        break;
                    case 'repeat':
                        var filterData = _.filter(that.sourceData, function (item) {
                            return id != item.dataId;
                        });
                        var isRepeat = _.some(filterData, function (item) {
                            return _value == item[_name];
                        });
                        if (isRepeat) {
                            checkStatus = false;
                            $(inputDom).addClass('error-input');
                            that.createInputTips($(inputDom), '该值已重复！');
                        }
                        break;
                    default:
                        if (item.type == 'length') {
                            if (_value.length < item.len[0] || _value.length > item.len[1]) {
                                checkStatus = false;
                                $(inputDom).addClass('error-input');
                                that.createInputTips($(inputDom), item.errorTips);
                            }
                        } else if (item.type == 'reg') {
                            if (!item.regStr.test(_value)) {
                                checkStatus = false;
                                $(inputDom).addClass('error-input');
                                that.createInputTips($(inputDom), item.errorTips);
                            }
                        } else if (item.type == 'ajax') {
                            item.ajaxFn('prop', _name, _value).then(function (res) {
                                if (res) {
                                    if (!res.dataObject) {
                                        checkStatus = false;
                                        $(inputDom).addClass('error-input');
                                        that.createInputTips($(inputDom), item.errorTips);
                                    }
                                } else {
                                    checkStatus = false;
                                    $(inputDom).addClass('error-input');
                                    that.createInputTips($(inputDom), '验证失败，请重试！');
                                }
                            });
                        }
                }
                return !checkStatus
            });
            return checkStatus;
        },
        //创建input 提示
        createInputTips: function (inputDom, text) {
            var inputParent = inputDom.parent(),
                $tips = $('.grid-input-tips', inputParent);
            if (text) {
                if (!$tips.length) {
                    $tips = $('<div class="grid-input-tips"></div>');
                    inputParent.append($tips);
                }
                $tips.html(text).show();
            } else {
                $tips.hide();
            }
        },
        //新加一列
        addRow: function (e) {
            if (!this.editRow) {
                var data = $.extend(true, {}, this.options.defaultData);
                data.dataId = this.generateID();
                this.sourceData.unshift(data);
                var $tr = $('<tr tabindex="0" class="edit-row" data-id="' + data.dataId + '"></tr>')
                    .html(this.createEditTr(data))
                    .prependTo(this.tbody);
                var __input__ = $tr.find('input').eq(0);
                __input__.val(__input__.val()).focus();
                this.editRow = $tr[0];
                this.emit('afterAddRow', this.editRow, data);
            }
        },
        //编辑列
        editGridRow: function (e) {
            var $target = $(e.target),
                $tr = $target.parents('tr'),
                id, rowData;
            if (!this.editRow && $tr[0] !== this.editRow) {
                if (this.editRow) {
                    $(this.editRow).removeClass(this.editRowClass)
                }
                $tr.removeAttr('role');
                id = $tr.attr('data-id');
                rowData = this.getDataById(id);
                $tr.html(this.createEditTr(rowData))
                    .addClass(this.editRowClass)
                    .find('input')
                    .eq(0)
                    .trigger('focus');
                this.editRow = $tr[0];
                this.emit('afterEditRow', this.editRow, rowData);
            }
        },
        //创建编辑列
        createEditTr: function (data, column) {
            var that = this,
                __column__ = column || this.options.column;
            return _.map(__column__, function (item) {
                return '<td' + (data.id ? ' data-row-id="' + data.id + '"' : '') + ' style="' + that.parseStyle(item) + '">' + that.createEditDom(item, data) + '</td>';
            }).join('');
        },
        //设置修改数据 返回修改后的数据
        setDataById: function (id, data) {
            var _index = this.getIndexById(id);
            $.extend(true, this.sourceData[_index], data);
            return this.sourceData[_index];
        },
        //获取修改的数据
        getEditData: function (editRow) {
            var dataObj = {};
            editRow || (editRow = this.editRow);
            $('[data-status="edit"]', editRow).each(function () {
                dataObj[this.name] = this.dataset.value || this.value.trim();
                if (this.name === 'dataType' && this.dataset.group) {
                    dataObj.type = this.dataset.group;
                }
            });
            $('td', editRow).attr('data-row-id') && (dataObj.id = +$('td', editRow).attr('data-row-id'));
            return dataObj;
        },
        // 取消编辑列并保存数据
        cancelEdit: function () {
            if (this.editRow && this.checkInput()) {
                var id = this.editRow.dataset.id,
                    sourceData = $.extend(true, {}, this.getDataById(id)),
                    editData = this.getDataById(id);
                this.createTrByData(id, editData);
                $(this.editRow).attr('role', 'clickEditRow').removeClass(this.editRowClass);
                //添加结束编辑后的事件
                this.emit('completeEditRow', this.editRow, sourceData, editData);
                delete this.editRow;
                this.refreshGrid();
            }

        },
        //创建edit 元素
        createEditDom: function (columnRow, data) {
            if (columnRow.editor) {
                var domStr;
                switch (columnRow.editor.type) {
                    case 'text':
                        domStr = '<div class="input-field"><input autocomplete="off" data-role="clickName" type="text" role="checkInput" data-val="' + this.options.defaultData[columnRow.field] + '" data-status="edit" ' + this.parseProperties(columnRow.editor.properties) + 'name="' + columnRow.field + '" value="' + data[columnRow.field] + '"></div>';
                        break;
                    case 'select':
                        domStr = '<div class="input-field"><input class="select-input-st" readonly type="text" role="triggerSelect" data-value="' + this.options.defaultData[columnRow.field] + '" data-status="edit" ' + this.parseProperties(columnRow.editor.properties) + 'name="' + columnRow.field + '" value="' + this.formatValue(data[columnRow.field], data, columnRow.format) + '"' + (columnRow.editor.options.data[0].groupName ? ' data-group=' + data.type : '') + '></div>';
                        break;
                    default:
                }
                return domStr;
            } else {
                return this.formatValue(data[columnRow.field], data, columnRow.format);
            }
        },
        //解析editor properties
        parseProperties: function (properties) {
            return properties ? _.map(properties, function (item) {
                return item.key + '=' + item.value + ' ';
            }).join('') : '';
        },
        //创建单tr 通过ID 更新到表格
        createTrByData: function (id, data) {
            var that = this,
                $tr = $('[data-id="' + id + '"]'),
                trStr = '';
            trStr = _.map(that.options.column, function (itemData) {
                return '<td style="' + that.parseStyle(itemData) + '">' + that.formatValue(data[itemData.field], data, itemData.format, $tr.index() + 1) + '</td>'
            }).join('');
            $tr.html(trStr);
        },
        //删除行
        deleteGridRow: function (e) {
            var $target = $(e.target),
                $tr = $target.parents('tr'),
                id = $tr.attr('data-id');
            $tr.hasClass(this.editRowClass) && delete this.editRow;
            $tr.remove();
            //添加删除行后的事件
            var deleteRowData;
            this.sourceData = _.filter(this.sourceData, function (item) {
                var result = item.dataId != id;
                if (!result) {
                    deleteRowData = item;
                }
                return result;
            });
            this.emit('afterDeleteRow', this.editRow, deleteRowData);
        },
        //通过ID获取数据
        getDataById: function (id) {
            var data;
            _.some(this.sourceData, function (item) {
                if (item.dataId == id) {
                    data = $.extend(true, {}, item);
                    return true;
                }
            });
            return data || [];
        },
        //通过ID获取数据index
        getIndexById: function (id) {
            var _index;
            _.some(this.sourceData, function (item, i) {
                if (item.dataId == id) {
                    _index = i;
                    return true;
                }
            });
            return typeof _index != 'undefined' ? _index : -1;
        },
        //通过数据渲染表格
        renderGrid: function (data) {
            delete this.editRow;
            this.parseGridData(data);
            $(this.tbody).html(this.createGridBody());
            return this;
        },
        /**
         * 刷新表格
         */
        refreshGrid: function () {
            $(this.tbody).html(this.createGridBody());
            return this;
        },
        //获取整个表格数据
        getGridData: function () {
            var data = JSON.parse(JSON.stringify(this.sourceData));
            _.each(data, function (item) {
                delete item.dataId;
            });
            return data;
        },
        //获取表格原数据
        getSourceData: function () {
            return JSON.parse(JSON.stringify(this.sourceData));
        },
        /**
         * 触发下拉
         * @param e
         */
        triggerSelect: function (e) {
            var target = e.target, field = $(target).attr('name');
            var data = _.filter(this.options.column, function (item) {
                return item.field === field;
            })[0].editor.options.data;
            select.create({
                trigger: $(e.target),
                data: data
            });
        },
        // 事件函数统一路由
        handleEvent: function (e) {
            switch (e.type) {
                case 'click':
                    this.click(e);
                    break;
                case 'focusout':
                    this.focusout(e);
                    break;
                case 'focusin':
                    this.focusin(e);
                    break;
                case 'change':
                    this.change(e);
                    break;
                default:
            }
        }
    });

    // 静态成员
    $.extend(DataGrid, {
        create: function (ops) {
            return new DataGrid().init(ops);
        }
    });

    return DataGrid;
});