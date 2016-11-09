'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var Component = React.createClass({
    getInitialState: function() {
        return {
            opacity: 1,
            index: 0, //当前下标
            total: this.props.data.length, // 总数
            className: '',
            translateX: 0
        };
    },
    getDefaultProps: function() {
        return {
            data: []
        };
    },
    componentDidMount: function() {
        this.starTimer();
        this.slideEvent();
    },
    starTimer: function() {
        if(this.state.total <= 1) return;
        this.stopTimer();
        this.timer = setInterval(() => {
            this.changeIndex(this.state.index+1, 0.6);
        }, 4000);
    },
    next: function() {
        this.changeIndex(this.state.index+1);
    },
    prev: function() {
        this.changeIndex(this.state.index-1);
    },
    stopTimer: function() {
        clearInterval(this.timer);
    },
    slideEvent: function() {
        if(this.state.total <= 1) return;
        var el = ReactDOM.findDOMNode(this);
        var offset = $(el).offset();
        var startX = 0;

        $(el).on('touchstart', (e) => {
            var touch = e.changedTouches[0];
            startX = touch.pageX;
            this.stopTimer();
        });
        $(el).on('touchmove', (e) => {
            var touch = e.changedTouches[0];
            var diff = touch.pageX - startX;

            var percentage = diff/offset.width*100;

            this.setState({
                translateX: percentage
            });

            return false;
        });

        $(el).on('touchend touchcancel', (e) => {
            var touch = e.changedTouches[0];

            if(touch.pageX != startX) {
                this.turnBack();
                return false;
            }
        });
    },
    turnBack: function() {
        var translateX = this.state.translateX;

        if(translateX > 30) {
            this.changeIndex(this.state.index-1);
        } else if(translateX < -30) {
            this.changeIndex(this.state.index+1);
        } else {
            this.changeIndex(this.state.index);
        }
        this.starTimer();
    },
    componentWillUnmount: function() {
        // 组件卸载的时候需要清除定时器
        this.stopTimer();
    },
    changeIndex: function(index, interval) {
        var animateObj = {
            translateX: this.state.translateX
        };
        var targetTranslateX = 0;

        if(index == this.state.index) {
            targetTranslateX = 0;
        } else {
            if(index > this.state.index) {
                targetTranslateX = -100;
            } else {
                targetTranslateX = 100;
            }
        }

        kzApp.TweenLite.to(animateObj, interval || 0.3, {translateX: targetTranslateX, onUpdate: () => {
            this.setState({
                translateX: animateObj.translateX
            });
        }, onComplete: () => {
            if(index >= this.state.total) {
                index = 0;
            } else if(index < 0) {
                index = this.state.total-1;
            }
            this.setState({
                translateX: 0,
                index: index
            });
        }});

        return false;
    },
    render: function() {
        var data = this.props.data;
        var props = this.props;
        var translateX = this.state.translateX;
        var index = this.state.index;
        var total = this.state.total;
        if(total > 1) {
            var previndex = this.state.index-1;
            var nextindex = this.state.index+1;
            if(previndex < 0) {
                previndex = total - 1;
            }
            if(nextindex >= total) {
                nextindex = 0;
            }
        } else {
            var previndex = false;
            var nextindex = false;
        }
        return (
<div className={props.className}>
    <div className="wrapper">
        <ul style={{transform: `translate3d(${translateX}%, 0, 0)`}}>
            {previndex !== false ? (
            <li className="prevli">
                <a href={data[previndex].url||'javascript:void(0)'}><img src={data[previndex].pic_url} alt={data[previndex].title}/></a>
            </li>
            ) : ''}
            {data.map((item, key) => {
                return (
            <li style={{display: key == index ? 'block': 'none' }} key={key}>
                <a href={item.url||'javascript:void(0)'}><img src={item.pic_url} alt={item.title}/></a>
            </li>
                )
            })}
            {nextindex !== false ? (
            <li className="nextli">
                <a href={data[nextindex].url||'javascript:void(0)'}><img src={data[nextindex].pic_url} alt={data[nextindex].title}/></a>
            </li>
            ) : ''}
        </ul>
    </div>
    <div className="navigation">
        {data.map((item, key) => {
            var className = "";
            if(key == this.state.index){
                className = "active";
            }
            return (
<a href="#" className={className} key={key} onClick={this.changeIndex.bind(this, key)}></a>
            )

        })}
    </div>
</div>
        )
    }
});

module.exports = Component;