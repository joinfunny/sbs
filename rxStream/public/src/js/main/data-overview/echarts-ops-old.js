/**
 * Created by fisher on 2015-12-7.
 */
define([
    ],
    function () {
        var defaultOps = {
            line: {       //line
                title: {
                    text: '',
                    subtext: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    y: 20,
                    data: []
                },
                grid: {
                    x: 60,
                    x2: 30
                },
                calculable: true,
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
                title: {
                    text: '',
                    subtext: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    y: 20,
                    data: []
                },
                grid: {
                    x: 60,
                    x2: 30
                },
                calculable: true,
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
                        stack: '',
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
                calculable: true, //是否允许拖拽计算
                series: [
                    {
                        name: '',
                        type: 'funnel',
                        data: [] //{value:60, name:'访问'},
                    }
                ]
            },
            pie: {             //饼
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
                calculable: true,
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
            map: {
                title: {
                    'text': '',
                    'subtext': ''
                },
                tooltip: {
                    'trigger': 'item'
                },
                legend: {
                    
                },
                dataRange: {
                    min: 0,
                    max: 53000,
                    text: ['高', '低'],
                    calculable: true,
                    x: 'left',
                    color: ['orangered', 'yellow', 'lightskyblue']
                },
                series: [{
                    'name':'',
                    'type': 'map'
                }]
            }
        };

        /**
         * ops{type:pie,xAxis:[],series[{name:'',data:[]}],legend:[],formatter:''}
         */
        function parseOps(ops) {
            var newOps = $.extend(true, {}, defaultOps[ops.type]), defaultSeries = $.extend(true, {}, defaultOps[ops.type].series[0]);
            ops.barStack = ops.barStack || false;
            if (ops.type === 'line' || ops.type === 'bar') {
                newOps.xAxis[0].data = ops.xAxis;
                newOps.yAxis[0].axisLabel.formatter += ops.formatter || '';
            }
            newOps.legend.data = ops.legend;
            ops.timeline==undefined || (newOps.timeline = ops.timeline);
            for (var j = 0, l = ops.series.length; j < l; j++) {
                newOps.series[j] = $.extend(true, {}, defaultSeries);
                ops.series[j].type = ops.type;
                $.extend(true, newOps.series[j], ops.series[j]);
            }
            return newOps;
        }

        return parseOps;
    });
