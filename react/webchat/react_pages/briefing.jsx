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
                var description = data.content;
                try {
                    description = description.replace(/<[^>]+>/g,"");
                    description = description.replace(/&.*?;/g, "");
                    description = description.trim();
                } catch(e) {}
                return {
                    title : data.title+' - 课栈网',
                    keywords : data.title,
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
            html: this.format2rem(this.props.data.content || '', ua),
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
        var html = this.props.data.content || '';

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
                        	{data.type == 'sch'?(
                        		<div className="title">机构简介</div>
                        		):''}
                        	{data.type == 'course'?(
                        		<div className="title">课程简介</div>
                        		):''}
                        </div>
                        <a href="javascript:void(0)" className="right">
                            
                        </a>
                    </div>
                </div>
            </div>
        ):''}
        <div className="news_content">
            <h1 className="title">{data.title}</h1>
            <div className="details">
                <div dangerouslySetInnerHTML={html} />
            </div>
        </div>
    </div>
    {!concise ? (
    <FooterComponent />
    ) : ''}
</div>
        )
    }
});

module.exports = Page;