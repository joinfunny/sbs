'use strict';

var React = require('react');
var GoBackMixins = require('../react_mixins/goback.js');
var FooterComponent = require('../react_components/footer.jsx');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            data: {},
            getSEO: function() {
                var data = this.data;
                var description = data.result.content;
                try {
                    description = description.replace(/<[^>]+>/g,"");
                    description = description.replace(/&.*?;/g, "");
                    description = description.trim();
                } catch(e) {}
                return {
                    title : data.result.title+' - 课栈网',
                    keywords : data.result.title,
                    description : description.substr(0, 80)
                }
            },
            userAgent: false
        }
    },
    getInitialState: function() {
        try {
            var ua = this.props.userAgent || navigator.appVersion || '';
        } catch(e) {}
        return {
            html: this.format2rem(this.props.data.result.content || '', ua),
            // 简洁模式，没有头部
            concise: ua.match(/kezhan/gi),
            userAgent: ua
        }
    },
    format2rem: function(html, userAgent) {
        var dpr = 2;
        userAgent || (userAgent = this.state.userAgent);
        if(userAgent.match(/kezhan/gi)) {
            dpr = 1;
        }
        try {
            dpr = window.lib.flexible.dpr;
        } catch(e) {};
        var px2rem = function(d) {
            return parseFloat(d) / 64 + 'rem';
        }
        try {
            px2rem = lib.flexible.px2rem;
        } catch(e) {};

        html = html.replace(/style\=(\'|\")(.*?)(\'|\")/g, function(match, quoteFirst, style, quoteLast, index) {
            var styles = style.split(/\s*;\s*/);

            styles = styles.map((rule) => {
                if(!rule) return '';
                var key = (rule.split(':')[0] || '').trim();
                var value = (rule.split(':')[1] || '').trim();

                value = value.replace(/(\d+)px/g, function(px, number) {
                    number = parseFloat(number);

                    if(key == 'font-size') {
                        return dpr*number+'px';
                    } else {
                        return px2rem(number*2+'px');
                    }
                });

                return [key, value].join(':');
            });

            return 'style='+quoteFirst+styles.join(';')+quoteLast;
        });

        return html;
    },
    componentDidMount: function() {
        var html = this.props.data.result.content || '';

        this.setState({
            html: this.format2rem(html)
        });

        if(!this.state.concise) {
            $(window).on('scroll.news_detail touchmove.news_detail', function() {
                if($(window).scrollTop() > 88) {
                    $('.p_news_details').addClass('fixed');
                } else {
                    $('.p_news_details').removeClass('fixed');
                }
            });
        }
    },
    componentWillUnmount: function() {
        $(window).off('scroll.news_detail touchmove.news_detail');
    },
    render: function() {
        var state = this.state;
        var data = this.props.data;
        if(!data.result.tagNames){
            data.result.tagNames = [];
        }
        var concise = this.state.concise;
        var html = {
            __html: state.html
        };

        return (
<div className={"p_news p_full hasfooter "+(concise ? 'concise' : '')}>
    <div className="p_news_details">
        {!concise ? (
            <div className="w_top_fixed">
                <div className="centered">
                    <div className="w_navigation">
                        <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                            <b className="back"></b>
                        </a>
                        <div className="center">
                            <div className="title">资讯详情</div>
                        </div>
                        <a href="/" className="right ps">
                            <b className="icon icon_house vam"></b>
                        </a>
                    </div>
                </div>
            </div>
        ):''}

        <div className="news_content">
            <h1 className="title">{data.result.title}</h1>
            <div className="news_time">
                <span>{data.result.updatetime}</span>
                <span className="news_source">{data.result.source}</span>
            </div>
            <div className="details">
                <div dangerouslySetInnerHTML={html} />
            </div>
        </div>
        {!concise ? (
        <div className="p_news_list">
            <div className="news_list">
                <span className="news_title">相关资讯</span>
                <div className="list">
                    <ul>
        {data.articleRelate.map((item, key) => {
            var catepy = item.catepy ? item.catepy+'/' : '';
            var content = item.content ? item.content.substring(0,45) + '...':'';
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
        </div>) : ''}

    </div>
    {!concise ? (
    <FooterComponent />
    ) : ''}
</div>
        )
    }
});

module.exports = Page;