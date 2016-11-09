'use strict';

var React = require('react');

var GoTopComponent = require('../react_components/go_top.jsx');
var GoBackMixins = require('../react_mixins/goback.js');
var LoadingImg = require('../react_components/img_loading.jsx');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getInitialState: function() {
        try {
            var ua = this.props.userAgent || navigator.appVersion || '';
        } catch(e) {var ua = ''}
        return {
            // 简洁模式，没有头部
            concise: ua.match(/kezhan/gi),
        }
    },
    render: function() {
        var concise = this.state.concise;
        var imgArr = ["http://app.kezhanwang.cn/html/about/img/about_img01.png", "http://app.kezhanwang.cn/html/about/img/about_img02.png"];
        return (
            <div className="p_about">
                {!concise?(<div className="w_top_fixed">
                    <div className="w_navigation">
                        <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                            <b className="back"></b>
                        </a>
                        <div className="center">
                            <div className="title">关于我们</div>
                        </div>
                        <div className="right">
                        </div>
                    </div>
                </div>):''}
                <div className="free">
                    <div className="content">
                        <p>
                            <strong>北京弟傲思时代信息技术有限公司</strong>是一家致力于为培训机构和学生提供多赢服务，运作前所未有的一站式解决方案，打造教育培训行业B2C生态圈。<br />
                        </p>
                        <h1>我们的主旨</h1>
                        <p>1、深度挖掘培训教育市场潜力，用积极的金融产品开拓培训市场，使更多学生参与到教育培训学习中。</p>
                        <p>2、探索培训行业规范化发展，通过有趣、有用的教育资讯帮助学生优化课程选择，为优秀机构赢得口碑和业绩，使成长中机构带来更多生源机会和进益。最终把市场潜力变成机构订单，让学生理想成为现实。</p>
                        <h1>我们的潜力</h1>
                        <p>天使轮获得2000万人民币战略投资，天使+获得3000万人民业务专项资金。</p>
                        <h1>我们的资金支持</h1>
                        <p className="txtInt_no">
                            <LoadingImg src={imgArr[0]} className="img01" />
                            <LoadingImg src={imgArr[1]} className="img01" />
                        </p>
                        <p className="txtInt_no">
                            <span>软银赛富</span>
                            <span>瑞金麟（淘宝、京东的深度合作方）</span>
                        </p>
                        <h1>我们的团队</h1>
                        <p>CEO北大金融学学士，CFO人大本科、英国考文垂大学财务管理硕士，创业团队半数以上国内排名前十名校。</p>
                        <h1>我们的愿景</h1>
                        <p>在互联网+的时代，教育平台不该跟风一头栽进线上业务中寻求资本青睐，也不能在线下教育的地盘里画地为牢吃老本。弟傲思不愿做踩着别人成长的革命者，而愿意做改良派，以全新视角切入线上平台，整合信息，积极开展与线下的教育机构的深度合作，以稳健的方式建立更有活力、更持久的开放式共赢教育平台，与机构、学生、以及同行业的小伙伴们共同成长。</p>
                    </div>
                </div>
                <GoTopComponent />
            </div>
        );
    }
});

module.exports = Page;