'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var FilterStopScrollMixins = require('../react_mixins/filter_stopscroll.js');

var Component = React.createClass({
    mixins: [FilterStopScrollMixins],
    getDefaultProps: function() {
        return {
            sort: '',
            type: 'course',
            onChange: () => {},
            noChange: () => {}
        }
    },
    componentDidMount: function() {
        this.stopListScroll();
    },
    noChange: function() {
        this.props.noChange(this.props.sort);
    },
    setValue: function(sort) {
        return () => {
            this.props.onChange(sort);
        }
    },
    render: function() {
        var props = this.props;

        return (
<section className="w_filter" >
    <div className="mask" onClick={this.noChange}></div>
    {props.type == 'course' ? (
    <ul className="flist">
        <li onClick={this.setValue('sortscore')} className={this.props.sort == 'sortscore' ? 'actived': ''} >
            综合排名
        </li>
        <li onClick={this.setValue('commentscore-')} className={this.props.sort == 'commentscore-' ? 'actived': ''}>
            评分 从高到低
        </li>
        <li onClick={this.setValue('price')} className={this.props.sort == 'price' ? 'actived': ''}>
            价格 从低到高
        </li>
    </ul>
    ):''}
    {props.type == 'school' ? (
    <ul className="flist">
        <li onClick={this.setValue('')} className={this.props.sort == '' ? 'actived': ''} >
            综合排名
        </li>
        <li onClick={this.setValue('updatetime')} className={this.props.sort == 'updatetime' ? 'actived': ''}>
            更新时间 从高到低
        </li>
        <li onClick={this.setValue('distance-')} className={this.props.sort == 'distance-' ? 'actived': ''}>
            距离 从近到远
        </li>
    </ul>
    ):''}
</section>
        )
    }
});

module.exports = Component;