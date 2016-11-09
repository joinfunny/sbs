'use strict';

var React = require('react');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            show: false
        }
    },
    render: function() {
        return (
<div className="p_loading" style={{display: this.props.show ? '' : 'none'}}>
    <div className="wrapper">
        <div className="w_loading"></div>
    </div>
</div>
        )
    }
});

module.exports = Component;