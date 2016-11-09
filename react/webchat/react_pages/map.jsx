'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {},
            query: {},
            getSEO: function() {
                var data = this.data;
                var name = this.data.organame;

                return {
                    title: name+'地图 - 课栈网',
                    keywords: name+'地图',
                    description: '课栈网提供'+name+'地图服务,可以通过地图更加精准的帮助学生找到学校所在地，第一时间了解'+name+',就上课栈网.'
                }
                return {};
            }
        }
    },
    renderMap: function() {
        var data = this.props.data;
        var latlng = this.props.data.latlng.split(',')
        var query = {
            lng: latlng[0],
            lat: latlng[1],
        }
        var mp = new BMap.Map(ReactDOM.findDOMNode(this.refs.map));
        var zoom = 18;
        var center = new BMap.Point(query.lng, query.lat);
        var marker = new BMap.Marker(center);

        mp.addOverlay(marker);
        mp.centerAndZoom(center, zoom);
        mp.enableScrollWheelZoom(true);
    },
    componentDidMount: function() {
        if(!window.BMap) {
            var view = this;
            var callbackName = '$async_load'+Date.now();
            window[callbackName] = function() {
                view.renderMap();
            }
            this.props.app.getScript('http://api.map.baidu.com/api?v=2.0&ak=y4AaHF9NK2h3IXC2lVc95XU9&callback='+callbackName);
        } else {
            this.renderMap();
        }
    },
    render: function() {
        return (
<div className="p_login p_full hasfixednavigation hasauth">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center pl10 pr10">
                    <div className="title">查看位置</div>
                </div>
                <div className="right"></div>
            </div>
        </div>
    </div>
    <div ref="map" className="full"></div>
</div>
        )
    }
});

module.exports = Page;