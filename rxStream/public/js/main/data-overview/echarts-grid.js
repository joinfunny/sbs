/**
 * Created by fisher on 2015-12-9.
 */
define([
], function () {

    function Grid() {
    }

    // 原型
    Grid.prototype = _.create(EventEmitter.prototype, {
        'constructor': Grid
    });
    $.extend(Grid.prototype, {
        options: null,
        gridType: 'normal',
        init: function (ops) {
            this.options = $.extend(true, {
                root: null,
                gridData: null,
                tdFormat: null,
                date: null,
                requestZhData: null,
                createTotal: false
            }, ops || {});
            //multiDimension 多维度
            this.gridType = ops.gridData.mainColumn.length > 1 ? 'multiDimension' : 'normal';
            if (this.options.createTotal) {
                this.createTotal();
            } else {
                var table = this.createTable();
                table.append(this.createHeader()).append(this.createBody());
                $(this.options.root).html('').append(table);
                this.tdFormat();
            }
        },
        //创建table
        createTable: function () {
            return this.gridType === 'multiDimension' ? $('<table class="table-total-style"></table>') : $('<table class="grid-table"></table>');
        },
        //创建header
        createHeader: function () {
            var thead = $('<thead></thead>'), headerStr,
                headerData = this.options.gridData.bodyData,
                groupFields = this.options.gridData.groupFields,
                mainColumn = this.options.gridData.mainColumn;
            switch (this.gridType) {
                case 'multiDimension':
                    headerStr = '';
                    break;
                case 'normal':
                    headerStr = '<tr><th>' + (groupFields.length > 0 ? this.options.requestZhData.groupFields_zh.join(',') : '日期') + '</th><th>' + mainColumn[0].value + '</th></tr>';
                    break;
            }
            thead.html(headerStr);
            return thead;
        },
        //创建body
        createBody: function () {
            var tbody = $('<tbody class="main-body"></tbody>'), bodyStr, that = this,
                bodyData = this.options.gridData.bodyData,
                groupFields = this.options.gridData.groupFields,
                mainColumn = this.options.gridData.mainColumn;
            switch (this.gridType) {
                case 'multiDimension':
                    if (this.options.type == 'radar') {
                        bodyStr = bodyData.map(function (itemData, j) {
                            return (groupFields.length > 0 ? '<tr><th class="total-title" colspan="' + mainColumn.length + '">' + itemData.groupValues.join('') + '</th></tr>' : '') + that.cutArr(mainColumn.map(function (item, i) {
                                    return '<td><span class="td-container num-warp">' + itemData.values[i].num + (groupFields.length > 1 && j > 0 ? ' <ins>(' + itemData.values[i].percent + '%)</ins>' : '') + '</span><span class="td-container score-warp">' + itemData.values[i].score + '分</span><p>' + item + '</p></td>';
                                })).join('');
                        }).join('');
                    } else {
                        bodyStr = bodyData.map(function (itemData, j) {
                            return (groupFields.length > 0 ? '<tr><th class="total-title" colspan="' + mainColumn.length + '">' + itemData.name + '</th></tr>' : '') + that.cutArr(mainColumn.map(function (item, i) {
                                    return '<td><span class="td-container">' + itemData.value[that.getDateIndex(that.options.date)][i] + '</span><p>' + item.value + '</p></td>';
                                })).join('');
                        }).join('');
                    }
                    break;
                case 'normal':
                    if (groupFields.length > 0) {
                        bodyStr = bodyData.map(function (item, i) {
                            return '<tr>' + '<th>' + item.name + '</th><td>' + item.value[that.getDateIndex(that.options.date)] + '</td></tr>';
                        }).join('');
                    } else {
                        bodyStr = this.options.gridData.date.map(function (item, i) {
                            return '<tr>' + '<th>' + item + '</th><td>' + bodyData[0].value[i] + '</td></tr>';
                        }).join('');
                    }
                    break;
            }
            tbody.html(bodyStr);
            return tbody;
        },
        //创建合计表格
        createTotal: function () {
            var table = $('<table class="table-total-style"></table>'),
                tbody = $('<tbody></tbody>'), bodyStr, that = this,
                groupFields = this.options.gridData.groupFields,
                bodyData = that.options.gridData.totalData,
                mainColumn = this.options.gridData.mainColumn;
            switch (this.gridType) {
                case 'multiDimension':
                    bodyStr = bodyData.map(function (itemData, j) {
                        return (groupFields.length > 0 ? '<tr><th class="total-title" colspan="' + mainColumn.length + '">' + itemData.name + '</th></tr>' : '') + that.cutArr(mainColumn.map(function (item, i) {
                                return '<td><span class="td-container">' + itemData.value[i] + '</span><p>' + item.value + '</p></td>'
                            })).join('');
                    }).join('');
                    break;
                case 'normal':
                    bodyStr = that.cutArr(bodyData.map(function (item, i) {
                        return '<td><span class="td-container">' + item.value[0] + '</span><p>' + (!item.name ? that.options.gridData.mainColumn[0].value : item.name) + '</p></td>';
                    })).join('');
                    break;
            }
            tbody.html(bodyStr);
            table.append(tbody);
            $(this.options.root).html('').append(table);
        },
        //格式化main-body下的td
        tdFormat: function () {
            var that = this;
            if (this.options.tdFormat) {
                $('.main-body td').each(function () {
                    that.options.tdFormat(this);
                });
            }
        },
        //切割td数组，每两个放在一个tr中
        cutArr: function (tdArr) {
            var arr = [], tdStr = '';
            for (var i = 0; i < tdArr.length; i++) {
                tdStr += tdArr[i];
                if (i % 2 !== 0 && i !== 0) {
                    arr.push('<tr>' + tdStr + '</tr>');
                    tdStr = '';
                }
            }
            tdStr && arr.push('<tr>' + tdStr + '<td></td></tr>');
            return arr;
        },
        //获取日期在表格数据gridData中的索引(日期和对应的数据索引是一样的)
        getDateIndex: function (dateStr) {
            var index;
            if (dateStr) {
                this.options.gridData.date.some(function (item, i) {
                    if (item.indexOf(dateStr) !== -1) {
                        index = i;
                    }
                });
            } else {
                index = this.options.gridData.date.length - 1;
            }
            return index;
        }
    });
    // 静态成员
    $.extend(Grid, {
        create: function (opts) {
            return new Grid().init(opts);
        },
        /*{
         * root:dom对像,
         * gridData[{
         *  mainColumn: {name:英文名称,value:中文}mainColumn length大于1时，mainColumn做为列头
         *  date:[]日期
         *  bodyData:[{name:'北京',value:[[1,2],[3,5]]}]
         *  totalData:[]合计
         *  }]
         * tdFormat:function(sel){}
         */
        init: function (ops) {
            Grid.create(ops);
        }
    });
  
    return Grid;
});