'use strict';

var React = require('react');
var FooterComponent = require('../react_components/footer.jsx');
var GoTopComponent = require('../react_components/go_top.jsx');
var SliderComponent = require('../react_components/slider.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {},
            data: {},
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
            cateList: this.props.data.cateList || {},
            adList: this.props.data.adList || [],
            list: this.props.data.result || [],
            automatic: true,
            pending: false,
            page: {
                p: 1,
                cateid2: this.props.data.cateid2,
                cateid3: this.props.data.cateid3,
                hasnext: this.props.data.result.length > 0
            }
        }
    },
    goTop: function() {
        window.scrollTo(0, 0);
    },
    componentDidMount: function() {
        var component = this;
        var app = component.props.app;
        component.model = new app.Models.NewsListHot();

        if($('.one .active').length){
            $('.one').scrollLeft($('.one .active').position().left - $(window).width()/2 + $('.one .active').width()/2);
        };
        $(window).on('scroll.news_list', function() {
            if(($(window).scrollTop() + $(window).height()) >= ($(document.body).height() - 10)) {
                component.fetchMore();
            }
        });

        component.record = new app.Models.Search({type:'record'});
        component.recordData = component.record.getHistory();
        if(component.recordData.length == 0){
            return false;
        }
        component.recordData = JSON.parse(component.recordData);
        if(component.recordData.data.page.cateid2 == component.state.page.cateid2 && component.recordData.data.page.cateid3 == component.state.page.cateid3 ){
            component.setState(component.recordData.data);
        }else{
            component.recordData.top = 0;
        }

        setTimeout(function() {
            window.scrollTo(0, component.recordData.top || 0);
        });
    },
    componentWillUnmount: function() {
        var view = this;
        var top = $(window).scrollTop();
        var pageData = {
            top: top,
            data: view.state
        };
        var pageDataStr = JSON.stringify(pageData);
        view.record.clearHistory();
        view.record.setHistory(pageDataStr);
        $(window).off('scroll.news_list');
    },
    clickFetchMore: function (){
        this.state.automatic = true;
        this.fetchMore();
    },
    fetchMore: function() {
        var props = this.props;
        var state = this.state;
        var view = this;

        if(state.page.hasnext && !state.pending && state.automatic) {

            this.model.set('p', state.page.p+1)
            this.model.set('cateid2', state.page.cateid2)
            this.model.set('cateid3', state.page.cateid3)
            
            this.setState({
                pending: true
            });
            this.model.fetchNext().then(function(data) {
                var state = view.state;

                view.setState({
                    list: state.list.concat(data.result),
                    page: {
                        p: state.page.p+1,
                        cateid2: state.page.cateid2,
                        cateid3: state.page.cateid3,
                        hasnext: data.result.length > 0
                    },
                    automatic: (state.page.p+1)%4!=0,
                    pending: false,
                    reload: false
                });
            });
        }
    },
    render: function() {
        var state = this.state;
        var list = state.list;
        var cateList = [];
        var cateSon = [];
        var page = state.page;
        var more = '';
        for(var i in state.cateList){
            cateList.push(state.cateList[i]);
        }
        if(state.cateList[page.cateid2] && state.cateList[page.cateid2].childList && state.cateList[page.cateid2].childList.length != 0){
            for(var i in state.cateList[page.cateid2].childList){
                cateSon.push(state.cateList[page.cateid2].childList[i]);
            }
        }
        if(!page.hasnext) {
            more = (
                <div className="tx_c no_more">
                    没有更多信息了
                </div>
            );
        } else {
            more = (
                <div className="tx_c no_more" onClick={this.clickFetchMore}>
                    {state.automatic ? '正在加载更多信息...' : '点击查看更多资讯'}
                </div>
            );
        }

        return (
<div className="p_news p_full hasfixednavigation">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center">
                    <div className="title">资讯</div>
                </div>
                <a href="/" className="right ps">
                    <b className="icon icon_house vam"></b>
                </a>
            </div>
        </div>
    </div>
    <div className="p_news_head">
        <div className="one">
            {cateList.map((item, key) => {
                if(page.cateid2 == item.categid){
                    return (
                        <a key={key} data-id={item.categid} className="active">{item.categname}</a>
                    )
                }else {
                    return (
                        <a key={key} href={'/news?cateid2='+item.categid}>{item.categname}</a>
                    )
                }
            })}
        </div>
        <div className="two">
            {
                cateSon.map((item, key) => {
                    if(item.categid == page.cateid3){
                        return (
                            <a  key={key} className="active">{item.categname}</a>
                            )
                    }else{
                        return (
                            <a  key={key} href={'/news?cateid2='+page.cateid2+'&cateid3='+item.categid}>{item.categname}</a>
                            )
                    }
                })
            }
        </div>
    </div>
    <div className="p_news_slider">
        {state.adList.length > 0?(
                <SliderComponent className="w_slider" data={state.adList || []} />
            ):""
        }
    </div>
    <div className="p_news_list">
        <div className="news_list">
            <div className="list">
                <ul>
                {list.map((item, key) => {
                    var catepy = item.catepy ? item.catepy+'/' : '';
                    var content = item.content.substring(0,45) + '...';
                    var nowDate = new Date();
                    var UpTime = new Date(item.formatUpdatetime);
                    var formatUpdatetime = '很久以前';
                    if(nowDate.toLocaleDateString() != UpTime.toLocaleDateString()){
                        var date = parseInt((nowDate - UpTime)/1000/60/60/24);
                        if(date < 30){
                            formatUpdatetime = (date + 1) + '天前';
                        }else if( 30 < date < 90){
                            formatUpdatetime = parseInt((date + 1)/30) + '月前';
                        }
                    }else {
                        var date = parseInt((nowDate - UpTime)/1000/60) ;
                        if(date == 0){
                            formatUpdatetime = '刚刚';
                        }else if(date < 60){
                            formatUpdatetime = date + '分钟前';
                        }else{
                            formatUpdatetime = parseInt(date/60) + '小时前';
                        }
                    }                   
                        return (
<li key={key} className="agency">
    <a  href={'/news/'+catepy+item.newsid+'.html'} className="ps">
        <div className="flex">
            <div className="items">
                <div className="name tx_unbr2">{item.title} </div>
                <div className="content">{ content }</div>
                <div className="info">
                    <span className="re blue">{item.categname}</span>
                    <span className="times">{formatUpdatetime}</span>
                </div>
            </div>
        </div>
    </a>
</li>
                        )
                })}
                </ul>
            </div>
        </div>
    </div>
    <GoTopComponent />    
    {more}
    <FooterComponent />
</div>
        )
    }
});

module.exports = Page;