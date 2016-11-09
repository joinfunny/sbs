'use strict';

var React = require('react');

var FooterComponent = require('../react_components/footer.jsx');
var StarsComponent = require('../react_components/stars.jsx');
var GoTopComponent = require('../react_components/go_top.jsx');
var LoadingComponent = require('../react_components/loading.jsx');
var FilterOrder = require('../react_components/filter_order.jsx');
var FilterFilter = require('../react_components/filter_filter.jsx');
var FilterCircle = require('../react_components/filter_circle.jsx');
var FilterCate = require('../react_components/filter_cate.jsx');
var LoadingImg = require('../react_components/img_loading.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {},
            data: {},
            query: {},
            // getSEO: function() {
            //     var data = this.data;
            //     var city = data.userArea;

            //     if(data.cateName) { // 分类
            //         return {
            //             title: '【'+city.short_name+data.cateName+'培训】_课程_价格 - 课栈网',
            //             keywords: city.short_name+data.cateName+'培训,'+city.short_name+data.cateName+'课程,'+city.short_name+data.cateName+'价格',
            //             description: '课栈网提供精准的'+data.cateName+'机构及其相关详细信息,主要包含了:'+city.short_name+data.cateName+'培训,'+city.short_name+data.cateName+'课程,'+city.short_name+data.cateName+'价格等，第一时间获取'+data.cateName+'相关信息,就上课栈网.'
            //         }
            //     } else {
            //         return {
            //             title : '【'+city.short_name+'培训】_课程_价格 - 课栈网',
            //             keywords : city.short_name+'培训课程,'+city.short_name+'培训价格',
            //             description : '课栈网提供精准的'+city.short_name+'培训相关详细信息,主要包含了:'+city.short_name+'培训课程,'+city.short_name+'培训价格等，第一时间获取'+city.short_name+'培训信息,就上课栈网.'
            //         }
            //     }
            // },
        }
    },
    getInitialState: function() {
        var props = this.props;
        var query = this.props.query;
        var data = this.props.data;

        query.categoneid = query.categoneid || data.categoneid || '';
        query.categtwoid = query.categtwoid || data.categtwoid || '';
        query.categid = query.categid || data.categid || '';
        
        return {
            page: this.props.data.page || {},
            list: this.props.data.result || [],
            pending: false,
            reload: false,
            wd: decodeURIComponent(this.props.query.wd || ''),
            filter: '',
            query: query
        }
    },
    viewBeActive: function(query) {
        this.setState({
            wd: decodeURIComponent(query.wd || ''),
            query: query,
            page: {
                hasnext: 1,
                nowPage: 0
            },
            reload: true,
            list: [],
            filter: ''
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
            if(($(window).scrollTop() + $(window).height()) >= ($(document.body).height() - 10)) {
                component.fetchMore();
            }
        });
    },
    fetchMore: function() {
        var props = this.props;
        var state = this.state;
        var query = this.state.query;
        var view = this;
        this.model.set({
            wd: state.wd,
            p: state.page.nowPage+1,
            sort: query.sort || '',
            streetid: query.streetid || '',
            supporttrial: query.supporttrial || '',
            categid: query.categid || '',
            pageszie: 15
        });

        if(state.page.hasnext && !state.pending) {
            this.setState({
                pending: true
            });
            this.model.fetchNext().then(function(data) {
                var state = view.state;

                view.setState({
                    list: state.list.concat(data.result),
                    page: data.page,
                    pending: false,
                    reload: false
                });
            }, function() {
                view.setState({
                    pending: true
                });
            });
        }
    },
    componentWillUnmount: function() {
        $(window).off('scroll.course_search');
    },
    search: function(e) {
        var view = this;
        view.props.app.navigate('/search?type=course&cityName='+view.props.data.userArea.name);
    },
    hideFilter: function() {
        this.setState({filter: ''});
    },
    showFilter: function(ref) {
        return () => {
            this.setState({filter: ref});
        }
    },
    setFilter: function(type) {
        return (value) => {
            this.hideFilter();
            if(type == 'cateid') {
                var cate = value.split(',');
                var categid = cate[2] || cate[1] || cate[0];
            } else {
                var categid = this.state.query.categid || this.state.query.categtwoid || this.state.query.categoneid || '';
            }

            if(type == 'streetid') {
                var streetid = value;
            } else {
                var streetid = this.state.query.streetid || '';
            }

            if(type == 'sort') {
                var sort = value;
            } else {
                var sort = this.state.query.sort || '';
            }

            if(type == 'supporttrial') {
                var supporttrial = value;
            } else {
                var supporttrial = this.state.query.supporttrial || '';
            }

            var url = [
                '/course?wd='+encodeURIComponent(this.state.wd),
                'sort=' + sort,
                'categid=' + categid,
                'streetid=' + streetid
            ];
            this.props.app.navigate(url.join('&'));
        }
    },
    render: function() {
        var page = this.state.page;
        var query = this.state.query;
        var list = this.state.list;
        var state = this.state;
        var props = this.props;
        var more = '';
        var cityJpy = props.data.userArea ? '/' + props.data.userArea.code : '';

        if(!state.reload) {
            if(!page.hasnext) {
                more = (
                    <div className="tx_c no_more">
                        没有更多信息了
                    </div>
                );
            } else {
                more = (
                    <div className="tx_c no_more">
                        {state.pending ? '正在加载更多信息...' : '加载更多'}
                    </div>
                );
            }
        }

        var filter = '';
        if(state.filter == 'filterorder') {
            filter = <FilterOrder ref="filterorder" onChange={this.setFilter('sort')} sort={query.sort} type="course"  noChange={this.hideFilter} />
        }
        if(state.filter == 'filterfilter') {
            filter = <FilterFilter ref="filterfilter" onChange={this.setFilter('supporttrial')} supporttrial={query.supporttrial}  noChange={this.hideFilter} />
        }
        if(state.filter == 'filtercircle') {
            filter = <FilterCircle ref="filtercircle" onChange={this.setFilter('streetid')} areaid={query.streetid}  app={props.app} noChange={this.hideFilter} />
        }
        if(state.filter == 'filtercate') {
            var cateid = (query.categoneid || '') + ',' + (query.categtwoid || '') + ',' + (query.categid || '');
            filter = <FilterCate ref="filtercate" onChange={this.setFilter('cateid')} cateid={cateid} app={props.app} noChange={this.hideFilter}  />
        }

        return (
            <div className="p_course p_full hasfooter hasfixednavigationtab">
                <div className="w_top_fixed">
                    <div className="centered">
                        <div className="w_navigation">
                            <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                                <b className="back"></b>
                            </a>
                            <div className="center pl10 pr10">
                                <div className="search">
                                    <div className="wrap">
                                        <div className="label">
                                            <b className="icon icon_magnifier"></b>
                                        </div>
                                        <input placeholder="输入想要搜索的课程名称" readonly onClick={this.search} value={state.wd} />
                                    </div>
                                </div>
                            </div>
                            <a href="/" className="right ps">
                                <b className="icon icon_house vam"></b>
                            </a>
                        </div>
                        <ul className="w_tabs">
                            <li className={(query.categtwoid || query.categoneid || query.categid) ? 'active': ''} onClick={this.showFilter('filtercate')}>
                                <a href="javascript:void(0)">分类<b className="icon"></b></a>
                            </li>
                            <li className={(query.streetid) ? 'active': ''} onClick={this.showFilter('filtercircle')}>
                                <a href="javascript:void(0)">位置<b className="icon"></b></a>
                            </li>
                            <li className={(query.sort) ? 'active': ''} onClick={this.showFilter('filterorder')}>
                                <a href="javascript:void(0)">筛选<b className="icon"></b></a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div>

                    <ul className="w_cell_list bg_w">
                        {list.map((item, key) => {
                                return (
            <li key={key} className="w_cell">
                <a href={cityJpy+"/course/detail-"+item.productid+".html"} className="flex_w ps">
                {item.is_listen ? <b className="st"></b> : ''}
                <LoadingImg src={'http://image.kezhanwang.cn/'+item.imgsrc} className="cover" />
                <div className="item">
                    <div className="name">
                        <span>{item.productname}</span>
                    </div>
                    <div className="info">
                        <StarsComponent number={item.commentscore} />

                        <span className="sname">{item.organame}</span>
                    </div>
                    <div className="opt">
                        <span className="price"><b>￥</b> {item.price/100}</span>
                        <span className="related">
                            <b className="icon icon_fav_u"></b><span className="fav">{item.followtimes}人关注</span>
                        </span>
                    </div>
                </div>
                </a>
            </li>
                                )
                            })
                        }
                    </ul>

                    {more}
                </div>
                {filter}
                <GoTopComponent />
                <LoadingComponent show={this.state.reload}/>
                <FooterComponent></FooterComponent>
            </div>
        );
    }
});

module.exports = Page;