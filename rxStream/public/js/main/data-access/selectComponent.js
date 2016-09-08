/**
 * Created by fisher810 on 2016-8-29.
 */
define([
    'dot'
], function (dot) {

    /**
     * @constructor
     * @description 构造函数
     */
    function SelectComponent() {
    }

    /**
     *原型继承 EventEmitter 原型
     */
    SelectComponent.prototype = _.create(EventEmitter.prototype, {
        'constructor': SelectComponent
    });
    /**
     * SelectComponent原型
     */
    $.extend(SelectComponent.prototype, {
        options: null,
        $trigger: null,
        $root: null,
        selectWarp: '.select-component-warp',
        /**
         * 外部初始化
         * @param ops
         * @return this
         */
        init: function (ops) {
            this.options = ops;
            this.$root = ops.root || $('body');
            this.$trigger = typeof ops.trigger === 'string' ? $(ops.trigger) : ops.trigger;
            this.parseData();
            $(this.selectWarp).html(this.createListByData());
            this.setSelectPos();
            this.bindEventTrigger();
            return this;
        },
        /**
         * 内部初始化
         * @param ops
         * @return this
         */
        __init: function (ops) {
            this.options = ops;
            this.$root = ops.root || $('body');
            this.$trigger = typeof ops.trigger === 'string' ? $(ops.trigger) : ops.trigger;
            this.parseData();
            this.createSelectDom();
            this.setSelectPos();
            this.bindHandleEvent();
            this.bindSelectEvent();
            this.bindEventTrigger();
            return this;
        },
        /**
         * 过滤格式化data
         */
        parseData: function () {
            return this;
        },
        /**
         * 创建select Dom
         */
        createSelectDom: function () {
            var $select = $(this.selectWarp);
            if (!$select.length) {
                $select = $('<ul tabindex="0" class="select-component-warp"></ul>');
            }
            $select.html(this.createListByData());
            this.$root.append($select);
        },
        /**
         * 初始化select list
         * @param data
         * @return str 模板html
         */
        createListByData: function (data) {
            var str = '', selectData = data || this.options.data, that = this;
            if (!selectData.length) {
                $(this.selectWarp).hide();
                return;
            }
            str += this.options.headerTemp || '';
            if (this.options.data[0].groupName) {
                str += _.map(selectData, function (item) {
                    return '<li class="select-group-name" data-value="' + item.groupValue + '">' + item.groupName + '</li>' + _.map(item.data, function (itemData) {
                            return '<li class="select-list' + (that.$trigger.val() === itemData.text && that.$trigger.attr('data-group') == item.groupValue ? ' active' : '') + '" data-group="' + item.groupValue + '" data-value="' + itemData.value + '" data-text="' + itemData.text + '">' + itemData.text + '</li>'
                        }).join('');
                }).join('');
            } else {
                str += _.map(selectData, function (itemData) {
                    return '<li class="select-list' + (that.$trigger.val() === itemData.text ? ' active' : '') + '" data-value="' + itemData.value + '" data-text="' + itemData.text + '">' + itemData.text + '</li>'
                }).join('');
            }
            str += this.options.footerTemp || '';
            return str;
        },
        /**
         * 设置select 位置
         */
        setSelectPos: function () {
            var offset = this.$trigger.offset(),
                top = offset.top + (this.$trigger.outerHeight() - this.$trigger.height()),
                left = offset.left + (this.$trigger.outerWidth() - this.$trigger.width()) / 2;
            if ((top + $(this.selectWarp).height() + this.$trigger.height()) > ($(window).height()) + $(window).scrollTop()) {
                top = top - $(this.selectWarp).height();
            } else {
                top = top + this.$trigger.height();
            }
            $(this.selectWarp).css({
                top: top,
                left: left,
                width: this.$trigger.width()
            }).show();
            //$(this.selectWarp).focus();
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
         * 关闭下拉层
         */
        close: function () {
            $(this.selectWarp).hide().empty();
        },
        /**
         * 事件绑定
         */
        bindSelectEvent: function () {
            var that = this;
            $(this.selectWarp).on('click', this.handleEvent);
            $(this.selectWarp).on('focusout', function (e) {
                if (!$(e.relatedTarget).is(that.$trigger) && $(that.selectWarp).find($(e.relatedTarget)).length === 0) {
                    that.close();
                    //that.$trigger.focus();
                }
            });
        },
        bindEventTrigger: function () {
            var that = this;
            this.$trigger.off('focusout').on('focusout', function (e) {
                if (!$(e.relatedTarget).is(that.selectWarp)) {
                    that.close();
                }
            });
        },
        /**
         * 点击事件处理
         */
        click: function (e) {
            var target = e.target;
            if ($(target).is('li')) {
                if ($(target).hasClass('select-list')) {
                    this.$trigger.val($(target).attr('data-text'));
                    this.$trigger.attr('data-value', $(target).attr('data-value'));
                    $(target).attr('data-group') && this.$trigger.attr('data-group', $(target).attr('data-group'));
                    $(this.selectWarp).hide();
                }
            }
        }
    });

    /**
     * SelectComponent 静态方法
     */
    $.extend(SelectComponent, {
        instance: null,
        /**
         * 实例化
         * @param ops
         * @returns SelectComponent 实例
         */
        create: function (ops) {
            if (!this.instance) {
                this.instance = new SelectComponent().__init(ops);
            } else {
                this.instance.init(ops)
            }
            return this.instance;
        }
    });
    /**
     * 返回构造函数
     */
    return SelectComponent;
});