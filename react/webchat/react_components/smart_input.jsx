'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            placeholder: '',
            value: '',
            className: '',
            type: 'text',
            onChange: () => {}
        }
    },
    getInitialState: function() {
        var props = this.props;
        return {
            value: props.value
        }
    },
    onKeyUp: function(e) {
        this.setState({
            value: e.target.value
        });

        this.props.onChange(e.target.value);
    },
    clearInput: function() {
        this.setState({
            value: ''
        });
        this.props.onChange('');
        var el = $(ReactDOM.findDOMNode(this));
        el.find('input').focus();
    },
    render: function() {
        var props = this.props;
        var state = this.state;

        return (
<label className={props.className}>
    <input type={props.type} placeholder={props.placeholder} onChange={this.onKeyUp} value={state.value} /><a href="javascript:void(0)" className="cancel" onClick={this.clearInput} style={{display: state.value.length ? '' : 'none'}}></a>
</label>
        )
    }
});

module.exports = Component;