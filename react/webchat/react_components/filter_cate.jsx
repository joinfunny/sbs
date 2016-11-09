'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var FilterStopScrollMixins = require('../react_mixins/filter_stopscroll.js');

var Component = React.createClass({
    mixins: [FilterStopScrollMixins],
    getDefaultProps: function() {
        return {
            app: {},
            cateid: '',
            onChange: () => {},
            noChange: () => {}
        }
    },
    getInitialState: function() {
        var props = this.props;
        var cateid = props.cateid.split(',');
        var cate1id = cateid[0] || '';
        var cate2id = cateid[1] || '';
        var cate3id = cateid[2] || '';

        return {
            cate1id: cate1id,
            cate2id: cate2id,
            cate3id: cate3id,
            tabsWidth: 'auto',
            list: []
        }
    },
    noChange: function() {
        this.props.noChange(this.props.cateid);
    },
    setCate: function(e) {
        var id = $(e.currentTarget).data('id');
        if(id == this.state.cate1id) {
            this.props.onChange(id+',,');
        } else {
            this.setState({cate1id: id});
        }
    },
    componentDidMount: function() {
        this.model = this.props.app.Models.FilterCate.singleton();

        this.model.fetchData().then((data) => {
            this.setState({list: data});
            setTimeout(() => {
                this.checkScroll();
            });
        });
    },
    checkScroll: function() {
        var el = $(ReactDOM.findDOMNode(this));
        var state = this.state;

        var cateDom = el.find('[data-id="'+state.cate1id+'"]');
        var list = el.find('.tabs');
        var width = 0;

        list.find('li').each((key, el) => {
            width += $(el).width();
        });

        this.setState({tabsWidth: width});
        var diff = cateDom.offset().left - list.offset().left;
        if(diff > 0) {
            list.scrollLeft();
        }
    },
    setCate2id: function(e) {
        var state = this.state;
        var id = $(e.currentTarget).data('id');
        this.props.onChange(state.cate1id+','+id+',');
    },
    setCate3id: function(e) {
        var state = this.state;
        var id = $(e.currentTarget).data('id');
        this.props.onChange(state.cate1id+',,'+id);
    },
    render: function() {
        var state = this.state;
        var props = this.props;
        var cate = [];
        var cateList = [];
        state.list.map((item) => {
            cate.push({
                name: item.categname,
                id: item.categid
            });
            if(!state.cate1id) { // 展示全部
                item.childList.map((v) => {
                    cateList.push(v);
                });
            } else {
                if(item.categid == state.cate1id) {
                    cateList = item.childList;
                }
            }
        });

        return (
<div className="w_filter">
    <div className="mask" onClick={this.noChange}></div>
    <div className="tabs" >
    <ul style={{width: state.tabsWidth}}>
        <li className={state.cate1id == '' ? 'actived' : ''} data-id="" onClick={this.setCate} >
            <a href="javascript:void(0)" >全部</a>
        </li>
        {cate.map((item, key) => {
            return (
<li key={key} className={state.cate1id == item.id ? 'actived' : ''} data-id={item.id} onClick={this.setCate} >
    <a href="javascript:void(0)">{item.name}</a>
</li>
            )
        })}
    </ul>
    </div>
    
    <div className="flist">
        <div className="cates">
            {cateList.map((item, key) => {
                return (
<dl key={key}>
    <dt>
        <a className={state.cate2id == item.categid ? 'actived' : ''}  data-id={item.categid} onClick={this.setCate2id}>{item.categname}</a>
    </dt>
    <dd>
        {item.childList && item.childList.map((v, key) => {
            return (
                <a className={state.cate3id == v.categid ? 'actived' : ''}  key={key} data-id={v.categid} onClick={this.setCate3id}>{v.categname}</a>
            )
        })}
    </dd>
</dl>

                )
            })}
        </div>
    </div>
</div>
        )
    }
});

module.exports = Component;