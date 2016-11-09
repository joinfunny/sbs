'use strict';

var React = require('react');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            url: 'http://www.kezhanwang.cn/page/vcode',
            w: 452,
            h: 120,
            className: ''
        }
    },
    getInitialState: function() {
        return {
            link: this.getLink()
        }
    },
    getLink: function() {
        var props = this.props;
        var link = props.url + '?w=' + props.w + '&h=' + props.h + '&_r=' + Math.random()

        return link;
    },
    refresh: function() {
        this.setState({
            link: this.getLink()
        });
    },
    render: function() {
        var state = this.state;
        var props = this.props;

        return (
<img src={state.link} className={props.className} onClick={this.refresh}/>
        )
    }
});

module.exports = Component;