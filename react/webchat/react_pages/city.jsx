'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var GoBackMixins = require('../react_mixins/goback.js');
var SlidingSelect = require('../react_components/sliding_select.jsx');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            data: {}
        }
    },
    getInitialState: function() {
        var indexs = [];
        var list = [];
        var allcity = [];
        var initData = this.props.data.all;
        initData.map((item) => {
            indexs.push(item.py.toUpperCase());
            list.push({
                type: 'index',
                index: item.py.toUpperCase()
            });
            item.list.map((listItem) => {
                list.push(listItem);
                allcity.push(listItem);
            });
        })

        return {
            gps: -1,
            history: [],
            hot: this.props.data.hot || [],
            list: list,
            indexs: indexs,
            index: '',
            search: '',
            searchResult: [],
            allcity: allcity
        }
    },
    search: function(e) {
        var value = e.target.value;
        var allcity = this.state.allcity;
        var result = [];
        var wd = value.trim().toLowerCase();

        wd = wd.replace(/(\s|\')/g, '');
        allcity.map((item) => {
            if(item.name.search(wd) != -1) {
                result.push(item);
            } else if(item.initial.search(wd) != -1) {
                result.push(item);
            } else if(item.code.search(wd) != -1) {
                result.push(item);
            }
        });

        this.setState({
            search: value,
            searchResult: result
        });
    },
    selectIndex: function(index) {
        if(index == 'gps') {
            this.setState({index: '定'});
        } else if(index == 'hot') {
            this.setState({index: '热'});
        } else if(index == 'history') {
            this.setState({index: '历'});
        } else {
            this.setState({index: index});
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.setState({index: ''});
        }, 1000);

        var el = ReactDOM.findDOMNode(this);
        var grid = $(el).find('.city_list .list [data-area="'+index+'"]');
        var gOffset = grid.offset();
        var sOffset = $(el).find('.city_list .list').offset();
        var diff = gOffset.top - sOffset.top;

        diff += $(el).find('.city_list .list').scrollTop();

        $('.city_list .list').scrollTop(diff);
    },
    selectCity: function(e) {
        var target = e.currentTarget;
        var href = target.href;
        var areaid = $(target).data('areaid');
        var selectCityInfo = this.getCityByAreaId(areaid);
        if(selectCityInfo) {
            kzApp.Models.City.singleton().setHistory(selectCityInfo);
        }
        kzApp.Models.System.singleton().clearPageCache();

        if(href.indexOf('?') != -1) {
            href += '&gps=0';
        } else {
            href += '?gps=0';
        }
        location.href = href;
        e.preventDefault();
        e.stopPropagation();
    },
    getCityByAreaId: function(areaid) {
        for(var i in this.state.allcity) {
            if(this.state.allcity[i].id == areaid) {
                return this.state.allcity[i];
            }
        }

        return false;
    },
    componentDidMount: function() {
        var city = kzApp.Models.City.singleton();
        var citys = city.getHistory();

        this.setState({
            history: citys
        });

        kzApp.Models.System.singleton().getArea().then((data) => {
            if(data.byLngAndLat) {
                var result = data.byLngAndLat;

                if(result) {
                    this.setState({
                        gps: result
                    });
                } else {
                    this.setState({
                        gps: false
                    }); 
                }
            } else {
                this.setState({
                    gps: false
                });
            }
        }, () => {
            this.setState({
                gps: false
            });
        }).always(() => {
            setTimeout(() => {
                this.refs.sliding.getOffset();
            }, 100);
        });
    },
    render: function() {
        var props = this.props;
        var state = this.state;
        var history = this.state.history;
        var hot = this.state.hot;
        var list = this.state.list;
        var selectCity = this.selectCity;
        return (
<div className="p_city p_full">
    <div className="w_top_fixed no_fixed">
        <div className="centered">
            <div className="w_navigation theme_white">
                <a className="left" onClick={this.goBack} >
                    <b className="back"></b>
                </a>
                <div className="center">
                    <div className="title">选择城市</div>
                </div>
                <div className="right">
                </div>
            </div>
        </div>
        <div className="city_search">
            <div className="w_search">
                <div className="wrap">
                    <div className="label"><b className="icon icon_magnifier"></b></div>
                    <input placeholder="搜索城市" value={state.search} onChange={this.search} />
                </div>
            </div>
        </div>
    </div>

    <div className="city_list" style={{display: !state.search ? 'block' : 'none'}}>
        <div className="list">
            {state.gps ? (
            <dl className="section" data-area="gps">
                <dt>
                    定位城市
                </dt>
                <dd className="clearfix">
                    {state.gps == -1 ? (
                        <a>定位中...</a>
                    ):''}
                    {state.gps == false ? (
                        <a>定位失败</a>
                    ):''}
                    {state.gps.areaid?(
                        <a href={'/'+state.gps.code} data-areaid={state.gps.id} onClick={selectCity} >{state.gps.name}</a>
                    ):''}
                </dd>
            </dl>
            ) : ''}
            {history.length ? (
            <dl className="section" data-area="history">
                <dt>
                    历史选择
                </dt>
                <dd className="clearfix">
                    {history.length?(
                        history.map((item, key) => {
                            return <a href={'/'+item.code} data-areaid={item.id} key={key} onClick={selectCity} >{item.name}</a>;
                        })
                    ):(
                        <a>无</a>
                    )}
                </dd>
            </dl>
            ):''}
            {hot.length ? (
            <dl className="section" data-area="hot">
                <dt>
                    热门城市<b className="icon icon_fire vab ml10"></b>
                </dt>
                <dd className="clearfix">
                {hot.map((item, key) => {
                    return <a href={'/'+item.code} data-areaid={item.id} key={key} onClick={selectCity}  >{item.name}</a>;
                })}
                </dd>
            </dl>
            ) : ''}
            <ul className="citys">
                {list.map((item, key) => {
                    if(item.type == 'index') {
                        return (
                            <li key={key} className="index" data-area={item.index}>
                                {item.index}
                            </li>
                        )
                    } else {
                        return (
                            <li key={key} className="area">
                                <a href={'/'+item.code} data-areaid={item.id} onClick={selectCity}  >
                                {item.name}
                                </a>
                            </li>
                        )
                    }
                })}
            </ul>
        </div>
        <SlidingSelect ref="sliding" className="letter" onChange={this.selectIndex}>
            <span>
                {state.gps ? (
                <a data-index="gps">定位</a>
                ) : ''}
                {history.length ? (
                <a data-index="history">历史</a>
                ) : ''}
                {hot.length ? (
                <a data-index="hot">热门</a>
                ) : ''}
                {state.indexs.map((index, key) => {
                    return <a key={key} data-index={index}>{index}</a>
                })}
            </span>
        </SlidingSelect>
        <div className="tips" style={{display: state.index?'block':'none'}}>
            {state.index}
        </div>
    </div>

    <ul className="search_result no_fixed" style={{display: state.search ? 'block' : 'none'}}>
        {state.searchResult.map((item, key) => {
            return (
                <li key={key}>
                    <a href={'/'+item.code} data-areaid={item.id} onClick={selectCity}  >{item.name}</a>
                </li>
            )
    })}
    </ul>
</div>
        )
    }
});

module.exports = Page;