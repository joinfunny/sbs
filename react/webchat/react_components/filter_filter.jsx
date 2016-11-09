'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var FilterStopScrollMixins = require('../react_mixins/filter_stopscroll.js');

var Component = React.createClass({
    mixins: [FilterStopScrollMixins],
    getDefaultProps: function() {
        return {
            isListen: '',
            onChange: () => {},
            noChange: () => {}
        }
    },
    componentDidMount: function() {
        this.stopListScroll();
    },
    noChange: function() {
        this.props.noChange(this.props.isListen);
    },
    setValue: function(sort) {
        return () => {
            this.props.onChange(sort);
        }
    },
    render: function() {
        return (
<section className="w_filter" >
    <div className="mask" onClick={this.noChange}></div>
    <ul className="flist">
        <li onClick={this.setValue('')} className={this.props.isListen == '' ? 'actived': ''} >
            全部课程
        </li>

        <li onClick={this.setValue('1')} className={this.props.isListen == '1' ? 'actived': ''}>
            试听课程
        </li>
    </ul>
</section>
        )
    }
});

module.exports = Component;