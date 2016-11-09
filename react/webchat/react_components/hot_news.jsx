'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var Component = React.createClass({
    getInitialState: function() {
        var data = this.props.data;
        
        if(data.length > 1) {
            data = data.concat(data);
        }

        return {
            index: 0, //当前下标
            total: data.length, // 总数
            step: 0, //滚动一次的步长
            data: data
        };
    },
    componentDidMount: function() {
        var height = $(ReactDOM.findDOMNode(this)).find('.title a').height();
        // 获取元素高度
        this.setState({
            step: height,
        });

        this.timer = setInterval(() => {
            var index = this.state.index;
            if(index == this.state.total-1) {
                index = 0;
            } else {
                index++;
            }
            this.setState({
                index: index
            });
        }, 4000);
    },
    componentWillUnmount: function() {
        // 组件卸载的时候需要清除定时器
        clearInterval(this.timer);
    },
    render: function() {
        var data = this.state.data;

        return (
<div className="hotnews">
    <img src="http://res1.kezhanwang.cn/static/mh5/images/hotnews.jpg" />
    <div className="title">
        {data.map((item, key) => {
            var index = this.state.index;
            var opacity = 0;
            var top = 1;
            var zIndex = 0;

            if(index == 0) {
                if(key == data.length - 1) {
                    top = -1;
                    opacity = 1;
                }
            }
            if(key == index - 1) {
                top = -1;
                opacity = 1;
            } else if(key == index + 1) {
                top = 1;
            } else if(key == index) {
                top = 0;
                opacity = 1;
            }

            top = top * this.state.step;
			return (
<a key={key} style={{top:top, opacity:opacity, zIndex: zIndex}} href={'/news/'+item.newsid+'.html'} className="ps">{item.title}</a>
            )
        })}
    </div>
</div>
        )
    }
});

module.exports = Component;