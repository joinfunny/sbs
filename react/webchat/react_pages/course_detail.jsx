'use strict';

var React = require('react');
var TabbarComponent = require('../react_components/course_tabbar.jsx');
var LoadingImg = require('../react_components/img_loading.jsx');
var GoBackMixins = require('../react_mixins/goback.js');
var Listen = require('../react_components/course_listen.jsx');
var StarsComponent = require('../react_components/stars.jsx');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            isLogin: false,
            // getSEO: function() {
            //     var data = this.data;

            //     return {
            //         title : data.name+' - 课栈网',
            //         keywords : data.name,
            //         description : '课栈网提供全方位的'+data.name+'服务,包括了'+data.name+'培训机构等相关信息,了解更多的'+data.name+'培训相关问题就上课栈网.'
            //     }
            // }
        }
    },
    getInitialState: function() {
        return {
            model: {},
            showListen: false,
            focusNum: ''
        }
    },
    componentDidMount: function() {
        var data = this.props.data;
        var userid = this.props.userid || 0;
        var model = new kzApp.Models.Course({
            id: data.productid,
            userid: userid
        });
        
        this.setState({model: model});
    },
    tabbarChange: function(type) {
        var focusNum = this.state.focusNum || this.props.data.num_focus;

        if(type.isFocus == 1) {
            focusNum = Number(focusNum) + 1;
        } else {
            focusNum = Number(focusNum) - 1;
        }

        this.setState({focusNum: focusNum});
    },
    render: function() {
        var data = this.props.data;
        var props = this.props;
        var state = this.state;
        var model = this.state.model;
        var buyLink = "http://www.kezhanwang.cn/m/morder/confirm?cid="+data.productid;
        var buyBtnLink = props.isLogin ? buyLink : "/login?jumpurl="+encodeURIComponent(buyLink);

        var cityPrefix = data.userArea && data.userArea.jpy ? ('/' + data.userArea.jpy) : '';

        var teachtimeTer = function(){
            if(data.packcount > 0 && data.unit != ""){
                return data.packcount + data.unit;
            }else if(data.smallpackcount > 0 && data.smallunit != ""){
                return '每' + data.unit + data.smallpackcount + data.smallunit
            }
        }
        return (
<div className="p_course p_full hasfixedtabbar">
    <a href="javascript:void(0)" className="goback" onClick={this.goBack}>
        <b className="icon icon_news_left"></b>
    </a>
    <div className="header">
        <img src={'http://image.kezhanwang.cn/'+data.imgsrc}/>
        <div className="intro">
            <div className="name">{data.productname}</div>
            <div className="agency">
                <span>{data.organame}</span>
                <span className="focus">
                    <b className="icon icon_heart vat"></b>关注{data.followtimes}
                </span>
            </div>
        </div>
    </div>
    <ul className="list class_info">
        <li>
            <span className="score">
                <StarsComponent number={data.score} />
            </span>
        </li>
        <li className="class_detail">
            学时：{teachtimeTer()}
            <div>
                价格：<span className="price">¥ {data.price/100}</span>
            </div>
            <a href="https://kezhan.kf5.com/kchat/22616?from=%E7%A7%BB%E5%8A%A8%E7%AB%99--%E8%AF%BE%E7%A8%8B%E8%AF%A6%E6%83%85%E9%A1%B5&group=29201" className="buy_btn">在线咨询</a>
        </li>  
    </ul>
    <ul className="list class_intro">
        <li className="one_row">
            <a href={"/briefing/course/"+data.productid+".html"} className="ps">
            <dl>
                <dt>
                    课程简介
                </dt>
                <dd className="tx_r">
                    <b className="icon icon_arr_right vam"></b>
                </dd>
            </dl>
            </a>
        </li>
    </ul>
    <ul className="list class_local">
        <li>
            <a href={cityPrefix+"/baseschool/detail-"+data.orgaid+'.html'} className="ps wrapper">
                <div>
                    <b className="flag"></b>
                </div>
                <div className="flex_1 mulitline">
                    {data.organame}
                </div>
                <div className="tx_r">
                    <b className="icon icon_arr_right vam"></b>
                </div>
            </a>
        </li>
        <li className="flex">
            <a href={cityPrefix+"/map/"+data.orgaid+".html"} className="ps wrapper">
                <div>
                    <b className="location"></b>
                </div>
                <div className="flex_1 mulitline">
                    {data.address}
                </div>
                <div className="tx_r">
                    <b className="icon icon_arr_right vam"></b>
                </div>
            </a>
        </li>
        <li>
            <b className="tel"></b>
            <a href="tel:400-002-9691" className="mr30">400-002-9691</a>
            {false && data.school_phone && data.school_phone.split(/\s+/).map((phone, key) => {
                return (
                    <a href={"tel:"+phone} key={key} className="mr30">{phone}</a>
                )
            })}
        </li>
    </ul>
    {data.course_list? (
    <ul className="list class_recomd">
        <li>
            <div>
                推荐课程
            </div>
            <div className="courses clearfix">
                {data.course_list.map((item, key) => {
                    return (
                        <dl key={key}>
                            <a href={(data.userArea&&data.userArea.jpy?'/'+data.userArea.jpy:'')+"/course/detail-"+item.productid+".html"} className="ps">
                            <dt>
                                <LoadingImg src={'http://image.kezhanwang.cn/'+item.imgSrc}/>
                            </dt>
                            <dd>
                                {item.productname}
                            </dd>
                            </a>
                        </dl>
                    )
                })}
            </div>
        </li>
    </ul>
    ) : ''}
    {false ? (
    <ul className="w_qa_list">
        <li className="navigation">
            <dl>
                <dt>用户评论</dt>
                <dd className="tx_r">

                </dd>
            </dl>
        </li>
        {data.comment.map((item, key) => {
            return (
                <li className="w_qa" key={key}>
                    <div className="user">
                        <LoadingImg className="avatar" src={item.user_pic} />
                        <div className="name">
                            {item.user_name}
                        </div>
                        <span className="time">
                            {item.ctime}
                        </span>
                    </div>
                    <div className="question">
                        {item.content}
                    </div>
                    <dl className="opt">
                        <dt></dt>
                        <dd className="tx_r">
                            <a href="javascript:void(0)" className="ml20 vat">
                                <b className="icon icon_zan mr10"></b>{item.num_up}
                            </a>
                            <a href="javascript:void(0)" className="ml20">
                                <b className="icon icon_unzan vab mr10"></b>{item.num_down}
                            </a>
                        </dd>
                    </dl>
                </li>
            )
        })}
    </ul>
    ) : ''}
    <TabbarComponent data={data} isFocus={data.isFocus} isListen={data.is_listen} model={model} onChange={this.tabbarChange} onClick={(type)=>{if(type=='shiting'){this.setState({showListen: true})}}} />
    {state.showListen ? (
    <Listen data={data} hide={()=>{this.setState({showListen: false})}}/>
    ):''}
</div>
        );
    }
});

module.exports = Page;