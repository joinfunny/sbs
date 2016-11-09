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
            query: query,
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
        this.model = new app.Models.CourseSearch(this.props.query);
        this.user = app.Models.User.singleton();
        $(window).on('scroll.course_search', function() {
            if(($(window).scrollTop() + $(document.body).height()) >= ($(document).height() - 10)) {
                component.fetchMore();
            }
        });
    },
    isShow: function() {
        $(this.refs.bg).eq(0).show();
        $(this.refs.digole).eq(0).show();
        this.cid = $(this.refs.btn).data("id");
    },
    delSubmit: function(e) {
        var view = this;
        $(view.refs.bg).eq(0).hide();
        $(view.refs.digole).eq(0).hide();
        this.user.delListen(view.cid).then(function() {
           /* $(view.refs.btn).parents('li').remove();*/
           location.reload();
            view.cid = "";
        });
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
    close: function() {
        $(this.refs.bg).eq(0).hide()
        $(this.refs.digole).eq(0).hide()
    },
    render: function() {
        var view = this;
        var query = this.state.query;
        var list = this.props.data;
        var state = this.state;
        var props = this.props;
        var cityJpy = props.data.userArea ? '/' + props.data.userArea.jpy : '';
        var more = '';
        var arrData = [];

        var no_couse = (
            <li className="tx_c no_more">
                <div><img src="http://res1.kezhanwang.cn/static/mh5/images/no_course_28506a.png" /></div>
                <p>暂时还没有报名的课程</p>
                <a href="/category" className="ps">去报名</a>
            </li>
        );

        for(var key in list) {
            arrData.push(list[key])
        }

        return (
<div className={arrData.length ? "p_uc hasfooter hasfixednavigationtab p_signup p_full" : "p_uc hasfooter hasfixednavigationtab  p_full p_signup p_nomore"}>
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center">
                    <div className="title">我的报名</div>
                </div>
                <div className="right">
                </div>
            </div>
            <ul className="w_uc_tabs">
                <li>
                    <a href="/usercenter/signup" className="ps">课程</a>
                </li>
                <li className="active">
                    <a href="/usercenter/signup/audition" className="ps">试听</a>
                </li>
            </ul>
        </div>
    </div>
    <div>
        <ul className="w_cell_list bg_w">
        {arrData.length ? (arrData.map(function(data, key) {
                return (
                    <li key={key} className="w_cell">
                        <a href={cityJpy+"/course/detail-"+data.cid+".html"} className="ps">
                            <div className="title">
                                <div>{data.schoolname}<em>&gt;</em></div>
                            </div>
                            <div className="flex_w">
                                {data.is_listen ? <b className="st"></b> : ""}
                                <LoadingImg src={data.course.logo} className="cover" />
                                <div className="item">
                                    <div className="name">
                                        <span>{data.course.name}</span>
                                    </div>
                                    <div className="info">
                                        <span className="price"><i>价格：</i><b>￥</b> {data.course.tuition}</span>
                                    </div>
                                    <div className="info">
                                        <span>试听时间：{data.money_time}</span>
                                    </div>
                                    <div className="info">
                                        <span>地址：{data.schooladdress}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                        <div className="btn_con">
                            <span ref="btn" data-id={data.cid} onClick={view.isShow}>取消试听</span>
                        </div>
                    </li>
                )
            })) : no_couse}
        </ul>
    </div>
    <div className="warp_bg" ref="bg" onClick={this.close}></div>
    <div className="digole" ref="digole">
        <div>是否取消试听？</div>
        <ul>
            <li className="true_btn" onClick={this.delSubmit}>确定</li>
            <li className="false_btn" onClick={this.close}>取消</li>
        </ul>
    </div>
    <GoTopComponent />
    <FooterComponent></FooterComponent>
</div>

        )
    }
});


module.exports = Page;