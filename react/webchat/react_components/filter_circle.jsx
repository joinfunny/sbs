'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var SlidingSelect = require('./sliding_select.jsx');
var FilterStopScrollMixins = require('../react_mixins/filter_stopscroll.js');

var Component = React.createClass({
    mixins: [FilterStopScrollMixins],
    getDefaultProps: function() {
        return {
            app: {},
            areaid: '',
            onChange: () => {},
            noChange: () => {}
        }
    },
    getInitialState: function() {
        return {
            list: []
        }
    },
    setValue: function(sort) {
        return () => {
            this.props.onChange(sort);
        }
    },
    noChange: function() {
        this.props.noChange(this.props.areaid);
    },
    slidingSelectChange: function(index) {
        var el = ReactDOM.findDOMNode(this);
        var grid = $(el).find('.flist [data-index="'+index+'"]');
        var gOffset = grid.offset();
        var sOffset = $(el).find('.flist').offset();
        var diff = gOffset.top - sOffset.top;

        diff += $(el).find('.flist').scrollTop();

        $('.flist').scrollTop(diff);
    },
    componentDidMount: function() {
        var app = this.props.app;
        var letterOffset = [];

        this.model = app.Models.FilterCircle.singleton();
        this.model.fetchData().then((data) => {
            this.setState({list: data});
        }).fail(() => {
            this.setValue('');
        });
    },
    render: function() {
        var props = this.props;
        var list = [];
        var words = [];

        // 格式化成一个数组
        this.state.list.map((item) => {
            words.push(item.index);

            list.push({
                index: item.index
            });

            item.data.map((d) => {
                list.push(d);
            });
        });
        // 全部按钮高亮
        var allClassName = props.areaid == '' ? 'actived' : '';

        return (
<div className="w_filter">
    <div className="mask" onClick={this.noChange}></div>
    <div className="flist">
        <div className="scroll">
            <ul>
<li className={allClassName} onClick={this.setValue('')} >
    全部
</li>
                {list.map((item, key) => {
                    if(item.index) {
                        return (
<li key={key} data-index={item.index} className="grid">{item.index}</li>
                        )
                    } else {
                        var className = props.areaid == item.streetid ? 'actived' : '';
                        return (
<li key={key} className={className} onClick={this.setValue(item.streetid)}>{item.street}</li>
                        )
                    }
                })}
            </ul>
        </div>
    </div>
    {words.length ? (
    <SlidingSelect className="index" onChange={this.slidingSelectChange}>
        <div className="letter">
            <span>
                {words.map((letter, key) => {
                    return (
                    <a key={key} data-index={letter} >{letter}</a>
                    )
                })}
            </span>
        </div>
    </SlidingSelect>
    ) : ''}
</div>
        )
    }
});


module.exports = Component;