/**
 * Created by fisher810 on 2016-8-26.
 */

define([
    'dot',
    'main/data-access/dataGrid',
    'main/data-access/eventBaseData',
    'main/data-access/propertySelect'
], function (dot, grid, BusinessData, propertySelect) {

    /**
     * @constructor
     * @description 构造函数
     */
    function PropertySidebar() {
    }

    /**
     *原型继承 EventEmitter 原型
     */
    PropertySidebar.prototype = _.create(EventEmitter.prototype, {
        'constructor': PropertySidebar
    });
    /**
     * CreatePropertySide原型
     */
    $.extend(PropertySidebar.prototype, {
        options: null,
        root: null,
        propertyGrid: null,
        isInit: null,
        objectNameInput: '.obj-name',
        objectLabelInput: '.obj-label',
        propertyWarp: '.event-property-warp',
        propertyMark: '.property-global-mark',
        /**
         * 外部初始化
         * @param ops
         * @return this
         */
        init: function (ops) {
            if (!this.isInit) {
                this.__init(ops);
                return;
            }
            this.options = $.extend(true, {'typeData': {edit: true}}, ops);
            this.setPropertyDom();
            this.initGird(ops.gridOptions);
            return this;
        },
        /**
         * 内部初始化
         * @param ops
         * @return this
         */
        __init: function (ops) {
            this.isInit = true;
            this.options = $.extend({'typeData': {}}, ops);
            this.$root = ops.root || $('body');
            this.createPropertyDom();
            this.bindHandleEvent();
            this.initGird(ops.gridOptions);
            this.bindSideEvent();
            return this;
        },
        /**
         * 创建property Dom
         */
        createPropertyDom: function () {
            var $mark = $('<div class="property-global-mark"></div>'),
                $warp = $('<div class="event-property-warp"></div>');
            var that = this;
            var interText = dot.template($("#tpl_eventProperties_slide").text());
            this.$root.append($mark);
            this.$root.append($warp);
            this.setPropertyDomHeight();
            $warp.append(interText(this.options));
            setTimeout(function () {
                $(that.propertyWarp).addClass('active');
            }, 10);
        },
        /**
         * 设置property Dom
         */
        setPropertyDom: function () {
            var that = this;
            var interText = dot.template($("#tpl_eventProperties_slide").text());
            $(this.propertyWarp).html(interText(this.options)).show();
            $(this.propertyMark).show();
            this.setPropertyDomHeight();
            setTimeout(function () {
                $(that.propertyWarp).addClass('active');
            }, 10);
        },
        /**
         * 设置DOM 高度
         */
        setPropertyDomHeight: function () {
            var h = $(document).height();
            $(this.propertyMark).css('height', h);
            $(this.propertyWarp).css('height', h);
            $(window).scrollTop(0);
        },
        /**
         * 渲染表格
         * @param data
         * @returns grid
         */
        initGird: function (data) {
            var that = this;
            delete this.propertyGrid;
            var gridProp = grid.create(data);
            this.propertyGrid = gridProp;
            gridProp.on('roleClick', function (e, eTarget, role) {
                var $target = $(eTarget.target);
                switch (role) {
                    case 'clickName':
                        if ($target.attr('name') === 'name') {
                            if (that.options.type === 'event') {
                                BusinessData.loadEventTypeProperties().then(function (data) {
                                    if (data) {
                                        propertySelect.create({
                                            trigger: $target,
                                            data: data,
                                            grid: that.propertyGrid
                                        });
                                    }
                                });
                            } else {
                                BusinessData.loadObjectProperties().then(function (data) {

                                });
                            }
                        }
                        break;
                }
            });
            gridProp.on('afterDeleteRow', function (e, eTarget, rowData) {
                var propId = rowData.id, typeId = that.options.typeData.value;
                if (!typeId || !propId) return;
                if (that.options.type === 'event') {
                    BusinessData.deleteEventProp(typeId, propId).then(function (data) {
                        if (!data) {
                            gridProp.renderGrid(data);
                            Materialize.toast('事件删除失败', 3000, 'warning');
                        }
                    })
                } else {
                    BusinessData.deleteObjectProp(typeId, propId).then(function (data) {
                        if (!data) {
                            gridProp.renderGrid(data);
                            Materialize.toast('事件删除失败', 3000, 'warning');
                        }
                    })
                }
            });
            return gridProp;
        },
        /**
         * 关闭属性层
         * @param e
         */
        closeProperty: function (e) {
            var that = this;
            setTimeout(function () {
                $(that.propertyWarp).removeClass('active');
                $(that.propertyMark).hide();
            }, 10);
        },
        /**
         * 保存属性
         * @param e
         */
        saveProperty: function (e) {
            if ($(this.objectLabelInput).length && $(this.objectNameInput).length) {
                if (!this.checkInputValue($(this.objectLabelInput)[0]) || !this.checkInputValue($(this.objectNameInput)[0])) {
                    return;
                }
            }
            var that = this, ops = this.options, type = ops.type, status = ops.status;
            switch (type) {
                case 'event':
                    if (status === 'add') {
                        BusinessData.addEventType({
                            data: ops.typeData,
                            props: that.propertyGrid.getGridData()
                        }).then(function (res) {
                            if (res) {
                                that.closeProperty();
                                that.emit('savePropertyAfter', e, type, status);
                            }
                        });
                    } else {
                        var id = ops.typeData.value,
                            reqData = that.propertyGrid.getGridData();
                        BusinessData.updateEventProperty(id, reqData).then(function (data) {
                            if (data) {
                                that.closeProperty();
                                that.emit('savePropertyAfter', e, type, status);
                            }
                        });
                    }
                    break;
                case 'object':
                    if (status === 'add') {
                        BusinessData.addEventObjectAjax(
                            {
                                data: {
                                    name: $(that.objectNameInput).val(),
                                    label: $(that.objectLabelInput).val()
                                },
                                props: that.propertyGrid.getGridData()
                            }
                        ).then(function (data) {
                                if (data) {
                                    that.closeProperty();
                                    that.emit('savePropertyAfter', e, type, status);
                                }
                            });
                    } else {
                        BusinessData.updateEventObjectAjax(
                            {
                                data: {
                                    id: ops.typeData.value,
                                    label: ops.typeData.text
                                },
                                props: that.propertyGrid.getGridData()
                            }
                        ).then(function (data) {
                                if (data) {
                                    that.closeProperty();
                                    that.emit('savePropertyAfter', e, type, status);
                                }
                            });
                    }
                    break;
            }
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
            var gridData = this.options.objectData, id = this.options.typeData.value || 0;
            var filterData = _.filter(gridData, function (item) {
                return id != item.id;
            });
            return _.some(filterData, function (item) {
                return item[name] === val;
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
        },
        /**
         * 点击事件处理
         */
        click: function (e) {
            var role = e.target.getAttribute('role');
            switch (role) {
                case 'closeProperty':
                    this.closeProperty(e);
                    break;
                case 'saveProperty':
                    this.saveProperty(e);
                    break;
                default:
                    this.emit('roleClick', e, role);
            }
        },
        /**
         * 组件事件
         */
        bindSideEvent: function () {
            var that = this;
            $(this.propertyWarp).on('click', this.handleEvent);
            $(this.propertyWarp).on('focusin focusout', this.objectLabelInput + ',' + this.objectNameInput, this.checkEventName.bind(this));
            $(this.propertyWarp).on('transitionend', function (e) {
                if (!$(this).hasClass('active')) {
                    $(this).hide();
                }
            });
        }
    });

    /**
     * CreateEvent 静态方法
     */
    $.extend(PropertySidebar, {
        instance: null,
        /**
         * 实例化
         * @returns PropertySidebar 实例
         */
        create: function () {
            if (!this.instance) {
                this.instance = new PropertySidebar();
            }
            return this.instance;
        }
    });
    /**
     * 返回构造函数
     */
    return PropertySidebar;
});
