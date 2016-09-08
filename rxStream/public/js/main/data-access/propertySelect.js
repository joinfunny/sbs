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
         * 点击事件处理
         */
        click: function (e) {
           /* var target = e.target;
            if ($(target).is('li')) {
                if ($(target).hasClass('select-list')) {
                    this.$trigger.val($(target).attr('data-text'));
                    this.$trigger.attr('data-value', $(target).attr('data-value'));
                    $(target).attr('data-group') && this.$trigger.attr('data-group', $(target).attr('data-group'));
                    $(this.selectWarp).hide();
                }
            }*/
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