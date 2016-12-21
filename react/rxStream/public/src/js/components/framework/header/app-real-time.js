'use stricts';
var React = require("react");

var AppRealTimer = React.createClass({
    getDefaultProps:function(){

    },
    getInitialState:function(){
        return {
            realTimeCount:10000
        }
    },
    render:function(){
        return (<div className="header-data-count">数据总数：<span>{this.state.realTimeCount>0?this.state.realTimeCount:'--'}</span></div>);
    }
});

module.exports = AppRealTimer;