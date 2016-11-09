'use strict';

var React = require('react');
var FooterComponent = require('../react_components/footer.jsx');
var GoTopComponent = require('../react_components/go_top.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {},
            data: {},
            query: {},
            getSEO: function() {
                var data = this.data;
                return {
                    title : '教育培训资讯_培训机构资讯 - 课栈网',
                    keywords : '教育培训资讯,培训机构资讯',
                    description : '课栈网为您提供行业内最全的课程培训信息及其机构信息,课栈网还推出课程优惠券,可以帮助您既学习感兴趣的课程又得到实惠,找课程及其培训机构就上课栈网'
                }
            }
        }
    },
    getInitialState: function() {
        return {
            list: [],
            hash: this.props.query.type,
            city: decodeURIComponent(this.props.query.cityName),
            wd: encodeURIComponent(this.props.query.wd || "")
        }
    },
    setHistory: function(e) {
        var wd = e.target.getAttribute('data-text');
        this.props.app.navigate('/'+this.state.hash+'?wd='+wd);
    },
    componentDidMount: function() {
        var view = this;
        var app = view.props.app;
        view.model = new app.Models.Search(view.props.query);
        view.setState({list: view.model.getHistory()});
        this.refs.courseInput.focus();
    },
    search: function(e) {
        if(e.keyCode == 13) {
            this.model.setHistory(this.state.wd);
            this.props.app.navigate('/'+this.state.hash+'?wd='+encodeURIComponent(this.state.wd));
        }
    },
    clearHistory: function() {
        this.model.clearHistory();
        this.setState({list:[]});
    },
    componentWillUnmount: function() {
        $(window).off('scroll.news_list');
    },
    render: function() {
        var state = this.state
        var data = this.state.list;
        var placeholder = this.state.hash == 'course'?"输入想要搜索的课程名称":"输入想要搜索的学校名称";
        return (
<div className="p_full hasfooter hasfixednavigation p_search_history">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center pl10 pr10">
                    <div className="search">
                        <div className="wrap">
                            <div className="label">
                                <b className="icon icon_magnifier"></b>
                            </div>
                            <input type="text" ref="courseInput" placeholder={placeholder} value={state.wd} onKeyDown={this.search} onChange={(e)=>{this.setState({'wd':e.currentTarget.value})}}/>
                        </div>
                    </div>
                </div>
                <a href="/" className="right ps">
                    <b className="icon icon_house vam"></b>
                </a>
            </div>
        </div>
    </div>
    {data.length == 0?(

        <div className="search_history nodata">
            暂无历史搜索记录
        </div>
    ):(
        <div className="search_history">
            <h3>历史</h3>
            <div className="bg_w history_list">
                <ul className="w_cell_list">
                    {data.map((item, key) => {
                        return(
                            <li className="w_cell" data-text={item} onClick={this.setHistory}>{item}</li>
                            )
                    })}
                </ul>
                <a href="JavaScript:;" className="btn_clear"  onClick={this.clearHistory} >清空搜索历史</a>
            </div>
        </div>
    )}
    <div className="citywrapper">
        <div className="city">
            <div className="f_left">
                当前城市:&nbsp;&nbsp;<span className="now_city">{this.state.city}</span>
            </div>
            <div className="f_right tx_r">
                选择城市:&nbsp;&nbsp;<a href="/city" className="choose_city ps">{this.state.city}</a>
            </div>
        </div>
    </div>
    <FooterComponent></FooterComponent>
</div>
        )
    }
});

module.exports = Page;