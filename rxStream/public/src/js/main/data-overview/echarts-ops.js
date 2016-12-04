/**
 * Created by fisher on 2015-12-7.
 */
define([
    ],
    function () {
        var defaultColor = ['#73a9dc', '#62dccf', '#f6c755', '#c090ec', '#fd8eab'];
        var defaultOps = {
            line: {       //line
                color: defaultColor,
                title: {
                    text: '',
                    subtext: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    bottom: '3%',
                    top: '3%',
                    data: []
                },
                grid: {
                    left: 20,
                    right: 40,
                    bottom: 40,
                    top: '15%',
                    containLabel: true
                },
                calculable: false,
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: []
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }
                ],
                series: [
                    {
                        name: '',
                        type: 'line',
                        symbol: 'circle',
                        symbolSize: 6,
                        data: []
                        /*markLine: {
                         data: [
                         {type: 'average', name: '平均值'}
                         ]
                         }*/
                    }
                ]
            },
            bar: {            //柱
                color: defaultColor,
                title: {
                    text: '',
                    subtext: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    bottom: '3%',
                    top: '3%',
                    itemWidth: 18,
                    data: []
                },
                grid: {
                    left: 20,
                    right: 40,
                    bottom: 40,
                    top: '15%',
                    containLabel: true
                },
                calculable: false,
                xAxis: [
                    {
                        type: 'category',
                        data: []
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }
                ],
                series: [
                    {
                        name: '',
                        type: 'bar',
                        stack: null,
                        data: []
                        /*markLine: {
                         data: [
                         {type: 'average', name: '平均值'}
                         ]
                         }*/
                    }
                ]
            },
            funnel: {       //漏斗
                color: defaultColor,
                title: {
                    text: '',          //主标题
                    subtext: ''        //副标题
                },
                tooltip: {
                    trigger: 'item',   //触发类型
                    formatter: "{a} <br/>{b} : {c}%" //a（系列名称）b（类目值）c（数值）
                },
                legend: {
                    y: 20,
                    data: []
                },
                calculable: false, //是否允许拖拽计算
                series: [
                    {
                        name: '',
                        type: 'funnel',
                        top: 100,
                        max: 100,
                        itemStyle: {
                            normal: {
                                borderColor: '#888',
                                borderWidth: 1
                            }
                        },
                        data: [] //{value:60, name:'访问'},
                    }
                ]
            },
            pie: {             //饼
                color: defaultColor,
                title: {
                    text: '',
                    subtext: ''
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    y: 20,
                    data: []
                },
                calculable: false,
                series: [
                    {
                        name: '',
                        type: 'pie',
                        radius: '50%',
                        center: ['50%', '55%'],
                        data: [] //{value:335, name:'直接访问'},
                    }
                ]
            },
            radar: {
                color: defaultColor,
                title: {
                    text: ''
                },
                tooltip: {},
                legend: {
                    bottom: '3%',
                    top: '3%',
                    itemWidth: 18,
                    data: []
                },
                radar: {
                    // shape: 'circle',
                    indicator: []
                },
                series: [{
                    name: '',
                    type: 'radar',
                    // areaStyle: {normal: {}},
                    data: []
                }]
            },
            map: {
                title: {
                    'text': '',
                    'subtext': ''
                },
                toolbox: {
                    show: true,
                    orient: 'horizontal', // 布局方式，默认为水平布局，可选为：
                    // 'horizontal' ¦ 'vertical'
                    x: 'right', // 水平安放位置，默认为全图右对齐，可选为：
                    // 'center' ¦ 'left' ¦ 'right'
                    // ¦ {number}（x坐标，单位px）
                    y: 'top', // 垂直安放位置，默认为全图顶端，可选为：
                    // 'top' ¦ 'bottom' ¦ 'center'
                    // ¦ {number}（y坐标，单位px）
                    color: ['#1e90ff', '#22bb22', '#4b0082', '#d2691e'],
                    backgroundColor: 'rgba(0,0,0,0)', // 工具箱背景颜色
                    borderColor: '#ccc', // 工具箱边框颜色
                    borderWidth: 0, // 工具箱边框线宽，单位px，默认为0（无边框）
                    padding: 5, // 工具箱内边距，单位px，默认各方向内边距为5，
                    showTitle: true,
                    feature: {
                        /*mark: {
                         show: true,
                         title: {
                         mark: '辅助线-开关',
                         markUndo: '辅助线-删除',
                         markClear: '辅助线-清空'
                         },
                         lineStyle: {
                         width: 1,
                         color: '#1e90ff',
                         type: 'dashed'
                         }
                         },*/
                        /*dataZoom: {
                         show: true,
                         title: {
                         dataZoom: '区域缩放',
                         dataZoomReset: '区域缩放-后退'
                         }
                         },*/
                        /*magicType: {
                         show: true,
                         title: {
                         line: '折线图',
                         bar: '柱形图',
                         stack: '堆积',
                         tiled: '平铺',
                         pie: '饼图'
                         },
                         type: ['line', 'bar', 'stack', 'tiled', 'pie']
                         },*/
                        /*saveAsImage: {
                         show: true,
                         title: '保存为图片',
                         type: 'jpeg',
                         lang: ['点击本地保存']
                         },*/
                        /*myTool: {
                         show: true,
                         title: '饼图',
                         icon: 'image://../../../img/main/piechart.png',
                         onclick: function(opts) {
                         //var target=arguments.callee.caller.arguments[0].target;
                         //this._iconDisable(this._iconShapeMap['myTool']);
                         }
                         }*/
                        /*,restore: {
                         show: true,
                         title: '还原',
                         color: 'black'
                         }*/
                    }
                },
                tooltip: {
                    'trigger': 'item'
                },
                legend: {},
                dataRange: {
                    min: 0,
                    max: 53000,
                    text: ['高', '低'],
                    calculable: true,
                    x: 'left',
                    color: ['orangered', 'yellow', 'lightskyblue']
                },
                series: [{
                    'name': '',
                    'type': 'map'
                }]
            }
        };
        var bac = [
            "rgba(115,169,220,0.7)",
            "rgba(98,220,207,0.7)",
            "rgba(246,199,85,0.7)",
            "rgba(221,134,104,0.7)",
            "rgba(253,142,171,0.7)",
            "rgba(115,169,220,0.7)",
            "rgba(98,220,207,0.7)",
            "rgba(246,199,85,0.7)",
            "rgba(221,134,104,0.7)",
            "rgba(253,142,171,0.7)"
        ];

        /**
         * ops{type:pie,xAxis:[],series[{name:'',data:[]}],legend:[],formatter:''}
         * opsTwo 对比数据
         */
        function parseOps(ops, opsTwo) {
            var newOps = $.extend(true, {}, defaultOps[ops.type]), defaultSeries = $.extend(true, {}, defaultOps[ops.type].series[0]);
            var series = ops.series.filter(function (item) {
                return item.checked;
            });
            ops.barStack = ops.barStack || false;
            if (ops.type === 'line' || ops.type === 'bar') {
                newOps.xAxis[0].data = ops.xAxis;
                newOps.yAxis[0].axisLabel.formatter += ops.formatter || '';
            }
            newOps.legend.data = ops.legend;
            ops.timeline == undefined || (newOps.timeline = ops.timeline);
            if (ops.type === 'pie') {
                newOps.legend.data.push('其它');
                newOps.series[0] = $.extend(true, {}, defaultSeries);
                for (var k = 0, le = series.length; k < le; k++) {
                    var obj = {};
                    obj.name = series[k].name;
                    obj.value = series[k].data.reduce(function (a, b) {
                        return a + b;
                    });
                    newOps.series[0].data[k] = $.extend(true, {}, obj);
                }
                newOps.series[0].data.push((function () {
                    var o = {};
                    o.name = '其它';
                    o.value = (function () {
                        var total = 0;
                        ops.series.forEach(function (item) {
                            if (!item.checked) {
                                total += item.data.reduce(function (a, b) {
                                    return a + b;
                                })
                            }
                        });
                        return total;
                    })();
                    return o;
                }()));
            } else if (ops.type === 'funnel') {
                for (var m = 0, lem = series.length; m < lem; m++) {
                    var o = {};
                    o.name = series[m].name;
                    o.value = series[m].value;
                    o.peopleValue = series[m].peopleValue;
                    newOps.series[0].data[m] = $.extend(true, {}, o);
                }
            } else if (ops.type === 'radar') {
                newOps.radar.indicator = ops.radar.map(function (item, i) {
                    var max = parseInt(_.max(series.map(function (itemData) {
                        return itemData.value[i];
                    })));
                    item.max = max + Math.pow(10, max.toString().length - 1);
                    return item;
                });
                series.some(function (item) {
                    if (item.name == '全部') {
                        item.lineStyle = {normal: {type: 'dashed'}};
                    }
                });
                newOps.series[0].data = series;
            } else {
                for (var j = 0, l = series.length; j < l; j++) {
                    newOps.series[j] = $.extend(true, {}, defaultSeries);
                    series[j].type = ops.type;
                    ops.stack && (series[j].stack = ops.stack);
                    $.extend(true, newOps.series[j], series[j]);
                }
            }
            //处理对比数据
            if (opsTwo) {
                opsTwo.type = ops.type;
                var compareOps = parseOps(opsTwo);
                if (ops.type === 'line' || ops.type === 'bar') {
                    compareOps.legend.data = compareOps.legend.data.map(function (item) {
                        return item + '(比)';
                    });
                    compareOps.series = compareOps.series.map(function (item, i) {
                        item.itemStyle = {normal: {color: bac[i], lineStyle: {type: "dashed"}}};
                        delete item.symbol;
                        item.stack = 'group2';
                        item.name += '(比)';
                        return item;
                    });
                    newOps.legend.data = newOps.legend.data.concat(compareOps.legend.data);
                    newOps.series = newOps.series.concat(compareOps.series);
                    newOps.xAxis[0].data = newOps.xAxis[0].data.map(function (item, i) {
                        return item + '/' + this[i];
                    }, compareOps.xAxis[0].data);
                } else if (ops.type === 'pie' || ops.type === 'funnel') {
                    compareOps.series[0].data.forEach(function (itemData, j) {
                        itemData.itemStyle = {normal: {color: bac[j]}};
                    });
                    newOps.series = newOps.series.concat(compareOps.series).map(function (item, i) {
                        item.radius = '40%';
                        i == 0 ? item.center = ['25%', '60%'] : item.center = ['75%', '60%'];
                        return item;
                    })
                }
            }
            return newOps;
        }

        return parseOps;
    });
