/**
 * Created by fisher810 on 2016-9-7.
 */
define([
    'main/data-access/selectComponent'
], function (select) {

    /**
     * @constructor
     * @description 构造函数
     */
    function PropertySelect() {
    }

    /**
     *原型继承 selectComponent 原型
     */
    PropertySelect.prototype = _.create(select.prototype, {
        'constructor': PropertySelect
    });
    /**
     * PropertySelect原型
     */
    $.extend(PropertySelect.prototype, {
        options: null,
        $trigger: null,
        $root: null,
        selectWarp: '.select-component-warp-prop',
        /**
         * 创建select Dom
         */
        createSelectDom: function () {
            var $select = $(this.selectWarp);
            if (!$select.length) {
                $select = $('<ul tabindex="0" class="select-component-warp-prop"></ul>');
            }
            $select.html(this.createListByData());
            this.$root.append($select);
        },
        /**
         * 过滤格式化data
         */
        parseData: function () {
            var gridData = this.options.grid.getGridData();
            this.sourceData = $.extend(true, {}, this.options.data);
            var dataObj = {};
            _.each(this.sourceData, function (item) {
                dataObj[item.id] = true;
            });
            gridData.forEach(function (item) {
                if (dataObj.hasOwnProperty(item.id)) {
                    dataObj[item.id] = false;
                }
            });
            this.options.data = _.map(this.options.data, function (item) {
                var obj = {};
                obj.value = item.id;
                obj.text = item.name;
                return obj;
            });
            this.options.data = _.filter(this.options.data, function (item) {
                return dataObj[item.value];
            });
        },
        /**
         * 过滤数据
         * @param val
         * @return filter data
         */
        filterData: function (val) {
            return _.filter(this.options.data, function (item) {
                return item.text.indexOf(val) != -1;
            });
        },
        /**
         * 点击事件处理
         */
        click: function (e) {
            var target = e.target, gridInstance = this.options.grid;
            if ($(target).is('li')) {
                if ($(target).hasClass('select-list')) {
                    var id = $(target).attr('data-value'),
                        data = _.filter(this.sourceData, function (item) {
                            return item.id == id;
                        })[0];
                    this.$trigger.parents('tr.edit-row').html(gridInstance.createEditTr(data, gridInstance.options.column)).focus().blur();
                    this.close();
                }
            }
        },
        bindEventTrigger: function () {
            var that = this;
            this.$trigger.off('focusout').on('focusout', function (e) {
                if (!$(e.relatedTarget).is(that.selectWarp)) {
                    that.close();
                }
            });
            this.$trigger.off('keyup').on('keyup', function (e) {
                var value = $.trim($(this).val());
                var data = that.filterData(value) || that.options.data;
                $(that.selectWarp).html(that.createListByData(data));
            });
        }
    });

    /**
     * PropertySelect 静态方法
     */
    $.extend(PropertySelect, {
        instance: null,
        /**
         * 实例化
         * @param ops
         * @returns PropertySelect 实例
         */
        create: function (ops) {
            if (!this.instance) {
                this.instance = new PropertySelect().__init(ops);
            } else {
                this.instance.init(ops)
            }
            return this.instance;
        }
    });
    /**
     * 返回构造函数
     */
    return PropertySelect;
});