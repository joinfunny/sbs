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

        $(window).on('scroll.course_search', function() {
            if(($(window).scrollTop() + $(document.body).height()) >= ($(document).height() - 10)) {
                component.fetchMore();
            }
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
    render: function() {
        var query = this.state.query;
        var list = this.state.list;
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
<div className={arrData.length ? "p_uc hasfooter hasfixednavigationtab p_full" : "p_uc hasfooter hasfixednavigationtab p_full p_nomore"}>
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
        </div>
    </div>
    <div>
        <ul className="w_cell_list bg_w">
        {arrData.length ? (arrData.map(function(data, key) {
                return (
                    <li key={key} className="w_cell">
                        <a href={cityJpy+"/course/detail-"+data.id+".html"} className="flex_w ps">
                        {data.is_listen ? <b className="st"></b> : ''}
                        <LoadingImg src={data.logo} className="cover" />
                        <div className="item">
                            <div className="name">
                                <span>{data.name}</span>
                            </div>
                            <div className="info">
                                <StarsComponent number={data.score} />

                                <span className="sname">{data.school_name}</span>
                            </div>
                            <div className="opt">
                                <span className="price"><b>￥</b> {data.tuition}</span>
                                <span className="related">
                                    <b className="icon icon_fav_u"></b><span className="fav">{data.num_focus}人关注</span>
                                </span>
                            </div>
                        </div>
                        </a>
                    </li>
                )
            })) : no_couse}
        </ul>
    </div>
    <GoTopComponent />
    <FooterComponent></FooterComponent>
</div>

        )
    }
});


module.exports = Page;




