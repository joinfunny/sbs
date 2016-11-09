'use strict';

var React = require('react');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var FooterComponent = require('../react_components/footer.jsx');
var LoadingImg = require('../react_components/img_loading.jsx');
var StarsComponent = require('../react_components/stars.jsx');
var GoTopComponent = require('../react_components/go_top.jsx');
var GoBackMixins = require('../react_mixins/goback.js');
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
            list: this.props.data || [],
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
        var no_couse = (
            <li className="tx_c no_more">
                <div><img src="http://res1.kezhanwang.cn/static/mh5/images/no_school_28dc51.png" /></div>
                <p>抱歉，暂无合适学校</p>
            </li>
        );
        return (
           
<div className={list.length ? "p_uc hasfooter hasfixednavigationtab p_full" : "p_uc hasfooter hasfixednavigationtab p_full p_nomore"}>
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a className="left">
                    <b className="back" onClick={this.goBack}></b>
                </a>
                <div className="center">
                    <div className="title">我的收藏</div>
                </div>
                <div className="right">
                    
                </div>
            </div>
            <ul className="w_uc_tabs">
                <li>
                    <a href="/usercenter/favorite" className="ps">课程</a>
                </li>
                <li className="active">
                    <a href="/usercenter/favorite/school" className="ps">学校</a>
                </li>
            </ul>
        </div>
    </div>

    <div>
        <ul className="w_cell_list bg_w">
        {list.length ? (list.map(function(item, key) {
                return (<li key={key} className="w_cell">
                	<a href={cityJpy+"/baseschool/detail-"+item.orgaid+".html"} className="flex_w ps">
		                {item.is_listen ? <b className="st"></b> : ''}
		                <LoadingImg src={'http://image.kezhanwang.cn/'+item.logosrc} className="cover" />
		                <div className="item">
		                    <div className="name">
		                        <span>{item.organame}</span>
		                    </div>
		                    <div className="info">
                                {false&&'暂时注释掉'?(<StarsComponent number={item.score} hasWord="true"/>):''}
                                <span className="sarea">{item.county}</span>
                            </div>
		                    <div className="opt">
		                        <div className="grid_4">
		                            <div className="tx_r">
		                                <b className="icon icon_heart_a"></b> {item.followtimes}
		                            </div>   
		                        </div>
		                    </div>
		                </div>
		            </a>
                </li>)
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