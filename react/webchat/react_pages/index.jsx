'use strict';

var React = require('react');
var FooterComponent = require('../react_components/footer.jsx');
var SliderComponent = require('../react_components/slider.jsx');
var HotnewsComponent = require('../react_components/hot_news.jsx');
var GoTopComponent = require('../react_components/go_top.jsx');
var LoadingImg = require('../react_components/img_loading.jsx');


var Page = React.createClass({
    getDefaultProps: function() {
        return {
            app: {},
            getSEO: function() {
                var data = this.data;
                var city = data.userArea;
                return {
                    title : '【'+(city.short_name||'')+'培训】_机构_课程 - 课栈网',
                    keywords : city.short_name+'培训机构,'+city.short_name+'培训课程',
                    description : '课栈网'+city.short_name+'频道专注各类培训主要介绍内容有：'+city.short_name+'培训机构,'+city.short_name+'培训课程等内容，找'+city.short_name+'相关培训就上课栈网.'
                }
            }
        };
    },
    search: function(e) {
        if(e.keyCode == 13) {
            this.props.app.navigate('/course?wd='+e.currentTarget.value);
        }
    },
    componentDidMount: function() {
        this.record = new this.props.app.Models.Search({type:'record'});
        this.record.clearHistory();
    },
    render: function() {
        var data = this.props.data;
        return (
<div className="p_index p_full hasfooter">
    <div className="header">
        <div className="header_bar">
            <a href="/city" className="area ps">
                <span href="javascript:void(0)">{data.userArea.name}</span>
                <b className="arrow_down"></b>
            </a>
            <div className="search">
                <b className="icon icon_magnifier"></b>
                <input type="text" placeholder="输入想要搜索的课程名称" onKeyUp={this.search} />
            </div>
            <div className="uc">
                <a href="/usercenter" className="ps dis_b">
                    <b className="uc_icon"></b>
                </a>
            </div>
        </div>
        <SliderComponent className="w_slider" data={data.ad_list || []} />
    </div>
    <div className="menu">
        <div className="content">
            <ul className="clearfix">
                {data.cate_list && data.cate_list.map((item, key) => {
                    return (
<li key={key}>
    <a href={item.url} className="ps">
        <span className="menu_icon">
            <img src={'http://image.kezhanwang.cn/'+item.s_logo} />
        </span>
        <span className="name">{item.name}</span>
    </a>
</li>
                    )
                })}
                <li>
                    <a href="/category" className="ps">
                        <span className="menu_icon three_point"><b></b></span>
                        <span className="name">更多分类</span>
                    </a>
                </li>
            </ul>
            <HotnewsComponent data={data.article_list} />
        </div>
    </div>
{data.listen_courseList && data.listen_courseList.length ? (
    <div className="floor f_shiting">
        <div className="f_title">
            <b className="flag"></b>
            <span className="name">试听活动</span>
        </div>
        <div className="f_content clearfix">
            {data.listen_courseList.map((item, key) => {
                return (
                    <div className="block" key={key}>
                    <a href={"http://www.kezhanwang.cn/m/mshiting/Act?aid="+item.id}>
                        <div className="imgbox">
                            <LoadingImg src={item.small_pic[0]} />
                            <div className="course_name">{item.title}</div>
                        </div>
                        <div className="time_addr">
                            <p className="mt10"><b className="icon icon_time"></b>{item.start_time.substr(0, 16)} - {item.end_time.substr(11, 5)}</p>
                            <p><b className="icon icon_addr"></b>{item.location}</p>
                        </div>
                    </a>
                    </div>
                )
            })}
        </div>
        <div className="more">
            <a href="http://www.kezhanwang.cn/m/mshiting/activity">
                <span>查看更多试听活动</span>
                <b className="icon icon_arr_r f_right"></b>
            </a>
        </div>
    </div>
) : ''}
{data.courseList && data.courseList.map((list, key) => {
        return (
            <div key={key} className="floor f_course">
                <div className="f_title">
                    <b className="flag"></b>
                    <span className="name">{list.categname}</span>
                </div>
                <div className="f_content">
                    <ul className="w_cell_list bg_w">
                        {list.courses && list.courses.map(function(item, key) {
                            return (
                                <li key={key} className="w_cell">
                                    <a href={"/course/detail?id="+item.productid} className="ps flex_w">
                                    {item.is_listen ? <b className="st"></b> : ''}
                                    <LoadingImg src={'http://image.kezhanwang.cn/'+item.imgsrc} className="cover" />
                                    <div className="item">
                                        <div className="name">
                                            {item.productname}
                                        </div>
                                        <div className="sname">{item.organame}</div>
                                        <div className="opt">
                                            <span className="price"><b>￥</b> {item.price/100}</span>
                                            <span className="related">
                                                <b className="icon icon_fav_u"></b><span className="fav">{item.browsetimes}</span>
                                            </span>
                                        </div>
                                    </div>
                                    </a>
                                </li>
                            )
                        })}
                    </ul>
                    <div className="more">
                        <a href={"/"+data.userArea.code+"/course?categoneid="+list.categid} className="ps">
                            <span>查看更多课程</span>
                            <b className="icon icon_arr_r f_right"></b>
                        </a>
                    </div>
                </div>
            </div>
        )
    })}
    <div className="mb20"></div>
    <GoTopComponent />
    <FooterComponent />
</div>
        );
    }
});

module.exports = Page;