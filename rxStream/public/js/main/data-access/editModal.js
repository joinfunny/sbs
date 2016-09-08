/**
 * Created by fisher810 on 2016-8-23.
 */
define([ 
    'dot',
    'main/data-access/propertySidebar',
    'main/data-access/eventBaseData',
    'main/data-access/selectComponent'
], function (dot, propertySidebar, BusinessData, select) {
    var $tpl_grid_button = $('#tpl_property_slide_button'),
        $tpl_property_grid_operate_col = $('#tpl_property_grid_operate_col');
    var defaultOps = {
        root: '#property-table',
        tableClass: 'bordered hoverable centered',
        buttonTem: [$tpl_grid_button.text()]
    };
    var eventColumn = {
        column: [{
            field: '_index',
            title: "编号",
            width: 90,
            format: function (value, itemData, index) {
                return index || '';
            }
        }, {
            field: 'name',
            title: '字段名称',
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
                            regStr: /^(b_)[a-zA-Z0-9_]*$/,
                            errorTips: '必须以b_开头且只能输入英文数字及下划线'
                        }
                    ]
                }
            },
            format: function (value, itemData) {
                return value;
            }
        }, {
            field: 'label', //字段名
            title: "显示名", //字段中文名
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
                        }
                    ]
                }
            },
            format: function (value, itemData) {
                return value;
            }
        }, {
            field: 'dataType',
            title: "数据类型",
            width: 120,
            editor: {
                type: 'select',
                options: {
                    data: [{
                        groupName: '维度', groupValue: 1, data: BusinessData.dataTypeData
                    }, {
                        groupName: '指标', groupValue: 2, data: BusinessData.dataTypeIndexData
                    }]
                }
            },
            format: function (value, rowData) {
                return _.find(BusinessData.dataTypeData.concat(BusinessData.dataTypeIndexData), function (mode) {
                    return mode.value == value;
                }).text;
            }
        }, {
            field: 'filterMode',
            title: "筛选方式",
            width: 120,
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
                return filterMode ? filterMode.text : '无';
            }
        }, {
            field: 'operation',
            title: '',
            width: 80,
            align: 'right',
            visible: true,
            format: function (value, itemData) {
                return dot.template($tpl_property_grid_operate_col.text())(itemData);
            }
        }],
        defaultData: {
            name: 'b_',
            label: '',
            dataType: 'STRING',
            type: 1,
            edit: true,
            filterMode: 1,
            visible: true
        }
    };

    var objectColumn = {
        column: [{
            field: '_index',
            width: 90,
            title: "编号",
            format: function (value, itemData, index) {
                return index || '';
            }
        }, {
            field: 'name',
            title: '字段名称',
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
                        }
                    ]
                }
            },
            format: function (value, itemData) {
                return value;
            }
        }, {
            field: 'label', //字段名
            title: "显示名", //字段中文名
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
                        }
                    ]
                }
            },
            format: function (value, itemData) {
                return value;
            }
        }, {
            field: 'dataType',
            title: "数据类型",
            width: 120,
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
            title: "筛选方式",
            width: 120,
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
                return filterMode ? filterMode.text : '无';
            }
        }, {
            field: 'operation',
            title: '',
            width: 80,
            align: 'right',
            visible: true,
            format: function (value, itemData) {
                return dot.template($tpl_property_grid_operate_col.text())(itemData);
            }
        }],
        defaultData: {
            name: 'o_',
            label: '',
            dataType: 'STRING',
            edit: true,
            filterMode: 1,
            visible: true
        }
    };

    /**
     * @constructor
     * @description 构造函数
     */
    function EditModal() {
    }

    /**
     *原型继承 EventEmitter 原型
     */
    EditModal.prototype = _.create(EventEmitter.prototype, {
        'constructor': EditModal
    });
    /**
     * CreateEvent原型
     */
    $.extend(EditModal.prototype, {
        options: null,
        root: null,
        eventWarp: '.event-add-edit-warp',
        addButton: '.top-menu',
        verify: null,
        objectData: null,
        sideInstance: null,
        /**
         * 初始化
         * @param ops
         * @return this
         */
        init: function (ops) {
            this.options = ops;
            this.$root = typeof ops.root === 'string' ? $(ops.root) : ops.root;
            !this.sideInstance && this.initPropertySidebar();
            this.createEventDom();
            this.bindHandleEvent();
            this.bindMyEvent();
            this.verify = true;
            return this;
        },
        /**
         * 创建Event Dom
         */
        createEventDom: function () {
            EditModal.rootShow = true;
            var that = this, interText = dot.template($("#event-create-tpl").text());
            this.$root.prepend(interText(this.options));
            setTimeout(function () {
                $(that.eventWarp).addClass('show');
            }, 10);
        },
        /**
         * 初始化 propertySidebar
         */
        initPropertySidebar: function () {
            var that = this, side = propertySidebar.create();
            side.on('savePropertyAfter', function (e, target, type, status) {
                switch (type) {
                    case 'event':
                        if (status === 'add') {
                            that.cancelEventOperate(target, true);

                        }
                        break;
                    case 'object':
                        break;
                }
            });
            this.sideInstance = side;
        },
        /**
         * 移除Event Dom
         */
        deleteEventDom: function () {
            this.options.type === 'add' ? $(this.eventWarp, this.$root).remove() : this.$root.closest('tr').remove();
        },
        /**
         * 绑订事件
         */
        bindMyEvent: function () {
            $(this.eventWarp).on('click', this.handleEvent);
            $(this.eventWarp).on('focusin focusout', '.event-label,.event-name', this.checkEventName.bind(this));
            $(this.eventWarp).on('keyup', '.event-label', this.changeEventLabel);
            $('body').on('click', '.add-new-object', this.createNewObject.bind(this))
        },
        /**
         * 事件名称焦点
         * @param e
         */
        checkEventName: function (e) {
            var target = e.target,
                type = e.type;
            if (type === 'focusin') {
                this.createEventInputTips(target);
                $(target).removeClass('error-st');
            } else {
                this.checkInputValue(target);
            }

        },
        /**
         * 创建input tips
         * @param target (目标input)
         * @param text (提示内容)
         */
        createEventInputTips: function (target, text) {
            var sel = $('.input-error-tips', $(target).parent());
            if (!text) {
                sel.hide();
                return;
            }
            if (!sel.length) {
                sel = $('<div class="input-error-tips"></div>');
                $(target).after(sel);
            }
            sel.html(text).show();
        },
        /**
         * 验证input 值
         * @param target 目标input
         * @return boolean
         */
        checkInputValue: function (target) {
            var val = $.trim($(target).val()),
                name = $(target).attr('name');
            if (val === '') {
                this.createEventInputTips(target, '该项不能为空！');
                this.verify = false;
            } else if (val.length > 50) {
                this.createEventInputTips(target, '不能多于50个字符！');
                this.verify = false;
            } else if (this.checkNameRepeat(name, val)) {
                this.createEventInputTips(target, '该值已重复！');
                this.verify = false;
            } else if (name === 'name' && !/^[a-zA-Z0-9_]*$/.test(val)) {
                this.createEventInputTips(target, '名称只能输入英文数字及下划线！');
                this.verify = false;
            } else {
                this.verify = true;
                this.options.data[name] = val;
            }
            !this.verify && $(target).addClass('error-st');
            return this.verify;
        },
        /**
         * 验证输入的值在表格中有无重复
         * @param name (字段名)
         * @param val (字段值）
         */
        checkNameRepeat: function (name, val) {
            var gridData = this.options.gridData, id = this.options.data.id;
            var filterData = _.filter(gridData, function (item) {
                return id != item.id;
            });
            return _.some(filterData, function (item) {
                return item[name] === val;
            });
        },
        /**
         * 改动label值 change
         */
        changeEventLabel: function () {
            $('.event-name-clone').val($(this).val());
        },
        /**
         * 新建对像
         * @param e
         */
        createNewObject: function (e) {
            var $target = $(e.target), that = this;
            var ops = {
                type: 'object',
                status: 'add',
                objectData: that.objectData,
                gridOptions: $.extend(defaultOps, {
                    gridData: []
                }, objectColumn)
            };
            that.sideInstance.init(ops);
            $target.parent().hide();
        },
        // 事件函数统一路由
        handleEvent: function (e) {
            switch (e.type) {
                case 'click':
                    this.click(e);
                    break;
                default:
            }
        },
        /**
         * 点击事件处理
         */
        click: function (e) {
            var role = e.target.getAttribute('role');
            switch (role) {
                case 'saveEventOperate':
                    this.saveEventOperate(e);
                    break;
                case 'cancelEventOperate':
                    this.cancelEventOperate(e);
                    break;
                case 'editMainObjectProperty':
                    this.editMainObjectProperty(e);
                    break;
                case 'editEventProperty':
                    this.editEventProperty(e);
                    break;
                case 'editSubObjectProperty':
                    this.editSubObjectProperty(e);
                    break;
                case 'objectListSelect':
                    this.objectListSelect(e);
                    break;
                default:
                    this.emit('roleClick', e, role);
            }
        },
        /**
         * 保存事件
         * @param e (事件event)
         */
        saveEventOperate: function (e) {
            var that = this,
                $label = $('.event-label', this.$root),
                $name = $('.event-name', this.$root),
                $event = $('.event-name-clone', this.$root),
                $mainObj = $('.main-obj-select', this.$root),
                $subObj = $('.sub-obj-select', this.$root);
            if (!this.checkInputValue($label[0]) || !this.checkInputValue($name[0])) {
                return;
            }
            var data = {
                label: $label.val(),
                objectId: +$mainObj.attr('data-value'),
                subjectId: +$subObj.attr('data-value')
            };
            if (this.options.type === 'add') {
                data.name = $name.val();
                data.visible = true;
                BusinessData.addEventType({data: data, props: BusinessData.defaultEventProperty}).then(function (res) {
                    if (res) {
                        that.cancelEventOperate();
                        that.emit('addEventAfter', e, that.options.type);
                    }
                });
            } else {
                data.id = $event.attr('data-value');
                data.visible = that.options.rowData.visible;
                BusinessData.updateEventType(data).then(function (res) {
                    if (res) {
                        that.cancelEventOperate();
                        that.emit('addEventAfter', e, that.options.type);
                    }
                });
            }

        },
        /**
         * 取消事件
         * @param e (事件event)
         * @param refresh (true 关闭后刷新表格)
         */
        cancelEventOperate: function (e, refresh) {
            var that = this;
            $(this.eventWarp).removeClass('show');
            $(this.addButton).removeClass('disabled');
            EditModal.rootShow = false;
            setTimeout(function () {
                that.deleteEventDom();
            }, 10);
            that.emit('closeAddEventAfter', e, refresh);
        },
        /**
         * 主客体下拉
         * @param e
         */
        objectListSelect: function (e) {
            BusinessData.loadEventObjectList().then(function (data) {
                var selectData = _.map(data, function (item) {
                    var obj = {};
                    obj.value = item.id;
                    obj.text = item.label;
                    return obj;
                });
                select.create({
                    headerTemp: '<li class="add-new-object">+ 新建对像</li>',
                    trigger: $(e.target),
                    data: selectData
                });
            });
        },
        /**
         * 编辑主体对像属性
         * @param e
         */
        editMainObjectProperty: function (e) {
            var that = this,
                $target = $(e.target),
                $dataFor = $('.' + $target.attr('data-for')),
                value = +$dataFor.attr('data-value'),
                text = $dataFor.val();
            BusinessData.getObjectById(value).then(function (res) {
                if (res) {
                    var ops = {
                        type: 'object',
                        status: 'edit',
                        typeData: {text: text, value: value},
                        gridOptions: $.extend(defaultOps, {
                            gridData: res.data.props || []
                        }, objectColumn)
                    };
                    that.sideInstance.init(ops);
                }
            });
        },
        /**
         * 编辑事件属性
         * @param e
         */
        editEventProperty: function (e) {
            var that = this,
                $label = $('.event-label', this.$root),
                $name = $('.event-name', this.$root),
                $mainObj = $('.main-obj-select', this.$root),
                $subObj = $('.sub-obj-select', this.$root);
            if (!this.checkInputValue($label[0]) || !this.checkInputValue($name[0])) {
                return;
            }
            var $target = $(e.target),
                $dataFor = $('.' + $target.attr('data-for')),
                type = $target.attr('data-type'),
                value = $dataFor.attr('data-value'),
                text = $dataFor.val();
            var ops = {
                type: 'event',
                status: type,
                typeData: {text: text, value: value},
                gridOptions: $.extend(defaultOps, eventColumn)
            };
            if (type === 'add') {
                ops.typeData = {
                    "name": $name.val(),
                    "label": $label.val(),
                    "subjectId": +$subObj.attr('data-value'),
                    "objectId": +$mainObj.attr('data-value'),
                    "visible": true
                };
                ops.gridOptions.gridData = BusinessData.defaultEventProperty || [];
                this.sideInstance.init(ops);
            } else {
                BusinessData.getEventProperty(value).then(function (resData) {
                    if (resData) {
                        ops.gridOptions.gridData = resData.dataObject || [];
                        that.sideInstance.init(ops);
                    }
                });
            }

        },
        /**
         * 编辑客体对像属性
         * @param e
         */
        editSubObjectProperty: function (e) {
            var that = this,
                $target = $(e.target),
                $dataFor = $('.' + $target.attr('data-for')),
                value = +$dataFor.attr('data-value'),
                text = $dataFor.val();
            BusinessData.getObjectById(value).then(function (res) {
                if (res) {
                    var ops = {
                        type: 'object',
                        status: 'edit',
                        typeData: {text: text, value: value},
                        gridOptions: $.extend(defaultOps, {
                            gridData: res.data.props || []
                        }, objectColumn)
                    };
                    that.sideInstance.init(ops);
                }
            });
        }
    });

    /**
     * CreateEvent 静态方法
     */
    $.extend(EditModal, {
        rootShow: false,
        instance: null,
        /**
         * 实例化
         * @returns EditModal 实例
         */
        create: function () {
            this.instance = new EditModal();
            return this.instance;
        }
    });
    /**
     * 返回构造函数
     */
    return EditModal;
});