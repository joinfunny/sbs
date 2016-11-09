'use strict';

var React = require('react');
var TabbarComponent = require('../react_components/course_tabbar.jsx');
var StarsComponent = require('../react_components/stars.jsx');
var LoadingImg = require('../react_components/img_loading.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        // return {
        //     getSEO: function() {
        //         var data = this.data;

        //         return {
        //             title : data.base.name+' - 课栈网',
        //             keywords : data.base.name,
        //             description : '课栈网提供全方位的'+data.base.name+'服务,包括了'+data.base.name+'培训机构等相关信息,了解更多的'+data.base.name+'培训相关问题就上课栈网.'
        //         }
        //     }
        // }
    },
    getInitialState: function() {
        return {
            model: {},
            introExpand: false,
            focusNum: this.props.data.base.grade
        }
    },
    tabbarChange: function(type) {
        var focusNum = this.state.focusNum || this.props.data.base.grade;

        if(type.isFocus) {
            focusNum = Number(focusNum) + 1;
        } else {
            focusNum = Number(focusNum) - 1;
        }

        this.setState({focusNum: focusNum});
    },
    toggleIntro: function() {
        var state = this.state;

        this.setState({
            introExpand: !state.introExpand
        });
    },
    componentDidMount: function() {
        var data = this.props.data;
        var userid = this.props.userid || 0;
        var model = new kzApp.Models.School({
            id: data.base.orgaid,
            userid: userid
        });
        
        this.setState({model: model});
    },
    render: function() {
        var data = this.props.data;
        var base = data.base;
        var state = this.state;
        var props = this.props;
        var cityPrefix = data.userArea && data.userArea.jpy ? ('/' + data.userArea.jpy) : '';


        return (
<div className="p_course p_full hasfixedtabbar">
    <a href="javascript:void(0)" className="goback" onClick={this.goBack}>
        <b className="icon icon_news_left"></b>
    </a>
    <div className="header">
        <img src={'http://image.kezhanwang.cn/'+base.logosrc} />
        <div className="intro">
            <div className="flex">
                <div className="flex_1">
                    <h1 className="name">{base.organame}</h1>
                    <div className="mt10 tx_lh_1">
                        {false&&'暂时注释掉'?(<StarsComponent number={base.score} hasWord="true" />):''}
                        <span className="focus">
                            <b className="icon icon_heart vat"></b>关注{base.followtimes}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <ul className="list class_local">
        <li>
            <a href={cityPrefix+"/map/"+base.orgaid+".html"} className="ps wrapper">
                <dl>
                    <dt>
                        <b className="location"></b>           
                    </dt>
                    <dd className="flex">
                        <div className="mulitline">
                            {base.address} 
                        </div>
                        <div className="flex_1 tx_r">
                            <b className="icon icon_arr_right vam"></b>
                        </div>
                    </dd>
                </dl>
            </a>
        </li>
        <li>
            <dl>
                <dt>
                    <b className="tel"></b><a href={"tel:"+('400-002-9691'||base.phone)} >{'400-002-9691'||base.phone}</a>            
                </dt>
            </dl>
        </li>
    </ul>
    <ul className="list class_recomd">
        <li>
            <div>
                <dl>
                    <dt>
                        本校课程
                    </dt>
                    <dd className="tx_r ">
                        <a href={cityPrefix+"/school/"+base.orgaid+".html"} className="ps dis_b">
                            <span className="subname">全部{base.skucount}门课程</span><b className="icon icon_arr_right vam"></b>
                        </a>
                    </dd>
                </dl>
            </div>
        </li>
        <li className="pt20">
            <div className="courses clearfix">
        { data.course ? (
            data.course.map((item, key) => {
                if(key > 3) return '';
                return (
<dl key={key}>
    <a href={cityPrefix+'/course/detail-'+item.productid+'.html'} className="ps" >
    <dt>
        <LoadingImg src={'http://image.kezhanwang.cn/'+item.imgSrc} />
    </dt>
    <dd>
        {item.productname}
    </dd>
    </a>
</dl>
                )
            })
        ): ''}
            </div>
        </li>
    </ul>

    <ul className="list agency_info">
        <li className="one_row">
            <dl>
                <dt>
                    学校信息
                </dt>
                <a href={"/briefing/sch/"+base.orgaid+".html"} className="ps flex_1">
                <dd className="tx_r">
                    <b className="icon icon_arr_right vam"></b>
                </dd>
                </a>
            </dl>
        </li>
    </ul>

    <ul className="w_qa_list">
        {false && '本期暂时隐藏'?(<li className="navigation">
            <dl>
                <dt>用户评论</dt>
                <dd className="tx_r">

                </dd>
            </dl>
        </li>):''}
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
            <div className="pictures clearfix">
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
    {data.similar_schools.length ? (
    <ul className="list class_recomd">
        <li>
            同学们还喜欢
        </li>
        <li className="pt20 pb20">
            <div className="courses_3 clearfix">
            {data.similar_schools.map((item, key) => {
                return (
                <div key={key}>
                    <a href={cityPrefix+"/baseschool/detail-"+item.productid+".html"} className="ps">
                    <dl>
                        <dt>
                            <LoadingImg src={'http://image.kezhanwang.cn/'+item.imgsrc} />
                        </dt>
                        <dd>
                            {item.productname}
                        </dd>
                    </dl>
                    </a>
                    <StarsComponent number={item.score} hasWord="true" />
                </div>
                )
            })}
            </div>
        </li>
    </ul>
    ) : ''}
    <TabbarComponent isFocus={base.isFocus} app={props.app} model={state.model} onChange={this.tabbarChange}/>
</div>
        )
    }
});

module.exports = Page;