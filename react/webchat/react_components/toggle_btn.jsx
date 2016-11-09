'use strict';

var React = require('react');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            onClick: function() {},
            text: '提交'
        }
    },
    getInitialState: function() {
        return {
            pending: false
        }
    },
    toggle: function() {
        if(!this.state.pending) {
            this.setState({
                pending: true
            });

            setTimeout(() => {
                this.props.onClick();
            }, 500);
        }
    },
    reset: function() {
        this.setState({
            pending: false
        });
    },
    render: function() {
        var className = "w_toggle_btn";
        if(this.props.className) {
            className += ' ' + this.props.className;
        }
        if(this.state.pending) {
            className += ' actived';
        }
        return (
<a href="javascript:void(0)" className={className} onClick={this.toggle}>
    <span>{this.props.text}</span>
    <b>
        <div className="w_loading"></div>
    </b>
</a>
        )
    }
});

module.exports = Component;