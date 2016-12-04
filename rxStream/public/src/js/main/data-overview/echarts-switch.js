/**
 * Created by fisher on 2015-12-9.
 */
define([
    'echarts',
    'main/data-overview/echarts-ops'
], function (ec,os) {

    function switchCharts(ops) {
        var setting = $.extend(true, {
            echarts: '',
            gridDom: false,
            type: ''
        }, ops || {});
        var chart = typeof setting.echarts === 'string' ? ec.getInstanceById(setting.echarts) : setting.echarts;
        var type = setting.type;
        var opt = chart.getOption();
        var dom = chart.getDom();
        if (type === 'line' || type === 'bar') {
            if (opt.series[0].type === 'pie') {
                var options;
                options = os({
                    type: setting.type,
                    xAxis: opt.series[0].data.map(function (data) {
                        return data.name
                    }),
                    series: [
                        {
                            name: opt.series[0].name,
                            data: opt.series[0].data.map(function (data) {
                                return data.value
                            })
                        }
                    ],
                    legend: [opt.legend[0].data]
                });
            } else {
                options = os({
                    type: setting.type,
                    xAxis: opt.xAxis[0].data,
                    series: opt.series,
                    legend: opt.legend[0].data
                });
            }
            chart.setOption(options, true);
            $(dom).parent().css('visibility', 'visible');
            setting.gridDom && setting.gridDom.parent().hide();
        } else if (type === 'grid') {
            $(dom).parent().css('visibility', 'hidden');
            setting.gridDom.parent().show();
        }
    }

    return switchCharts;
});