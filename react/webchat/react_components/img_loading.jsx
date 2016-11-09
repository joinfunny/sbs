'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            className: ''
        }
    },
    getInitialState: function() {
        return {
            src: '',
            loading: true,
            show: false
        }
    },
    componentDidMount: function() {
        var img = document.createElement('img');
        var loaded = () => {
            this.setState({loading: false});
            setTimeout(() => {
                this.setState({
                    show: true
                });
            }, 10);
        };

        if(!this.props.src) {
            this.setState({loading: false});
        } else {
            img.onload = () => {
                loaded();
            }
            img.src = this.props.src;
            if(img.complete) {
                loaded();
            }
        }
    },
    render: function() {
        var props = this.props;
        var state = this.state;
        var className = props.className;
        var style = {
            opacity: 1
        };

        if(!state.loading) {
            var src = this.props.src;
            if(state.show) {
                style.opacity = 1;
                className = className + ' s_trans';
            } else {
                style.opacity = 0;
            }
        } else {
            var src = 'http://res1.kezhanwang.cn/static/images/1px_transparent.gif';
            var className = className + ' w_img_loading';
        }
        return (
<img className={className} src={src} style={style}/>
        )
    }
});

module.exports = Component;