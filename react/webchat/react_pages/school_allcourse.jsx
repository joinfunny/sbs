'use strict';

var React = require('react');
var LoadingImg = require('../react_components/img_loading.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            // getSEO: function() {
            //     var data = this.data.schoolInfo;

            //     return {
            //         title: data.name+'本校全部课程 - 课栈网',
            //         keywords: data.name+'本校全部课程',
            //         description: data.short_desp
            //     }
            // }
        }
    },
    render: function() {
        var data = this.props.data.allcourses;

        return (
<div className="p_course p_full hasfixednavigation ">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <div className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </div>
                <div className="center pl10 pr10">
                    <div className="title">本校课程</div>
                </div>
                <div className="right ps">
                </div>
            </div>
        </div>
    </div>
    <ul className="allcourse clearfix">
        {data.map((item, key) => {
           return (
                <li key={key}>
                    <a href={"/course/detail-"+item.productid+".html"} className="ps">
                        <LoadingImg src={'http://image.kezhanwang.cn/'+item.imgSrc} />
                        <div className="name">{item.productname}</div>
                    </a>
                </li>
           ) 
        })}
    </ul>
</div>
        )
    }
});

module.exports = Page;