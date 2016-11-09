'use strict';

var React = require('react');
var GoBackMixins = require('../react_mixins/goback.js');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var FooterComponent = require('../react_components/footer.jsx');
var LoadingImg = require('../react_components/img_loading.jsx');
var StarsComponent = require('../react_components/stars.jsx');
var GoTopComponent = require('../react_components/go_top.jsx');
var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {},
            query: {},
            data: {},
            cookie: ''
        }
    },
    getInitialState: function() {
        var props = this.props;
        var query = this.props.query;
        var data = this.props.data;

        return {
            list: this.props.data.result || [],
            pending: false,
            reload: false,
            query: query
        }
    },
    viewBeActive: function(query) {
        this.setState({
            query: query,
            reload: true,
            list: []
        });

        setTimeout(() => {
            this.fetchMore();
        });
    },
    componentDidMount: function() {
        var component = this;
        var app = this.props.app;
    },
    componentWillUnmount: function() {
        $(window).off('scroll.course_search');
    },
    fetchMore: function() {
        var props = this.props;
        var state = this.state;
        var query = this.state.query;
        var view = this;

    },
    render: function() {
        var view = this;
        var query = this.state.query;
        var list = this.props.data.loan_list;
        var state = this.state;
        var props = this.props;
        var cityJpy = props.data.userArea ? '/' + props.data.userArea.jpy : '';
        var more = '';
        var arrData = [];
        var no_couse = (
            <li className="tx_c no_more">
                <div><img src="http://res1.kezhanwang.cn/static/mh5/images/myloan_0263a3.png" /></div>
                <p>暂时还没有分期</p>
            </li>
        );
        return (

<div className={list.length ? "p_uc hasfooter p_full hasfixednavigation" : "p_uc hasfooter p_full hasfixednavigation p_nomore"}>
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center">
                    <div className="title">我的分期</div>
                </div>
                <div className="right">
                    
                </div>
            </div>
        </div>
    </div>
    <div> <ul className="w_cell_list bg_w">{list.length ? list.map(function(item, key) {
            if(item.status == 21 ) {
                return (
            <li key={key} className="w_cell_card">
                <div className="title">
                    <span>{item.course_name}</span>
                </div>
                <div className="time">
                    {item.ctime}
                </div>
                <dl className="row">
                    <dt>当前状态</dt>
                    <dd>{item.status_desc}</dd>
                </dl>
            </li>
                )
            } else {
                return (
            <li key={key} className="w_cell_card">
                <div className="title">
                    <span>{item.course_name}</span>
                </div>
                <div className="time">
                     {item.ctime}
                </div>
                <dl className="row">
                    <dt>当前状态</dt>
                    <dd>{item.status_desc}</dd>
                </dl>
                <dl className="row">
                    <dt>贷款金额</dt>
                    <dd>￥{item.money_apply}</dd>
                </dl>
                <dl className="row">
                    <dt>还款日期</dt>
                    <dd>{item.pay_time}</dd>
                </dl>
                <dl className="row">
                    <dt>还款金额</dt>
                    <dd>¥ {item.next_money_principal}
                        <a href={"http://pay.kezhanwang.cn/app/apploan/getdetail?lid="+ item.id} className="link">还款明细</a>
                    </dd>
                </dl>
            </li>
                    )
            }
        })
    : no_couse}
        </ul>
        
    </div>
    <GoTopComponent />
    <FooterComponent></FooterComponent>
</div>

        )
    }
});


module.exports = Page;


    