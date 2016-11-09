'use strict';

var React = require('react');

var Component = React.createClass({
    getInitialState: function() {
        return {
            show: false
        }
    },
    goTop: function() {
        window.scrollTo(0, 0);
    },
    componentDidMount: function() {
        var view = this;
        var toggle = function() {
            if($(window).scrollTop() > 100) {
                view.setState({
                    show: true
                });
            } else {
                view.setState({
                    show: false
                });
            }
        };
        $(window).on('scroll.goTop', toggle);
        toggle();
    },
    componentWillUnmount: function() {
        $(window).off('scroll.goTop');
    },
    render: function() {
        var state = this.state;

        return (
<div className="w_float" onClick={this.goTop} style={{display: state.show ? '': 'none'}} >
    <img src="http://res1.kezhanwang.cn/static/mh5/images/news_float.png" />
</div>
        )
    }
});

module.exports = Component;