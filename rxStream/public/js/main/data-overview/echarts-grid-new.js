/**
 * Created by fisher on 2016-1-12.
 */
define([
    'main/data-overview/echarts-ops'
], function (os) {

    function Grid() {
    }

    // 原型
    Grid.prototype = _.create(EventEmitter.prototype, {
        'constructor': Grid
    });
    $.extend(Grid.prototype, {
        options: null,
        gridType: 'normal',
        totalDom: $('input[name="checkboxTotal"]')[0],
        columnCheckedDom: $('input[role="selectColumn"]:checked'),
        init: function (ops) {
            this.options = $.extend(true, {
                root: null,
                gridData: null,
                totalData: null,
                tdFormat: null,
                page: 1,
                pageSize: 50,
                filterBody: null            //可过滤body
            }, ops || {});
            this.bindHandleEvent();//console.log('init');
            //$(this.options.root).off('click').on('click', this.handleEvent);
            $(this.options.root).parents('.panel-table').off('focusout click').on('focusout click', this.handleEvent);
            var table = this.createTable();
            if (!ops.type) {
                this.gridType = ops.gridData.mainColumn.length > 1 ? 'multiDimension' : 'normal';
                this.createPage();
                table.append(this.createHeader()).append(this.createTotal()).append(this.createBody());
            } else {
                table.append(this.createHeader()).append(this.createBody());
                ops.type == 'radarGrid' && table.append(this.createFooter());
            }
            $(this.options.root).html('').append(table);
            ops.type === 'funnelGrid' && this.createFunnelNav();
            this.tdFormat();
            return this;
        },
        //创建table
        createTable: function () {
            var table;
            if (this.options.type === 'funnelGrid') {
                table = $('<table class="grid-table"></table>');
            } else {
                var type = this.gridType === 'multiDimension' && AppPage.Echarts.requestZhData.groupFields_zh.length > 0 ? 'rowsGroup' : 'columnGroup';
                table = $('<table class="grid-table" data-type="' + type + '"></table>');
            }
            return table;
        },
        //漏斗转换率头
        createFunnelNav: function () {
            var table = $('<table class="funnel-header"></table>'), data = this.options.gridData.headerData.slice(1), bodyStr;
            bodyStr = '<tr><th><div class="total-bt actived" role="showTotalTable">总览</div></th>' + data.map(function (item, i) {
                return '<th class="row-name"><div role="showStepTable" class="group-name" data-index="' + i + '">' + item + '</div></th>' + (i == data.length - 1 ? '' : '<th><div role="showStepByArrow" class="step-arrow" data-index="' + i + '">—></div></th>');
            }).join('') + '</tr>';
            table.html(bodyStr);
            $(this.options.root).prepend(table);
        },
        //漏斗转换率表格body
        createFunnelBody: function (dataIndex) {
            var data = this.options.gridData.steps[dataIndex].lines, bodyStr;
            bodyStr = data.map(function (item, i) {
                return '<tr><th>' + item.name + '</th><td>' + item.wastageUser + '</td><td>' + item.convertedUser + '</td><td>' + item.medianConvertedTime + '</td><td>' + item.conversionRate + '%</td></tr>'
            }).join('');
            return bodyStr;
        },
        //漏斗转换率表格
        createFunnelConvert: function (dataIndex) {
            var table = $('.grid-table', this.options.root), headerStr, headerData = [{
                'key': 'name',
                'value': this.options.gridData.headerData[0]
            }, {'key': 'wastageUser', 'value': '流失用户'}, {'key': 'convertedUser', 'value': '转化用户'}, {
                'key': 'medianConvertedTime',
                'value': '转化时间中位数'
            }, {'key': 'conversionRate', 'value': '转化率'}], that = this;
            headerStr = '<thead>' + headerData.map(function (item) {
                return '<th ' + (item.value && 'data-sort-type="funnelSteps" data-key="' + item.key + '" role="dataSort" data-index="' + dataIndex + '"') + '>' + item.value + '</th>';
            }).join('') + '</thead>';

            table.html(headerStr + '<tbody class="main-body">' + this.createFunnelBody(dataIndex) + '</tbody>');
        },
        //创建header
        createHeader: function () {
            var thead = $('<thead></thead>'), headerStr;
            if (this.options.type === 'funnelGrid') {
                var funnelHeaderData = this.options.gridData.headerData;
                headerStr = '<tr>' + funnelHeaderData.map(function (item, i) {
                    return '<th' + (item ? ' role="dataSort" ' + (i === 0 ? 'data-sort-type="funnelName"' : 'data-sort-type="funnelData" data-index="' + (i - 1) + '"') : '') + '>' + item + '</th>';
                }).join('') + '</tr>';
            } else if (this.options.type === 'retainedGrid') {
                var retainedHeaderData = this.options.gridData.headerData,
                    requestZhData = this.options.gridData.requestZhData;
                headerStr = '<tr><th>' + (requestZhData.groupField_zh ? requestZhData.groupField_zh : '日期') + '</th><th>总人数</th>' + retainedHeaderData.map(function (item, i) {
                    return '<th>' + item + '</th>';
                }).join('') + '</tr>';
            } else if (this.options.type === 'revisitGrid') {
                var revisitHeader = this.options.gridData.bodyData, that = this,
                    request = this.options.gridData.requestZhData;
                headerStr = '<tr><th>' + (request.groupField_zh ? request.groupField_zh : '日期') + '</th><th>总人数</th>' + revisitHeader[0].cells.map(function (item, i) {
                    return '<th>' + (i + 2) + that.options.gridData.unitText + '</th>';
                }).join('') + '</tr>';
            } else if (this.options.type === 'radarGrid') {
                var radarHeader = this.options.gridData.headerData;
                headerStr = '<tr><th>用户行为</th>' + radarHeader.map(function (item, i) {
                    return '<th><label class="sa-checkbox" data-name="' + item + '"><input type="checkbox" role="selectColumn" data-name="' + item + '" ' + (i > 2 ? '' : 'checked="checked"') + '>' + item + '</label></th>';
                }).join('') + '</tr>';
            } else {
                var headerData = this.options.gridData.bodyData,
                    headerDataTwo = this.options.gridData.mainColumn;
                switch (this.gridType) {
                    case 'multiDimension':
                        headerStr = '<tr><th class="sort-up" data-sort-type="date" role="dataSort">日期</th>' + (AppPage.Echarts.requestZhData.groupFields_zh.length > 0 ? '<th data-sort-type="group" role="dataSort">' + AppPage.Echarts.requestZhData.groupFields_zh.join(',') + '</th>' : '') + headerDataTwo.map(function (item, i) {
                            return '<th data-sort-type="actions" data-index="' + i + '" role="dataSort">' + item.value + '</th>';
                        }).join('') + '</tr>';
                        break;
                    case 'normal':
                        headerStr = '<tr><th class="sort-up" data-sort-type="date" role="dataSort">日期</th>' + headerData.map(function (item, i) {
                            return '<th><label class="sa-checkbox" data-name="' + item.name + '"><input type="checkbox" role="selectColumn" data-name="' + (item.name ? item.name : headerDataTwo[0].value) + '" ' + (i > 2 ? '' : 'checked="checked"') + '>' + (item.name ? item.name : headerDataTwo[0].value) + '</label></th>';
                        }).join('') + '</tr>';
                        break;
                }
            }
            thead.html(headerStr);
            return thead;
        },
        //创建body
        createBody: function () {
            var tbody = $('.main-body', this.options.root), bodyStr = '', that = this;
            if (!tbody.length) {
                tbody = $('<tbody class="main-body"></tbody>');
            }
            if (this.options.type === 'funnelGrid') {
                var funnelBody = this.options.gridData.bodyData;
                bodyStr = funnelBody.map(function (item, i) {
                    return '<tr><th>' + item.name + '</th>' + item.value.map(function (itemData) {
                            return '<td>' + (itemData[0] + '(' + itemData[1] + '%)') + '</td>';
                        }).join('') + '</tr>';
                }).join('');
            } else if (this.options.type === 'retainedGrid') {
                var retainedBody = this.options.gridData.bodyData;
                bodyStr = retainedBody.map(function (item, i) {
                    return '<tr><th>' + (item.groupValue || '未知') + '</th><th>' + item.totalPeople + '</th>' + item.cells.map(function (itemData) {
                            return '<td><p>' + itemData.people + '</p><p class="percentage" data-value="' + itemData.percent + '">' + itemData.percent + '%</p></td>';
                        }).join('') + '</tr>';
                }).join('');
            } else if (this.options.type === 'revisitGrid') {
                var revisitBody = this.options.gridData.bodyData;
                bodyStr = revisitBody.map(function (item, i) {
                    return '<tr><th>' + (item.groupValue || '未知') + '</th><th>' + item.totalPeople + '</th>' + item.cells.map(function (itemData) {
                            return '<td><p>' + itemData.people + '</p><p class="percentage" data-value="' + itemData.percent + '">' + itemData.percent + '%</p></td>';
                        }).join('') + '</tr>';
                }).join('');
            } else if (this.options.type === 'radarGrid') {
                var radarBody = this.options.gridData.bodyData,
                    group = this.options.gridData.headerData,
                    cloum = this.options.gridData.columHeader;
                bodyStr = cloum.map(function (item, i) {
                    return '<tr><th>' + item + '</th>' + radarBody.map(function (itemData, j) {
                            return '<td><p>' + itemData.values[i].num + '</p>' + (group.length > 1 && j > 0 ? ('<p class="percentage">' + itemData.values[i].percent + '%</p>') : '') + '<p class="score" data-value="' + itemData.values[i].score + '">得分:' + itemData.values[i].score + '</p></td>';
                        }).join('') + '</tr>';
                }).join('');
            } else {
                var timer = 0,
                    bodyData = this.options.filterBody ? this.options.gridData.bodyData.filter(function (item) {
                        return that.options.filterBody.some(function (itemData) {
                            return item.name.indexOf(itemData) >= 0;
                        });
                    }) : this.options.gridData.bodyData;
                switch (this.gridType) {
                    case 'multiDimension':
                        var rows = (this.options.page - 1) * this.options.pageSize, //每页开始的tr数
                            dIndex = this.options.page === 1 ? 0 : parseInt(rows / bodyData.length), //日期循环开始的值
                            bIndex = this.options.page === 1 ? 0 : parseInt(rows % bodyData.length), //日期内循环起始的条目数
                            l = dIndex + Math.ceil((this.options.pageSize - bIndex) / bodyData.length) + (dIndex == 0 ? 0 : 1); //外部日期需要循环几次
                        l > this.options.gridData.date.length && (l = this.options.gridData.date.length);
                        l == 0 && (l = 1);
                        for (var k = dIndex; k < l; k++) {
                            bodyStr += bodyData.map(function (itemData, j) {
                                if (j >= bIndex && timer < that.options.pageSize) {
                                    timer++;
                                    return '<tr>' + (j == 0 || j == bIndex ? '<th class="date-time" rowspan="' + (bodyData.length - bIndex) + '">' + that.options.gridData.date[k] + '</th>' : '') + (itemData.name ? '<td>' + itemData.name + '</td>' : '') + itemData.value[k].map(function (itemD, m) {
                                            return '<td data-value="' + itemD + '" data-before="' + (itemData.value[k - 1] ? itemData.value[k - 1][m] : 'none') + '"><p>' + itemD + '</p></td>';
                                        }).join('') + '</tr>';
                                }
                            }).join('');
                            bIndex = 0;
                        }
                        break;
                    case 'normal':
                        var dateIndex = (that.options.page - 1) * that.options.pageSize,
                            len = that.options.page * that.options.pageSize;
                        len > this.totalCount && (len = this.totalCount);
                        for (; dateIndex < len; dateIndex++) {
                            bodyStr += '<tr>' + '<th>' + this.options.gridData.date[dateIndex] + '</th>' + bodyData.map(function (itemData) {
                                return '<td data-value="' + itemData.value[dateIndex][0] + '" data-before="' + (itemData.value[dateIndex - 1] ? itemData.value[dateIndex - 1][0] : 'none') + '"><p>' + itemData.value[dateIndex][0] + '</p></td>';
                            }).join('') + '</tr>';
                        }
                        break;
                }
            }
            tbody.html(bodyStr);
            return tbody;
        },
        //创建表尾
        createFooter: function () {
            var footer = $('.main-footer', this.options.root), footerStr = '', that = this;
            if (!footer.length) {
                footer = $('<tfoot class="main-footer"></tfoot>');
            }
            var radarBody = this.options.gridData.bodyData;
            footerStr = '<tr><th>平均得分</th>' + radarBody.map(function (itemData) {
                return '<td>' + itemData.averageScore + '</td>';
            }).join('') + '</tr>';
            footer.html(footerStr);
            return footer;
        },
        createTotal: function () {
            var that = this, totalDom = $('.total', this.options.root), bodyStr,
                bodyData = that.options.filterBody ? that.options.gridData.totalData.filter(function (item) {
                    return that.options.filterBody.some(function (itemData) {
                        return item.name.indexOf(itemData) >= 0;
                    });
                }) : that.options.gridData.totalData;
            if (!totalDom.length) {
                totalDom = $('<tbody class="total"></tbody>');
            }
            switch (that.gridType) {
                case 'multiDimension':
                    bodyStr = bodyData.map(function (itemData, j) {
                        return '<tr>' + (j == 0 ? '<th class="total-name" rowspan="' + bodyData.length + '">合计</th>' : '') + (itemData.name ? '<td>' + itemData.name + '</td>' : '') + itemData.value.map(function (itemD, k) {
                                return '<td><p>' + itemD + '</p></td>';
                            }).join('') + '</tr>';
                    }).join('');
                    break;
                case 'normal':
                    bodyStr = '<tr><th>合计</th>' + bodyData.map(function (itemData) {
                        return '<td>' + itemData.value[0] + '</td>';
                    }).join('') + '</tr>';
            }
            $(that.totalDom).prop('checked') ? totalDom.show() : totalDom.hide();
            totalDom.html(bodyStr);
            return totalDom;
        },
        // 处理事件路由
        handleEvent: function (e) {
            switch (e.type) {
                case 'click':
                    this.click(e);
                    break;
                case 'focusout':
                    this.focusOut(e);
                    break;
                default:
            }
        },
        focusOut: function (e) {
            var target = e.target,
                role = target.getAttribute('role');
            switch (role) {
                case 'goPageNumber':
                    this.goPageNumber(e);
                    break;
                default:
            }
        },
        click: function (e) {
            var target = e.target,
                role = target.getAttribute('role');
            switch (role) {
                case 'selectColumn': //selectColumn
                    this.selectColumn(e);
                    break;
                case 'prePage':
                    this.prePage(e);
                    break;
                case 'nextPage':
                    this.nextPage(e);
                    break;
                case 'pageNumber':
                    this.pageNumber(e);
                    break;
                case 'dataSort':
                    this.dataSort(e);
                    break;
                case 'showTotalTable':
                    this.showTotalTable(e);
                    break;
                case 'showStepTable':
                    this.showStepTable(e);
                    break;
                case 'showStepByArrow':
                    this.showStepTable(e);
                    break;
                default:
            }
        },
        //漏斗表格和转化率切换
        showTotalTable: function (e) {
            var target = e.target;
            if (!$(target).hasClass('actived')) {
                $(target).addClass('actived').parent().siblings().find('div').removeClass('actived');
                var table = $('.grid-table', this.options.root);
                table.html('').append(this.createHeader()).append(this.createBody());
            }
        },
        showStepTable: function (e) {
            var target = e.target, index = $(target).data('index');
            if (!$(target).hasClass('actived') || $(target).hasClass('group-name')) {
                $(target).addClass('actived').parent().siblings().find('div').removeClass('actived');
                var next = $(target).parent().next(),
                    prev = $(target).parent().prev();
                if ($(target).hasClass('group-name')) {
                    if (next.length) {
                        next.find('div').addClass('actived');
                        next.next().find('div').addClass('actived');
                        this.createFunnelConvert(index);
                    } else {
                        prev.find('div').addClass('actived');
                        prev.prev().find('div').addClass('actived');
                        this.createFunnelConvert(index - 1);
                    }
                } else {
                    next.find('div').addClass('actived');
                    prev.find('div').addClass('actived');
                    this.createFunnelConvert(index);
                }
            }

        },
        //表格排序
        dataSort: function (e) {
            var target = e.target,
                gridData = this.options.gridData,
                hasGroup,
                hasTwo,
                sortType = $(target).attr('data-sort-type');
            $(target).hasClass('sort-up') ? $(target).attr('class', 'sort-down') : $(target).attr('class', 'sort-up');
            var sort = $(target).attr('class');
            switch (sortType) {
                case 'date':
                    var unit = AppPage.Echarts.requestZhData.unit;
                    hasGroup = AppPage.Echarts.requestZhData.groupFields_zh.length > 0;
                    hasTwo = this.options.gridData.mainColumn.length > 1;
                    if (!hasGroup && hasTwo) {
                        $(target).siblings().removeAttr('class');
                    }
                    if (sort === 'sort-up') {
                        this.sortTwo(gridData.date, gridData.bodyData, true, 'up', unit == 'day' ? function (a) {
                            return new Date(a.split('(')[0]).getTime();
                        } : false);
                    } else {
                        this.sortTwo(gridData.date, gridData.bodyData, true, 'down', unit == 'day' ? function (a) {
                            return new Date(a.split('(')[0]).getTime();
                        } : false);
                    }
                    break;
                case 'group':
                    $(target).siblings('[data-sort-type="actions"]').removeAttr('class');
                    if (sort === 'sort-up') {
                        gridData.bodyData.sort(function (a, b) {
                            return a.name.localeCompare(b.name);
                        });
                        gridData.totalData.sort(function (a, b) {
                            return a.name.localeCompare(b.name);
                        });
                    } else {
                        gridData.bodyData.sort(function (a, b) {
                            return b.name.localeCompare(a.name);
                        });
                        gridData.totalData.sort(function (a, b) {
                            return b.name.localeCompare(a.name);
                        });
                    }
                    this.createTotal();
                    this.renderGridPage();
                    break;
                case 'actions':
                    var index = $(target).attr('data-index');
                    hasGroup = AppPage.Echarts.requestZhData.groupFields_zh.length > 0;
                    if (hasGroup) {
                        $(target).siblings('[data-sort-type="group"]').removeAttr('class');
                        $(target).siblings('[data-sort-type="actions"]').removeAttr('class');
                        if (sort === 'sort-up') {
                            gridData.bodyData.sort(function (a, b) {
                                return a['value'][0][index] - b['value'][0][index];
                            });
                            gridData.totalData.sort(function (a, b) {
                                return a['value'][index] - b['value'][index];
                            });
                        } else {
                            gridData.bodyData.sort(function (a, b) {
                                return b['value'][0][index] - a['value'][0][index];
                            });
                            gridData.totalData.sort(function (a, b) {
                                return b['value'][index] - a['value'][index];
                            });
                        }
                        this.createTotal();
                    } else {
                        $(target).siblings().removeAttr('class');
                        if (sort === 'sort-up') {
                            this.sortTwo(gridData.bodyData[0].value, gridData.date, false, 'up', function (a) {
                                return a[index];
                            });
                        } else {
                            this.sortTwo(gridData.bodyData[0].value, gridData.date, false, 'down', function (a) {
                                return a[index];
                            });
                        }
                    }
                    this.renderGridPage();
                    break;
                case 'funnelName':
                    $(target).siblings().removeAttr('class');
                    if (sort === 'sort-up') {
                        gridData.bodyData.sort(function (a, b) {
                            return a.name.localeCompare(b.name);
                        });
                    } else {
                        gridData.bodyData.sort(function (a, b) {
                            return b.name.localeCompare(a.name);
                        });
                    }
                    this.createBody();
                    break;
                case 'funnelData':
                    $(target).siblings().removeAttr('class');
                    var ind = $(target).attr('data-index');
                    if (sort === 'sort-up') {
                        gridData.bodyData.sort(function (a, b) {
                            return a['value'][ind][0] - b['value'][ind][0];
                        });
                    } else {
                        gridData.bodyData.sort(function (a, b) {
                            return b['value'][ind][0] - a['value'][ind][0];
                        });
                    }
                    this.createBody();
                    break;
                case 'funnelSteps':
                    $(target).siblings().removeAttr('class');
                    var indexData = $(target).data('index'), sortData = gridData.steps[indexData].lines, sortKey = $(target).data('key');
                    if (sort === 'sort-up') {
                        sortData.sort(function (a, b) {
                            return sortKey === 'name' ? a[sortKey].localeCompare(b[sortKey]) : a[sortKey] - b[sortKey];
                        });
                    } else {
                        sortData.sort(function (a, b) {
                            return sortKey === 'name' ? b[sortKey].localeCompare(a[sortKey]) : b[sortKey] - a[sortKey];
                        });
                    }
                    $('.main-body', this.options.root).html(this.createFunnelBody(indexData));
                    break;
            }
        },
        //arr2相对于arr1实现排序功能
        sortTwo: function (arr1, arr2, deep, type, callback) {
            var arrCompareValue = [], i = 0;
            arr1.sort(function (a, b) {
                return arrCompareValue[i++] = (type === 'up' ? (callback ? callback(a) - callback(b) : a.localeCompare(b)) : (callback ? callback(b) - callback(a) : b.localeCompare(a)));
            });
            i = 0;
            if (deep) {
                arr2.forEach(function (item) {
                    item.value.sort(function (a, b) {
                        return arrCompareValue[i++];
                    });
                    i = 0;
                });
            } else {
                arr2.sort(function (a, b) {
                    return arrCompareValue[i++];
                });
            }
            this.renderGridPage();

        },
        //分组checkbox 事件
        selectColumn: function (e) {
            var target = e.target,
                checkboxInput = 'input[role="selectColumn"]',
                dataName = target.getAttribute('data-name');
            if ($(checkboxInput + ':checked', this.root).length < 10) {
                $(checkboxInput, this.root).prop('disabled', false).parent().removeClass('disabled');
            } else {
                $(checkboxInput, this.root).not(':checked').prop('disabled', true).parent().addClass('disabled');
            }
            this.addChartData();
        },
        //向echarts添加和删除checked数据
        addChartData: function () {
            var chart = AppPage.Echarts.myChart,
                filterName = [],
                isCompare = AppPage.Echarts.isCompare;
            var options = AppPage.Echarts.responesTransformDatas[0].chartData;
            var opsTwo = isCompare ? AppPage.Echarts.responesTransformDatas[1].chartData : null;
            $('input[role="selectColumn"]:checked').each(function () {
                filterName.push($(this).attr('data-name'));
            });
            this.setChartDataChecked(filterName);
            options.type = AppPage.Echarts.currentChartType;
            options.stack = "group1";
            options = os(options, opsTwo);
            this.chartSetOptions(options);
        },
        /*
         *设置图表数据的checked属性
         * @param 选中元素名字数组
         */
        setChartDataChecked: function (param) {
            AppPage.Echarts.responesTransformDatas.forEach(function (res) {
                res && res.chartData.series.forEach(function (item) {
                    item.checked = false;
                    param.forEach(function (itemData) {
                        if (item.name === itemData || item.name === (itemData + '-1')) {
                            item.checked = true;
                        }
                    });
                });
            });
        },
        chartSetOptions: function (ops) {
            AppPage.Echarts.myChart.setOption(ops, true);
        },
        /*
         * 格式化td样式
         */
        tdFormat: function () {
            var that = this;
            if (this.options.tdFormat) {
                $('.main-body td').each(function () {
                    that.options.tdFormat(this);
                });
            }
        },
        /*
         * 创建分页
         */
        createPage: function () {
            var pageWarp = $('.page-warp'),
                that = this,
                gridData = this.options.gridData,
                bodyData = this.options.filterBody ? this.options.gridData.bodyData.filter(function (item) {
                    return that.options.filterBody.some(function (itemData) {
                        return item.name.indexOf(itemData) >= 0;
                    });
                }) : this.options.gridData.bodyData,
                totalCount = this.totalCount = this.gridType === 'multiDimension' ? gridData.date.length * bodyData.length : gridData.date.length,
                totalPage = this.totalPage = Math.ceil(totalCount / this.options.pageSize),
                pageHtml = '';
            if (!pageWarp.length) {
                pageWarp = $('<div class="page-warp"></div>');
            }
            if (totalPage > 5) {
                pageHtml = '<li class="page-input-warp">第<input role="goPageNumber" type="text" value="1">页/' + totalPage + '页 </li>';
            } else {
                for (var i = 1; i <= totalPage; i++) {
                    pageHtml += '<li role="pageNumber" data-value="' + i + '" class="page-number ' + (i == 1 ? 'actived' : '') + '">' + i + '</li>';
                }
            }
            pageWarp.html('<ul><li class="pre-page disabled" role="prePage"><</li>' + pageHtml + '<li class="next-page ' + (totalPage === 1 ? 'disabled' : '') + '" role="nextPage">></li></ul>');
            $(this.options.root).parents('.table-container').append(pageWarp);
        },
        /*
         * 上一页
         */
        prePage: function (e) {
            var target = e.target;
            if (!$(target).hasClass('disabled')) {
                $(target).removeClass('disabled');
                this.options.page--;
                this.renderGridPage();
            }
        },
        /*下一页*/
        nextPage: function (e) {
            var target = e.target;
            if (!$(target).hasClass('disabled')) {
                $(target).removeClass('disabled');
                this.options.page++;
                this.renderGridPage();
            }
        },
        /*设置当前页状态并判断上下页是否可点*/
        setCurrentActive: function () {
            var $pre = $('.pre-page'),
                $next = $('.next-page'),
                $pageNumberInput = $('input[role="goPageNumber"]');
            $('.page-number').removeClass('actived').filter('[data-value="' + this.options.page + '"]').addClass('actived');
            this.options.page > 1 ? $pre.removeClass('disabled') : $pre.addClass('disabled');
            this.options.page >= this.totalPage ? $next.addClass('disabled') : $next.removeClass('disabled');
            $pageNumberInput.length && $pageNumberInput.val(this.options.page);
        },
        /*跳到指定页*/
        pageNumber: function (e) {
            var target = e.target, value = $(target).attr('data-value');
            if (this.options.page == value) {
                return;
            }
            this.options.page = $(target).attr('data-value');
            this.renderGridPage();
        },
        goPageNumber: function (e) {
            var target = e.target, page = $.trim($(target).val());
            if (page < 1) {
                page = 1;
            } else if (page > this.totalPage) {
                page = this.totalPage;
            }
            $(target).val(page);
            this.options.page = page;
            this.renderGridPage();

        },
        renderGridPage: function () {
            this.setCurrentActive();
            this.createBody();
            this.tdFormat();
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