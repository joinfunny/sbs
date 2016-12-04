// 
define([
], function () {

    function transformData(data, requestZhData, requestData) {
        if (!data) {
            return {
                chartData: null,
                gridData: null
            };
        }
        var ops = {}, gridData = {}, sData = data.sequences, series = [], legend = [], dateReg = /^\d{4}-\d{1,2}-\d{1,2}$/, isDate = true, actions = requestZhData.actions, unit = [], byUnit = requestZhData.unit, dayStr = ['日', '一', '二', '三', '四', '五', '六'];
        data.groupFields = requestData.groupFields;

//		var hash = {'event.lgst_fee':'元','event.order_money':'元','event.paid_fee':'元','user.sex':['男', '女', '其它']};
//		// 只需一次循环
//        data.lines.forEach(function (line) {
//            line.groupValues.map(function (group_value, i, theArr) {
//				var groupField = this[i], hashValue;
//				//null 替换 未知
//				if(group_value === null){
//                	theArr[i] = group_value = '未知';
//				}
//				else if(hashValue = hash[groupField]){
//					theArr[i] = hashValue === '元' ? (group_value + '元') : hashValue[group_value];
//				}
//            }, this);
//        }, data.groupFields);
        //格式化X轴
        switch (byUnit) {
            case 'week':
                sData = sData.map(function (item) {
                    return item.replace(/^\d{4}-/, "") + '当周'
                });
                break;
            case 'day':
                sData = sData.map(function (item) {
                    return item.replace(/^\d{4}-/, "");
                });
                break;
            case 'month':
                sData = sData.map(function (item) {
                    return new Date(item).getMonth() + 1 + '月';
                });
                break;
            case 'hour':
                sData = sData.map(function (item) {
                    return item.replace(/^\d{4}-/, "").replace(/:\d{2}$/, "");
                });
                break;
        }
        //null 替换 未知
        data.lines.forEach(function (item) {
            item.groupValues = item.groupValues.map(function (itemData) {
                return !itemData.trim() ? '未知' : itemData;
            });
        });
        //加单位
        data.groupFields.forEach(function (itemData, i) {
            var obj = {};
            if (itemData === 'b_lgst_fee' || itemData === 'b_order_money' || itemData === 'b_paid_fee') {
                obj.unit = function (money) {
                    return money + '元';
                };
                obj.index = i;
            } else if (itemData === 'u_sex') {
                obj.unit = function (type) {
                    switch (type) {
                        case '0':
                            return '男';
                            break;
                        case '1':
                            return '女';
                            break;
                        case '2':
                            return '其它';
                            break;
                    }
                };
                obj.index = i;
            }
            obj.hasOwnProperty('unit') && unit.push(obj);
        });
        unit.length > 0 && data.lines.forEach(function (item) {
            unit.forEach(function (itemD) {
                item.groupValues[itemD.index] = itemD.unit(item.groupValues[itemD.index]);
            });
        });

        ops.xAxis = sData;
        gridData.date = byUnit === 'day' ? data.sequences.map(function (item) {
            return item + '(' + dayStr[new Date(item).getDay()] + ')';
        }) : sData;
        gridData.bodyData = data.lines.map(function (item) {
            var obj = {};
            obj.name = item.groupValues.join(',');
            obj.value = item.values;
            return obj;
        });
        /*ops.xAxis.forEach(function (item) {
         if (!item.match(dateReg)) {
         isDate = false;
         return false;
         }
         });*/
        //图表数据
        ops.series = data.lines.map(function (item, i) {
            var obj = {};
            i < 3 ? obj.checked = true : obj.checked = false;
            obj.name = item.groupValues.length > 0 ? item.groupValues.join(',') : actions[0].actionName_zh + (actions[0].field_zh || '') + actions[0].operation_zh + (requestData.isCompare ? data.sequences[0] + '至' + data.sequences[data.sequences.length - 1] : '');
            legend.push(obj.name);
            obj.data = item.values.map(function (itemData) {
                return itemData[0];
            });
            return obj;
        });
        ops.legend = legend;
        //多维度表格头数据
        gridData.mainColumn = actions.map(function (item) {
            var obj = {};
            obj.name = item.actionName;
            obj.value = item.actionName_zh + (item.field_zh || '') + item.operation_zh;
            return obj
        });
        //表格合计计算
        gridData.totalData = data.lines.map(function (item, i) {
            var obj = {};
            obj.name = item.groupValues.join(',');
            obj.value = item.totalValues[0];
            /*obj.value = item.values[0].map(function (itemData, j) {
             var value = 0;
             item.values.forEach(function (itemD) {
             value += itemD[j].toFixed(2) * 100;
             });
             return parseFloat((value / 100).toFixed(2));
             });*/
            return obj;
        });
        gridData.groupFields = data.groupFields;
        return {
            chartData: ops,
            gridData: gridData
        };
    }

    return transformData;

});